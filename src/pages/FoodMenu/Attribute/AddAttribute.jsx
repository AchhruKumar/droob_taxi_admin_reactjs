import React, { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Trash2 } from "lucide-react";
import { ATTRIBUTE, MENU } from "@/utils/endPoints";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "@/utils/http-client/axiosClient";

const schema = yup.object({
  name: yup.string().trim().required("Attribute name is required"),
});

const AddAttribute = () => {
  const [attributes, setAttributes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
    },
  });

   async function translateToArabic(text) {
     if (!text) return "";
     try {
       const url = new URL(`${MENU.TRANSLATE}`);
       url.search = new URLSearchParams({ text, target: "ar" }).toString();
       const res = await fetch(url.toString(), {
         method: "GET",
         credentials: "include",
       });
       if (!res.ok) {
         const txt = await res.text().catch(() => "");
         console.error("Translate HTTP error", res.status, txt);
         return "";
       }
       const json = await res.json();
       return json?.data?.translatedText || "";
     } catch (e) {
       console.error("Translate failed", e);
       return "";
     }
   }
  // Fetch all attributes on mount
  const fetchAttributes = async () => {
    try {
      setLoading(true);

      const res = await getRequest(ATTRIBUTE.FETCH_ATTRIBUTES);
      console.log("fetchAttributes", res);

      if (res?.data) {
        setAttributes(res.data.data || res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch attributes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleEditClick = (attribute) => {
    setEditingId(attribute.id);
    setValue("name", attribute.nameEn || "");
  };
  const handleCancelEdit = () => {
    setEditingId(null);

    reset({
      name: "",
    });
  };

  const onSubmit = async (values) => {
    try {
      const translatedName = await translateToArabic(values.name);

      console.log("English:", values.name);
      console.log("Arabic:", translatedName);

      const payload = {
        translations: [
          {
            languageCode: "en",
            name: values.name,
          },
          {
            languageCode: "ar",
            name: translatedName,
          },
        ],
      };

      let res;

      if (editingId) {
        res = await patchRequest(
          `${ATTRIBUTE.ATTRIBUTES}/${editingId}`,
          payload,
        );
      } else {
        res = await postRequest(ATTRIBUTE.ATTRIBUTES, payload);
      }

      console.log("Attribute Save Response:", res?.data);

      if (res?.data?.code === "ATTRIBUTE_ALREADY_EXISTS") {
        setError("name", {
          type: "manual",
          message: "This attribute already exists.",
        });
        return;
      }

      await fetchAttributes();
      handleCancelEdit();
    } catch (error) {
      const serverError = error?.response?.data;

      if (serverError?.code === "ATTRIBUTE_ALREADY_EXISTS") {
        setError("name", {
          type: "manual",
          message: "This attribute already exists.",
        });
      } else {
        alert(serverError?.message || "An unexpected error occurred.");
      }

      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attribute?"))
      return;

    try {
      await deleteRequest(`${ATTRIBUTE.ATTRIBUTES}/${id}`);

      setAttributes((prev) => prev.filter((item) => item.id !== id));

      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (error) {
      const serverError = error?.response?.data;

      alert(serverError?.message || "Failed to delete attribute.");

      console.error(error);
    }
  };

  return (
    <MainLayout>
      <h2 className="text-[28px] font-medium pb-5 mb-10 border-b">
        Manage Attributes
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LEFT SIDE: Create / Edit Form */}
        <div className="lg:col-span-4 bg-slate-50 dark:bg-zinc-900 p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              {editingId ? "Edit Attribute" : "Add New Attribute"}
            </h3>
            {editingId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="text-muted-foreground hover:text-destructive"
              >
                Cancel
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="attributeName">Attribute Name</Label>
                <Input
                  id="attributeName"
                  placeholder="e.g., Size, Color"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {editingId ? "Update Attribute" : "Save Attribute"}
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE: Listing Display */}
        <div className="lg:col-span-8 border rounded-xl overflow-hidden bg-white dark:bg-black">
          <div className="p-5 border-b bg-slate-50/50 dark:bg-zinc-900/50">
            <h3 className="text-xl font-semibold">Existing Attributes</h3>
            <p className="text-sm text-muted-foreground mt-1">
              A list of all attributes configured for your store.
            </p>
          </div>

          <div className="divide-y">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading attributes...
              </div>
            ) : attributes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No attributes found. Create one on the left!
              </div>
            ) : (
              attributes.map((attribute) => (
                <div
                  key={attribute.id?.toString()}
                  className={`flex items-center justify-between p-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 ${
                    editingId === attribute.id
                      ? "bg-blue-50/50 dark:bg-blue-950/20"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm md:text-base">
                      {attribute.nameEn}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      ID: {attribute.id?.toString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5 h-8 text-xs"
                      onClick={() => handleEditClick(attribute)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(attribute.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddAttribute;
