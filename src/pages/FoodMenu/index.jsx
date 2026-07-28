// src/pages/AddOrEditFood.jsx
import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import CustomSelect from "@/components/ui/CustomSelect";
import { getRequest, postRequest, putRequest } from "@/utils/http-client/axiosClient";
import { uploadSingleFile } from "@/utils/upload";
import { MENU, UPLOAD_FILE, ATTRIBUTE } from "@/utils/endPoints";
import { RESPONSE_CODE } from "@/utils/constants";
import { useNavigate, useParams } from "react-router-dom";

// Dynamic schema validation based on whether customizations are active
const schema = yup.object({
  name: yup.string().trim().required("Name is required"),
  description: yup.string().trim().required("Description is required"),
  price: yup
    .string()
    .trim()
    .when("enableAttributesHidden", {
      is: false,
      then: (schema) =>
        schema
          .matches(/^\d+(\.\d{1,2})?$/, "Enter a valid price")
          .required("Price is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  category: yup
    .object({
      value: yup.string().required(),
      label: yup.string().required(),
    })
    .nullable()
    .required("Category is required"),
  subCategory: yup
    .object({
      value: yup.string().required(),
      label: yup.string().required(),
    })
    .nullable()
    .required("Sub Category is required"),
  isVeg: yup.boolean().required(),
  image: yup
    .mixed()
    .test("required", "Image is required", function (v) {
      // If we are editing and have an existing image string/url, it's valid
      if (this.options.context?.isEdit && typeof v === "string" && v.length > 0) {
        return true;
      }
      const file = v instanceof File ? v : null;
      return !!file;
    })
    .test("fileType", "Only image files are allowed", function (v) {
      if (this.options.context?.isEdit && typeof v === "string") return true;
      const file = v instanceof File ? v : null;
      if (!file) return false;
      return /^image\//.test(file.type);
    })
    .test("fileSize", "Max file size is 5MB", function (v) {
      if (this.options.context?.isEdit && typeof v === "string") return true;
      const file = v instanceof File ? v : null;
      if (!file) return false;
      return file.size <= 5 * 1024 * 1024;
    }),
});

const AddOrEditFood = () => {
  const { id } = useParams(); // Detect if we are in Edit Mode
  const isEdit = !!id;
  const navigate = useNavigate();

  const [enableAttributes, setEnableAttributes] = useState(false);
  const [catOptions, setCatOptions] = useState([]);
  const [subCatRaw, setSubCatRaw] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const [attributeOptions, setAttributeOptions] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedAttributeOption, setSelectedAttributeOption] = useState(null);

  // States for Translation Confirmation Modal
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [translationData, setTranslationData] = useState({
    enName: "",
    arName: "",
    enDesc: "",
    arDesc: "",
    formValues: null,
    updatedAttributes: [],
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    resetField,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit }, // Pass down context to Yup for structural conditional checks
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: null,
      subCategory: null,
      image: null,
      isVeg: true,
      enableAttributesHidden: false,
    },
  });

  const selectedCategory = watch("category");
  const imageFile = watch("image");
  const basePrice = watch("price");

  // Synchronize dynamic rules validation state flag
  useEffect(() => {
    setValue("enableAttributesHidden", enableAttributes);
    if (!enableAttributes) {
      setSelectedAttributes([]);
      setSelectedAttributeOption(null);
    } else {
      setValue("price", "");
    }
  }, [enableAttributes, setValue]);

  // Compute Base Price Structure updates
  const finalPrice = useMemo(() => {
    const parsed = parseFloat(basePrice);
    return isNaN(parsed) ? "" : (parsed * 1.15).toFixed(2);
  }, [basePrice]);

  const availableAttributeOptions = useMemo(() => {
    return attributeOptions.filter(
      (option) =>
        !selectedAttributes.some(
          (selected) => selected.attributeId === option.value,
        ),
    );
  }, [attributeOptions, selectedAttributes]);

  // Fetch all categories and attributes master data
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [attrRes, catRes, subCatRes] = await Promise.all([
          getRequest(ATTRIBUTE.FETCH_ATTRIBUTES),
          getRequest(MENU.CATEGORY),
          getRequest(MENU.SUB_CATEGORY),
        ]);

        if (!alive) return;

        const attrs = attrRes?.data?.data?.attributes || attrRes?.data?.data || [];
        setAttributeOptions(attrs.map(item => ({ value: item.id, label: item.nameEn })));

        const cats = catRes?.data?.data?.categories || [];
        setCatOptions(cats.map(c => ({ value: c.id, label: c.name })));

        const subCats = subCatRes?.data?.data?.categories || [];
        setSubCatRaw(subCats);
      } catch (err) {
        console.error("Initialization master data pulling failed", err);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Fetch Existing Food Record details if in Edit mode
  useEffect(() => {
    if (!isEdit || catOptions.length === 0 || subCatRaw.length === 0) return;

    (async () => {
      try {
        setUploading(true);
        const res = await getRequest(`${MENU.DETAIL}/${id}`); // Use your structured details endpoint route
        const data = res?.data?.data;
        if (!data) return;

        // Parse explicit language sets translations
        const enTrans = data.translation?.find(t => t.languageCode === "en") || {};
        const arTrans = data.translation?.find(t => t.languageCode === "ar") || {};

        const selectedCat = catOptions.find(c => c.value === data.categoryId) || null;
        const selectedSubCat = subCatRaw
          .filter(s => s.categoryId === data.categoryId)
          .map(s => ({ value: s.id, label: s.name, categoryId: s.categoryId }))
          .find(s => s.value === data.subCategoryId) || null;

        // Rehydrate react-hook-form fields
        reset({
          name: enTrans.name || data.name || "",
          description: enTrans.description || data.description || "",
          price: data.isMenuCustomized ? "" : String(data.price || ""),
          category: selectedCat,
          subCategory: selectedSubCat,
          image: data.media || null, // Keeping media references key tracking string
          isVeg: data.type === "veg",
          enableAttributesHidden: !!data.isMenuCustomized,
        });

        if (data.media) {
          // Check if data.media contains full web URI pathing, or apply structural CDN path mapping
          setPreviewUrl(data.media); 
        }

        setEnableAttributes(!!data.isMenuCustomized);

        if (data.isMenuCustomized && data.attributes) {
          const formattedAttributes = data.attributes.map(attr => ({
            attributeId: attr.attributeId,
            attributeName: attr.attributeName || attributeOptions.find(o => o.value === attr.attributeId)?.label || "Custom Variant Group",
            variants: attr.variants.map(v => ({
              name: v.nameEn || v.name || "",
              nameAr: v.nameAr || "",
              price: String(v.price || ""),
              finalPrice: String(v.finalPrice || ((v.price || 0) * 1.15).toFixed(2)),
            }))
          }));
          setSelectedAttributes(formattedAttributes);
        }
      } catch (err) {
        console.error("Failed to load existing food information parameters", err);
      } finally {
        setUploading(false);
      }
    })();
  }, [id, isEdit, catOptions, subCatRaw, attributeOptions, reset]);

  // Handle local File Previews references lifecycle
  useEffect(() => {
    if (imageFile instanceof File) {
      const objUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objUrl);
      return () => URL.revokeObjectURL(objUrl);
    }
  }, [imageFile]);

  // Compute Subcategories Filter Layering options mapping layout
  const subCatOptions = useMemo(() => {
    const catId = selectedCategory?.value;
    const filtered = catId ? subCatRaw.filter((s) => s.categoryId === catId) : subCatRaw;
    return filtered.map((s) => ({
      value: s.id,
      label: s.name,
      categoryId: s.categoryId,
    }));
  }, [subCatRaw, selectedCategory]);

  // Safe programmatic reset for dynamic categorization toggles
  useEffect(() => {
    if (selectedCategory && !isEdit) {
      resetField("subCategory", { defaultValue: null });
    }
  }, [selectedCategory, resetField, isEdit]);

  async function translateToArabic(text) {
    if (!text) return "";
    try {
      const url = new URL(`${MENU.TRANSLATE}`);
      url.search = new URLSearchParams({ text, target: "ar" }).toString();
      const res = await fetch(url.toString(), { method: "GET", credentials: "include" });
      if (!res.ok) return "";
      const json = await res.json();
      return json?.data?.translatedText || "";
    } catch (e) {
      console.error("Translate engine down", e);
      return "";
    }
  }

  // Intercept Form Submission to structure variant mappings data references
  async function onSubmit(values) {
    if (enableAttributes) {
      if (selectedAttributes.length === 0) {
        alert("Please add at least one variant group or turn off customizations.");
        return;
      }
      for (const attr of selectedAttributes) {
        for (const variant of attr.variants) {
          if (!variant.name.trim() || !variant.price) {
            alert(`Please fill out option names and prices for ${attr.attributeName}`);
            return;
          }
        }
      }
    }

    try {
      setUploading(true);

      const arName = await translateToArabic(values.name);
      const arDesc = await translateToArabic(values.description);

      let translatedAttributes = [];
      if (enableAttributes) {
        translatedAttributes = await Promise.all(
          selectedAttributes.map(async (attr) => {
            const translatedVariants = await Promise.all(
              attr.variants.map(async (v) => {
                // Skip re-translating if an Arabic name already exists from Edit mode
                const arVariantName = v.nameAr ? v.nameAr : await translateToArabic(v.name);
                return {
                  ...v,
                  nameAr: arVariantName || v.name,
                };
              }),
            );
            return { ...attr, variants: translatedVariants };
          }),
        );
      }

      setTranslationData({
        enName: values.name,
        arName: arName || values.name,
        enDesc: values.description,
        arDesc: arDesc || values.description,
        formValues: values,
        updatedAttributes: translatedAttributes,
      });

      setShowTranslationModal(true);
    } catch (err) {
      console.error("Translation processing pipeline failure exception", err);
    } finally {
      setUploading(false);
    }
  }

  // Final Action execution block handling either creation payload or structural resource adjustment payloads
  async function handleFinalConfirm() {
    const { formValues, arName, arDesc, updatedAttributes } = translationData;
    if (!formValues) return;

    try {
      setUploading(true);
      setShowTranslationModal(false);
      let mediaKey = formValues.image;

      // Handle media assets context processing check arrays
      if (formValues.image instanceof File) {
        const uploadRes = await uploadSingleFile({
          endpoint: UPLOAD_FILE.UPLOAD,
          file: formValues.image,
          postRequest,
          extraPayload: { folder: "restaurant" },
        });
        mediaKey = uploadRes?.fileKey || uploadRes?.key || formValues.image?.name || "";
      }

      const payload = {
        translation: [
          { name: formValues.name, description: formValues.description, languageCode: "en" },
          { name: arName, description: arDesc, languageCode: "ar" },
        ],
        price: enableAttributes ? "0" : formValues.price,
        media: mediaKey,
        finalPrice: enableAttributes ? "0.00" : finalPrice,
        categoryId: formValues.category?.value || "",
        subCategoryId: formValues.subCategory?.value || "",
        type: formValues.isVeg ? "veg" : "non-veg",
        isMenuCustomized: enableAttributes,
        attributes: enableAttributes
          ? updatedAttributes.map((attr) => ({
              attributeId: attr.attributeId,
              variants: attr.variants.map((v) => ({
                nameEn: v.name,
                nameAr: v.nameAr,
                price: Number(v.price),
                finalPrice: Number(v.finalPrice),
              })),
            }))
          : [],
      };

      // Determine Action execution context routing path parameters split mapping
      const response = isEdit 
        ? await putRequest(`${MENU.EDIT}/${id}`, payload) // Use your configuration path strings rules sets
        : await postRequest(`${MENU.ADD}`, payload);

      if (response.status === RESPONSE_CODE[201] || response.status === RESPONSE_CODE[200] || response.data?.success) {
        reset();
        setSelectedAttributes([]);
        setEnableAttributes(false);
        navigate("/menu-list");
      }
    } catch (err) {
      console.error("Persistence operational phase failure exception", err);
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    setValue("image", f || null, { shouldValidate: true, shouldDirty: true });
  }

  const handleAttributeSelect = (option) => {
    if (!option) return;
    setSelectedAttributeOption(option);
    const exists = selectedAttributes.some((item) => item.attributeId === option.value);
    if (exists) return;

    setSelectedAttributes((prev) => [
      ...prev,
      {
        attributeId: option.value,
        attributeName: option.label,
        variants: [{ name: "", price: "", finalPrice: "" }],
      },
    ]);

    setTimeout(() => { setSelectedAttributeOption(null); }, 0);
  };

  const removeAttribute = (attributeId) => {
    setSelectedAttributes((prev) => prev.filter((item) => item.attributeId !== attributeId));
  };

  const addVariant = (attrIndex) => {
    setSelectedAttributes((prev) => {
      const copy = [...prev];
      copy[attrIndex].variants.push({ name: "", price: "", finalPrice: "" });
      return copy;
    });
  };

  const updateVariant = (attrIndex, variantIndex, field, value) => {
    setSelectedAttributes((prev) => {
      const copy = [...prev];
      copy[attrIndex].variants[variantIndex][field] = value;

      if (field === "price") {
        const price = parseFloat(value);
        copy[attrIndex].variants[variantIndex].finalPrice = !isNaN(price)
          ? (price * 1.15).toFixed(2)
          : "";
      }
      return copy;
    });
  };

  const removeVariant = (attrIndex, variantIndex) => {
    setSelectedAttributes((prev) => {
      const copy = [...prev];
      copy[attrIndex].variants.splice(variantIndex, 1);
      return copy;
    });
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between mb-8 border-b pb-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {isEdit ? "Edit Food Item" : "Add New Food"}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {isEdit ? "Modify configuration options or pricing schemas for this menu asset" : "Create menu item with variants and customization options"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT SIDE COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
                <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
                  Food Information
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="foodname" className="text-xs font-semibold text-gray-700 tracking-wide">
                      Item Name
                    </Label>
                    <Input
                      id="foodname"
                      placeholder="e.g. Grilled Chicken Burgers"
                      {...register("name")}
                      className={`bg-gray-50/60 border-gray-200 text-xs h-10 ${
                        errors.name ? "border-red-300 focus-visible:ring-red-400" : "focus-visible:ring-gray-400"
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-[11px] font-medium">{errors.name.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="foodcategory" className="text-xs font-semibold text-gray-700 tracking-wide">
                        Primary Category
                      </Label>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <CustomSelect
                            name="foodcategory"
                            options={catOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select category"
                            error={errors.category?.message}
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="foodsubcategory" className="text-xs font-semibold text-gray-700 tracking-wide">
                        Sub Category
                      </Label>
                      <Controller
                        name="subCategory"
                        control={control}
                        render={({ field }) => (
                          <CustomSelect
                            name="foodsubcategory"
                            options={subCatOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select sub category"
                            isDisabled={!selectedCategory}
                            error={errors.subCategory?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION BLOCK */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">Description</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="fooddescription" className="text-xs font-semibold text-gray-700 tracking-wide">
                    Short Description
                  </Label>
                  <Textarea
                    id="fooddescription"
                    placeholder="Describe key ingredients, preparation styles, allergens..."
                    className="min-h-[110px] resize-none bg-gray-50/60 border-gray-200 text-xs p-3 focus-visible:ring-gray-400"
                    {...register("description")}
                  />
                  {errors.description && <p className="text-red-500 text-[11px] font-medium">{errors.description.message}</p>}
                </div>
              </div>

              {/* ATTRIBUTES CUSTOMIZATIONS BLOCK */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Customizations & Variants</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Configure structural modifier variations like Sizes, Add-ons, or Crusts.</p>
                  </div>
                  <Switch checked={enableAttributes} onCheckedChange={setEnableAttributes} />
                </div>

                {enableAttributes && (
                  <div className="space-y-5 pt-1 animate-in fade-in duration-200">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-700 tracking-wide">Select Variant Types</Label>
                      <CustomSelect
                        options={availableAttributeOptions}
                        value={selectedAttributeOption}
                        onChange={handleAttributeSelect}
                        placeholder="Choose Attribute Group"
                      />
                    </div>

                    {selectedAttributes.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 bg-gray-50/60 border border-dashed border-gray-200 rounded-xl">
                        {selectedAttributes.map((attr) => (
                          <div key={attr.attributeId} className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-lg border border-blue-100 bg-blue-50/50 text-blue-600">
                            <span className="text-[10px] font-bold uppercase tracking-wider">{attr.attributeName}</span>
                            <button
                              type="button"
                              onClick={() => removeAttribute(attr.attributeId)}
                              className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-blue-100 text-blue-900 font-bold text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-4">
                      {selectedAttributes.map((attr, attrIndex) => (
                        <div key={attr.attributeId} className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                          <div className="flex justify-between items-center px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
                            <span className="font-bold text-xs text-gray-700">{attr.attributeName} Ruleset Options</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttribute(attr.attributeId)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50/60 text-[11px] font-semibold h-7 px-2.5"
                            >
                              Remove Set
                            </Button>
                          </div>

                          <div className="p-4 space-y-3">
                            {attr.variants.map((variant, variantIndex) => (
                              <div key={variantIndex} className="grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-5">
                                  <Input
                                    placeholder="Option Name"
                                    value={variant.name}
                                    onChange={(e) => updateVariant(attrIndex, variantIndex, "name", e.target.value)}
                                    className="bg-white border-gray-200 text-xs h-9"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Input
                                    type="number"
                                    placeholder="Price"
                                    value={variant.price}
                                    onChange={(e) => updateVariant(attrIndex, variantIndex, "price", e.target.value)}
                                    className="bg-white border-gray-200 text-xs h-9"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Input
                                    value={variant.finalPrice || ""}
                                    placeholder="VAT Included"
                                    readOnly
                                    disabled
                                    className="bg-gray-100 border-gray-200 text-xs h-9 font-semibold text-green-600 cursor-not-allowed"
                                  />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    disabled={attr.variants.length === 1}
                                    onClick={() => removeVariant(attrIndex, variantIndex)}
                                    className="shrink-0 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 h-9 w-9"
                                  >
                                    ×
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addVariant(attrIndex)}
                              className="text-[11px] font-medium border-dashed border-gray-300 text-gray-500 hover:text-gray-800 h-8 mt-1"
                            >
                              + Add Option Field
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE COLUMN */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-1 text-sm tracking-wide">Food Image</h3>
                <div className="space-y-3">
                  <div className="w-full relative h-32">
                    <Label
                      htmlFor="images"
                      className={`h-full w-full flex flex-col items-center justify-center border border-dashed rounded-xl transition-colors cursor-pointer text-xs font-medium bg-gray-50/30 text-gray-500 hover:bg-gray-50/80 ${
                        errors.image ? "border-red-300 bg-red-50/30 text-red-600" : "border-gray-300"
                      }`}
                    >
                      <span>{imageFile ? "Change Image Asset" : "Browse Product Image"}</span>
                    </Label>
                    <input type="file" id="images" accept="image/*" hidden onChange={handleFileChange} />
                  </div>

                  {previewUrl && (
                    <div className="h-28 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-inner">
                      <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                  {errors.image && <p className="text-red-500 text-[11px] font-medium mt-1">{errors.image.message}</p>}
                </div>
              </div>

              {!enableAttributes && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="font-semibold text-gray-900 border-b pb-1 text-sm tracking-wide">Pricing Matrix</h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="foodprice" className="text-xs font-semibold text-gray-700 tracking-wide">Base Price</Label>
                      <Input
                        id="foodprice"
                        placeholder="0.00"
                        {...register("price")}
                        className={`bg-gray-50/60 border-gray-200 text-xs h-10 ${
                          errors.price ? "border-red-300 focus-visible:ring-red-400" : "focus-visible:ring-gray-400"
                        }`}
                      />
                      {errors.price && <p className="text-red-500 text-[11px] font-medium">{errors.price.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="finalPrice" className="text-xs font-semibold text-gray-700 tracking-wide">
                        Final Customer Price <span className="text-[10px] text-gray-400 font-normal">(15% VAT Inc.)</span>
                      </Label>
                      <Input
                        id="finalPrice"
                        value={finalPrice}
                        placeholder="Calculated automatically"
                        readOnly
                        disabled
                        className="bg-gray-100/70 border-gray-200 text-gray-500 text-xs font-bold cursor-not-allowed h-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* VEG / NON-VEG SWITCH */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 tracking-wide">Vegetarian Item</Label>
                    <p className="text-[11px] text-gray-400">Toggle if this food item contains no meat.</p>
                  </div>
                  <Controller
                    name="isVeg"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
              </div>

              {/* ACTION SUBMIT BUTTON */}
              <Button
                type="submit"
                disabled={uploading}
                className="w-full h-11 bg-gray-900 text-white font-medium hover:bg-gray-800 rounded-xl transition-all shadow-md text-xs tracking-wider uppercase"
              >
                {uploading ? "Processing Payload..." : isEdit ? "Update Food Item" : "Save Food Item"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* VERIFICATION MODAL COGNITIVE OVERLAY */}
      {showTranslationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Verify Language Translations</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              <div>
                <Label className="text-xs text-gray-400">English Name</Label>
                <p className="text-sm font-medium text-gray-800">{translationData.enName}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-400">Arabic Translation Name</Label>
                <Input value={translationData.arName} onChange={(e) => setTranslationData(p => ({ ...p, arName: e.target.value }))} className="text-sm h-9 bg-gray-50" />
              </div>
              <hr />
              <div>
                <Label className="text-xs text-gray-400">English Description</Label>
                <p className="text-xs text-gray-600">{translationData.enDesc}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-400">Arabic Translation Description</Label>
                <Textarea value={translationData.arDesc} onChange={(e) => setTranslationData(p => ({ ...p, arDesc: e.target.value }))} className="text-xs min-h-[60px] bg-gray-50" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setShowTranslationModal(false)}>Cancel</Button>
              <Button type="button" onClick={handleFinalConfirm} className="bg-green-600 hover:bg-green-700 text-white">Confirm & Publish</Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AddOrEditFood;