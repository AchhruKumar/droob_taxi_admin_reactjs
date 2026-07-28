// src/pages/MenuList.jsx
import { DeleteIcon, EditIcon, SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MainLayout from "@/layouts/MainLayout";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteRequest,
  getRequest,
  patchRequest,
} from "@/utils/http-client/axiosClient";
import { MENU } from "@/utils/endPoints";
import CustomSelect from "@/components/ui/CustomSelect";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { IMAGE_URL } from "@/utils/constants";
import { Switch } from "@/components/ui/switch";

import { useToast } from "@/utils/toaster";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import CustomTable from "@/components/ui/Table";

const DEFAULT_LIMIT = 5;
const DEBOUNCE_MS = 400;

function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    usp.append(k, String(v));
  });
  return usp.toString();
}

const MenuList = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getRequest(MENU.CATEGORY);
        const list = res?.data?.data?.categories || [];
        const opts = list.map((c) => ({ value: c.id, label: c.name }));
        if (alive) setCategoryOptions(opts);
      } catch (e) {
        console.error("Load categories failed", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(selectedCategory?.value
          ? { categoryId: selectedCategory.value }
          : {}),
      };
      const qs = buildQuery(params);
      const pathWithQuery = `${MENU.LIST}${qs ? `?${qs}` : ""}`;
      const res = await getRequest(pathWithQuery);
      const details = res?.data?.data?.details || [];
      const metaTotal = res?.data?.data?.total ?? 0;

      setRows(details);
      setTotal(metaTotal);
    } catch (err) {
      console.error("Fetch list failed", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedCategory]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory]);

  const handleAvailabilityChange = async (id, checked) => {
    setLoading(true);
    try {
      const payload = { isAvailable: checked };
      await patchRequest(`${MENU.AVAILABLE}/${id}`, payload);
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isAvailable: checked } : r)),
      );
      console.log(`Availability for ID ${id} updated to: ${checked}`);
    } catch (error) {
      console.error("Failed to update availability:", error);
    }
    setLoading(false);
  };

  const handleView = (row) => {
    navigate(`/edit-food/${row.id}`);
  };

  const openConfirmForId = (id) => {
    setPendingDeleteId(id);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    const id = pendingDeleteId;
    try {
      const res = await deleteRequest(`${MENU.DELETE}/${id}`);

      if (res.status === 200) {
        setConfirmOpen(false);
        toast.success(`Item has been deleted from menu`);
        setPendingDeleteId(null);
        fetchList();
        setDialogOpen(false);
      }
    } catch (error) {
      toast.error(`Error occurred while deleting item`);
      console.log(error);
    }
  };

  const totalPages = useMemo(() => {
    if (!total || !limit) return 1;
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  const totalPagesSafe =
    Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1;
  const canPrev = page > 1;
  const canNext = page < totalPagesSafe;
  const onPrev = () => canPrev && setPage((p) => p - 1);
  const onNext = () => canNext && setPage((p) => p + 1);
  const onGoto = (p) => setPage(p);

  const columns = [
    {
      label: "#",
      key: "id",
      headerClassName: "w-[80px]",
      render: (row) =>
        loading ? <Skeleton width={40} /> : row.id || <span>-</span>,
    },
    {
      label: "Name",
      key: "name",
      render: (row) =>
        loading ? (
          <div className="flex items-center gap-3 w-full">
            <Skeleton height={40} width={56} />
            <div className="flex-1">
              <Skeleton width="60%" />
            </div>
          </div>
        ) : (
          <div
            onClick={() => navigate(`/food-detail/${row.id}`)}
            className="flex gap-3 items-center cursor-pointer hover:text-primary transition-colors"
          >
            {row.media && (
              <img
                src={`${IMAGE_URL}/${row.media}`}
                alt={row.name}
                className="h-10 w-14 object-cover rounded"
              />
            )}
            <span className="capitalize">{row.name}</span>
          </div>
        ),
    },
    // ✅ REPLACED: Combined Price columns into dynamic "Starting Price" column
    {
      label: "Starting Price",
      key: "startingPrice",
      render: (row) => {
        if (loading) return <Skeleton width={70} />;

        // If customized, or has variants, fallback to first variant's final price
        if (row.isMenuCustomized || (row.variantCount && row.variantCount > 0)) {
          // If variants layout data contains items or direct price info, use it. 
          // Assuming backend drops data or variant price inside row metadata if true.
          return row.finalPrice && row.finalPrice !== "0.00" && row.finalPrice !== "0"
            ? `${row.finalPrice}`
            : "0";
        }

        // Standard item base fallback price display
        return row.finalPrice || row.price || "-";
      },
    },
    {
      label: "Category",
      key: "categoryName",
      render: (row) =>
        loading ? <Skeleton width={100} /> : row.categoryName || "-",
    },
    {
      label: "Type",
      key: "type",
      render: (row) =>
        loading ? (
          <Skeleton width={100} />
        ) : (
          <span
            className="capitalize"
            style={{ color: row.type === "veg" ? "green" : "red" }}
          >
            {row.type}
          </span>
        ),
    },
    {
      label: "Variants",
      key: "variants",
      render: (row) =>
        loading ? (
          <div className="flex flex-col gap-1">
            <Skeleton width={60} height={14} />
            <Skeleton width={120} height={10} />
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-slate-800">
              {row.variantCount || 0} Variants
            </span>
            {row.variantNamesString ? (
              <span 
                className="text-xs text-muted-foreground max-w-[180px] truncate capitalize" 
                title={row.variantNamesString}
              >
                {row.variantNamesString}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">No variants added</span>
            )}
          </div>
        ),
    },
    {
      label: "Availability",
      key: "isAvailable",
      className: "text-center",
      render: (row) =>
        loading ? (
          <div className="flex justify-center">
            <Skeleton width={80} />
          </div>
        ) : (
          <Switch
            checked={row.isAvailable}
            onCheckedChange={(checked) =>
              handleAvailabilityChange(row.id, checked)
            }
          />
        ),
    },
    {
      label: "Action",
      key: "action",
      render: (row) =>
        loading ? (
          <div className="flex gap-3">
            <Skeleton width={24} height={24} />
            <Skeleton width={24} height={24} />
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={() => handleView(row)}
              variant="ghost"
              className="!p-0 !h-auto"
            >
              <EditIcon className="size-5" />
            </Button>
            <Button
              variant="ghost"
              className="!p-0 !h-auto"
              onClick={() => openConfirmForId(row.id)}
              aria-label={`Delete item ${row.id}`}
            >
              <DeleteIcon className="size-5" />
            </Button>
          </div>
        ),
    },
  ];

  return (
    <MainLayout>
      <div className="pb-5 mb-10 border-b flex justify-between items-center flex-wrap">
        <h2 className="text-[28px] font-medium">Menu List</h2>
        <Button className="md:!px-8" asChild>
          <Link to="/add-new-food">
            <FaPlus />
            Add New Menu
          </Link>
        </Button>
      </div>

      <div className="p-2.5 rounded-[10px] shadow">
        <div className="flex flex-wrap gap-3.5 mb-3.5 items-end">
          <div className="search relative">
            <Input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 !p-0 !pe-2 hover:ring-0 h-auto"
              onClick={() => setDebouncedSearch(search.trim())}
              aria-label="Search"
            >
              <SearchIcon size={24} />
            </Button>
          </div>

          <div className="min-w-[220px]">
            <CustomSelect
              name="categoryFilter"
              label="Category"
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="All categories"
              isClearable
            />
          </div>

          <div className="ml-auto">
            <label className="block text-sm mb-1">Page size</label>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value) || DEFAULT_LIMIT);
                setPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        <CustomTable
          columns={columns}
          data={rows}
          loading={loading}
          stickyHeader
          pagination={{
            page,
            totalPages: totalPagesSafe,
            onPrev,
            onNext,
            onGoto,
            renderNumbers: true,
          }}
          limit={limit}
          onLimitChange={(val) => {
            setLimit(val);
            setPage(1);
          }}
        />
      </div>

      <ConfirmationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDelete={handleConfirmDelete}
        triggerText="Sign up"
        triggerClass="w-full"
        title="Delete confirmation"
        description="Are you sure you want to delete this item from menu."
        linkTo="/login"
        linkText="Okay"
        triggerVariant="default"
        isDelete={true}
      />
    </MainLayout>
  );
};

export default MenuList;