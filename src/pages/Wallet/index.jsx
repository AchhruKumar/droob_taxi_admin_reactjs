import {
  CommissionIcon,
  CountIcon,
  CreditCardIcon,
  SearchIcon,
  VerifyIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import MainLayout from "@/layouts/MainLayout";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { BsThreeDotsVertical } from "react-icons/bs";
import { deleteRequest, getRequest, postRequest } from "@/utils/http-client/axiosClient";
import { WALLET } from "@/utils/endPoints";
import { useSelector } from "react-redux";
import CustomTable from "@/components/ui/Table";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useToast } from "@/utils/toaster";

const WalletPage = () => {
  const login = useSelector((state) => state.login);
  const toast = useToast();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchWalletDetails = async (query = "") => {
    try {
      setLoading(true);
      const res = await getRequest(
        `${WALLET.DATA}/${login?.user?.resturant?.id}?search=${query}`
      );
      if (res?.data?.data?.wallet || res?.data?.data?.bankDetails) {
        setWallet(res.data?.data?.wallet);
        setTransactions(res.data?.data?.transactions || []);
        console.log("bankDetails", res.data?.data?.bankDetails);
        setBankDetails(res.data?.data?.bankDetails || []);
      }
    } catch (err) {
      console.error("Failed to fetch wallet details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (login?.user?.resturant?.id) {
      fetchWalletDetails();
    }
  }, [login]);

  const handleWithdraw = async () => {
    setFormError("");

    if (
      !withdrawAmount ||
      isNaN(withdrawAmount) ||
      parseFloat(withdrawAmount) <= 0
    ) {
      return setFormError("Please enter a valid withdraw amount");
    }
    if (!selectedBank) {
      return setFormError("Please select a bank account");
    }
    if (
      parseFloat(withdrawAmount) > parseFloat(wallet?.withdrawAmount || "0")
    ) {
      return setFormError("Withdraw amount exceeds available balance");
    }

    try {
      setSubmitting(true);
      const res = await postRequest(WALLET.WITHDRAW, {
        resturantId: login?.user?.resturant?.id,
        witdrawAmount: withdrawAmount,
        bankAccountId: selectedBank,
      });

      if (res.status === 200) {
        setWithdrawAmount("");
        setSelectedBank(null);
        toast.success(res.data.message);
        await fetchWalletDetails(); // refresh data
      } else {
        setFormError(res?.data?.message || "Failed to process withdraw");
      }
    } catch (err) {
      console.error("Withdraw request failed:", err);
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { label: "#", key: "id" },
    { label: "Total Amount", key: "totalAmount" },
    { label: "Commission Paid", key: "commisionPaid" },
    { label: "Amount Received", key: "amountRecieved" },
    {
      label: "Status",
      key: "resturantTransactionStatusEnum",
      render: (row) => {
        let statusClass = "";
        if (row.resturantTransactionStatusEnum === "pending")
          statusClass = "text-[#E68D26]";
        else if (row.resturantTransactionStatusEnum === "rejected")
          statusClass = "text-[#FF4D4F]";
        else if (row.resturantTransactionStatusEnum === "completed")
          statusClass = "text-[#26CD50]";

        return (
          <span
            className={`order-status text-xs font-medium px-2 py-1 rounded-full bg-current/18 inline-flex items-center ${statusClass}`}
          >
            {row.resturantTransactionStatusEnum}
          </span>
        );
      },
    },
  ];

  const maskAccount = (accountNumber) => {
    if (!accountNumber) return "";
    return "****" + accountNumber.slice(-4);
  };
  const handleDeleteBank = async (bankId) => {
    try {
      const res = await deleteRequest(`${WALLET.DELETE}/${bankId}`);
      if (res.status === 200) {
        toast.success(res.data.message || "Bank account deleted successfully");
        await fetchWalletDetails();
      } else {
        toast.error(res?.data?.message || "Failed to delete bank account");
      }
    } catch (err) {
      console.error("Failed to delete bank account:", err);
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="pb-5 mb-10 border-b flex justify-between items-center flex-wrap">
        <h2 className="text-[28px] font-medium">Wallet</h2>
        <Button className="md:!px-8" asChild>
          <Link to="/add-payment-mode">
            <FaPlus />
            Add Payment Mode
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-3 lg:grid-cols-3 gap-5 mb-10">
        <div className="card p-5 rounded-[.625rem] text-white bg-[#88C664] flex items-end justify-between">
          <div>
            <p className="text-xl font-semibold mb-12">Total Earnings:</p>
            <p className="text-3xl leading-none flex items-center gap-1">
              <CountIcon color="white" />{" "}
              {wallet ? wallet?.totalEarning : 0}
            </p>
          </div>
          <div className="earning-icon bg-white/20 rounded-full h-[3.125rem] w-[3.125rem] flex items-center justify-center">
            <CountIcon color="white" />
          </div>
        </div>

        <div className="card p-5 rounded-[.625rem] text-white bg-[#88C664] flex items-end justify-between">
          <div>
            <p className="text-xl font-semibold mb-12">Commission Paid:</p>
            <p className="text-3xl leading-none flex items-center gap-1">
              <CountIcon color="white" />{" "}
              {wallet ? wallet?.commissionPaid : 0}
            </p>
          </div>
          <div className="earning-icon bg-white/20 rounded-full h-[3.125rem] w-[3.125rem] flex items-center justify-center">
            <CommissionIcon />
          </div>
        </div>
      </div>


      <Tabs defaultValue="history">
        <TabsList className="bg-transparent p-0 mb-7">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw Amount</TabsTrigger>
          <TabsTrigger value="payment">Payment Mode</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <p className="text-md font-medium mb-7">Transaction History</p>
          <div className="p-2.5 rounded-[10px] shadow">
            <div className="flex justify-between items-center gap-3.5 mb-3.5">
              <div className="search relative w-full max-w-xs">
                <Input
                  type="search"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0 hover:ring-0 h-auto"
                  onClick={() => fetchWalletDetails(search)}
                >
                  <SearchIcon size={24} />
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                <Skeleton height={40} count={5} />
              </div>
            ) : (
              <CustomTable
                columns={columns}
                data={transactions}
                loading={loading}
                rowKey={(row) => row.id}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="withdraw" className="max-w-[540px]">
          <p className="text-md mb-1 font-medium">Withdraw Amount</p>
          <p className="text-sm text-gray-500 flex items-center gap-1 mb-7">
            Available for withdrawal:{" "}
            <span className="flex items-center gap-0.5 text-droobGray-900 font-medium">
              <CountIcon size="11px" /> {wallet?.withdrawAmount ?? "0"}
            </span>
          </p>

          {formError && (
            <p className="text-red-500 text-sm mb-3">{formError}</p>
          )}

          <div className="grid my-7">
            <div className="grid mb-7">
              <Label htmlFor="amount">Withdraw Amount</Label>
              <div className="relative">
                <Input
                  name="amount"
                  id="amount"
                  placeholder="00.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <CountIcon
                  size="24px"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                />
              </div>
            </div>
            <div className="grid">
              <Label>Select Account</Label>
              <Select
                value={selectedBank ?? ""}
                onValueChange={(val) => setSelectedBank(val)}
              >
                <SelectTrigger className="py-5 px-5 w-full border-0 shadow-none bg-droobGray-200 h-12">
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {bankDetails.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id.toString()}>
                      {bank.bankname} ({maskAccount(bank.accountNumber)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="px-5 py-4 border border-[#D8D8D8] rounded-[10px]">
            <p className="text-md mb-5">Note</p>
            <p className="text-sm text-[#808080] flex items-center gap-2.5">
              Processing Time:{" "}
              <span className="px-3 py-1 inline-flex bg-[#F5F5F5] text-[#1E1E1E] rounded-full">
                1-3 working days
              </span>
            </p>
            <p className="text-sm text-[#808080] flex items-center gap-2.5 mt-5">
              Security:{" "}
              <span className="text-[#1E1E1E]">
                All transactions are encrypted and secure
              </span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-7">
            <Button
              variant="outline"
              onClick={() => {
                setWithdrawAmount("");
                setSelectedBank(null);
                setFormError("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              disabled={submitting}
              onClick={handleWithdraw}
            >
              {submitting ? "Processing..." : "Confirm Withdraw"}
            </Button>
          </div>
        </TabsContent>

        {/* Payment Mode */}
        <TabsContent value="payment" className="max-w-[700px]">
          <p className="text-md mb-7 font-medium">Payment Mode</p>
          <div className="grid gap-5">
            {bankDetails.map((bank) => (
              <div
                key={bank.id}
                className="p-5 shadow-lg flex items-start justify-between rounded-[20px]"
              >
                <div className="flex items-start gap-5">
                  <div className="size-12 text-[#E6B926] bg-current/20 flex items-center justify-center rounded-full">
                    <CreditCardIcon className="text-current" />
                  </div>
                  <div>
                    <p className="mb-1 font-semibold">{bank.bankname}</p>
                    <p className="text-sm mb-1 text-droobGray-600 font-medium">
                      {maskAccount(bank.accountNumber)} • Bank Account
                    </p>
                    <p className="text-xs mb-1 text-droobGray-500">
                      Holder: {bank.accountHolderName}
                    </p>
                    <p className="text-xs p-2 rounded-full inline-flex items-center gap-1 text-[#26CD50] bg-[#26CD50]/20 font-medium">
                      <VerifyIcon /> Verified & Secure
                    </p>
                  </div>
                </div>
                <Menubar className="p-0 border-0">
                  <MenubarMenu>
                    <MenubarTrigger className="p-0 border-0 shadow-none focus:!bg-transparent">
                      <BsThreeDotsVertical />
                    </MenubarTrigger>
                    <MenubarContent>
                      {/* <MenubarItem>Edit</MenubarItem> */}
                      <MenubarItem
                        onClick={() => handleDeleteBank(bank.id)}
                        className="text-red-500"
                      >
                        Delete
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </div>
            ))}
            {!bankDetails.length && (
              <p className="text-sm text-gray-500">
                No bank accounts added yet.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default WalletPage;
