import React, { useEffect, useState } from "react";
import WelcomeLayout from "@/layouts/WelcomeLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { IoIosClose } from "react-icons/io";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { postRequest } from "@/utils/http-client/axiosClient";
import { AUTH, UPLOAD_FILE } from "@/utils/endPoints";
import Autocomplete from "react-google-autocomplete";
import { uploadMultipleFiles } from "@/utils/upload";
import { useSelector } from "react-redux";
import { RESPONSE_CODE } from "@/utils/constants";
import { useToast } from "@/utils/toaster";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import Skeleton from "react-loading-skeleton";
import TimePicker from "@/components/TimePicker";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API;

const MAX_FILES = 8;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

const schema = yup.object({
  name: yup.string().trim().required("Restaurant name is required"),
  location: yup.string().trim().required("Location is required"),
  images: yup
    .array()
    .of(yup.mixed())
    .min(1, "Please add at least 1 image")
    .max(MAX_FILES, `Maximum ${MAX_FILES} images allowed`)
    .test(
      "file-types",
      "Only JPG/PNG/WebP allowed",
      (files) =>
        Array.isArray(files) &&
        files.every((f) => f && ACCEPTED_TYPES.includes(f.type))
    )
    .test(
      "file-size",
      `Each file must be <= ${MAX_SIZE_MB}MB`,
      (files) =>
        Array.isArray(files) &&
        files.every((f) => f && f.size <= MAX_SIZE_MB * 1024 * 1024)
    ),
});

export default function RestaurantDetail() {
  const [previews, setPreviews] = useState([]);
  const [coords, setCoords] = useState({ lat: "", long: "", loc: "" });
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [availableStart, setAvailableStart] = useState(null);
  const [availableEnd, setAvailableEnd] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      location: "",
      images: [],
    },
  });

  const { user } = useSelector((state) => state?.login);
  const toast = useToast();
  const navigate = useNavigate();

  // ==========================
  // Helpers
  // ==========================
  const toTimeOrNull = (val) => {
    if (!val || val === "null") return null;
    if (val instanceof Date) return val;
    if (typeof val === "string" && /^\d{2}:\d{2}$/.test(val)) {
      const [hours, minutes] = val.split(":").map(Number);
      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      return d;
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const toHHMM = (d) =>
    d
      ? new Date(d).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : null;

  // ==========================
  // File Handling
  // ==========================
  const handleFilesAdd = (fileList) => {
    const files = Array.from(fileList || []);
    const current = getValues("images");
    const next = [...current, ...files].slice(0, MAX_FILES);
    setValue("images", next, { shouldValidate: true, shouldDirty: true });
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, MAX_FILES));
  };

  const handleRemoveImage = (idx) => {
    const current = getValues("images");
    const filtered = current.filter((_, i) => i !== idx);
    setValue("images", filtered, { shouldValidate: true, shouldDirty: true });
    setPreviews((prev) => {
      const copy = [...prev];
      if (copy[idx]?.url) URL.revokeObjectURL(copy[idx].url);
      copy.splice(idx, 1);
      return copy;
    });
  };

  useEffect(() => {
    return () => {
      setPreviews((prev) => {
        prev.forEach((p) => p?.url && URL.revokeObjectURL(p.url));
        return [];
      });
    };
  }, []);

  // ==========================
  // Location Handling
  // ==========================
  const onPlaceSelected = (place) => {
    const label = place?.formatted_address || place?.name || "";
    setValue("location", label, { shouldDirty: true, shouldValidate: true });

    const latFn = place?.geometry?.location?.lat;
    const lngFn = place?.geometry?.location?.lng;

    const lat =
      typeof latFn === "function" ? String(latFn()) : String(latFn ?? "");
    const long =
      typeof lngFn === "function" ? String(lngFn()) : String(lngFn ?? "");
    const loc = place?.formatted_address;

    setCoords({ lat, long, loc });
  };

  // ==========================
  // Submit
  // ==========================
  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      setProgress({ done: 0, total: values.images.length });

      const results = await uploadMultipleFiles({
        endpoint: UPLOAD_FILE.UPLOAD,
        files: values.images,
        postRequest,
        extraPayload: { type: "image", folder: "restaurant" },
        concurrency: 4,
        onProgress: (done, total) => setProgress({ done, total }),
      });

      const uploadedKeys = results
        .filter((r) => !r?.error && (r?.fileKey || r?.key))
        .map((r) => r.fileKey || r.key);

      if (uploadedKeys.length === 0) {
        throw new Error("No files uploaded successfully");
      }

      const payload = {
        authId: user?.authId,
        name: values.name,
        location: coords.loc,
        lat: coords.lat,
        long: coords.long,
        media: uploadedKeys,
        availableTimeStart: toHHMM(availableStart),
        availableTimeEnd: toHHMM(availableEnd),
      };

      const response = await postRequest(`${AUTH.RESTURANT_DETAILS}`, payload);
      if (response.status === RESPONSE_CODE[201]) {
        reset();
        setAvailableStart(null);
        setAvailableEnd(null);
        sessionStorage.clear();
        setDialogOpen(true);
      }

      console.log("Submitting payload:", payload);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================
  // Render
  // ==========================
  return (
    <WelcomeLayout title="Restaurant Details">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Restaurant Name"
          type="text"
          id="rname"
          placeholder="Enter restaurant name"
          parentClass="mb-1"
          {...register("name")}
          error={errors.name?.message}
        />

        <div className="mb-4">
          <Label className="mb-2 block text-droobGray-900 font-normal">
            Location
          </Label>
          <Autocomplete
            apiKey={GOOGLE_API_KEY}
            onPlaceSelected={onPlaceSelected}
            options={{
              fields: ["place_id", "formatted_address", "name", "geometry"],
            }}
            defaultValue=""
            placeholder="Search location..."
            className="w-full rounded-md border px-3 py-2"
            onChange={(e) =>
              setValue("location", e.target.value, { shouldValidate: true })
            }
          />
          {errors.location && (
            <p className="text-red-500 text-xs mt-1">
              {errors.location.message}
            </p>
          )}
        </div>

        {/* Time Pickers */}
        <div className="grid mb-4">
          <Label htmlFor="time-picker-start" className="px-1">
            Available Time Starts
          </Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full rounded mt-2" />
          ) : (
            <TimePicker
              id="time-picker-start"
              selected={availableStart}
              onChange={(val) => setAvailableStart(toTimeOrNull(val))}
              placeholder="Select start time"
            />
          )}
        </div>

        <div className="grid mb-4">
          <Label htmlFor="time-picker-end" className="px-1">
            Available Time Ends
          </Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full rounded mt-2" />
          ) : (
            <TimePicker
              id="time-picker-end"
              selected={availableEnd}
              onChange={(val) => setAvailableEnd(toTimeOrNull(val))}
              placeholder="Select end time"
            />
          )}
        </div>

        {/* Images */}
        <div className="restaurant-images mb-5">
          <Label
            className="mb-2 text-droobGray-900 font-normal block"
            htmlFor="images"
          >
            Add Restaurant Images
          </Label>

          <div className="grid grid-cols-4 gap-4">
            {previews.map((img, idx) => (
              <div key={idx} className="image-block h-[90px] w-[90px] relative">
                <img
                  src={img.url}
                  alt="preview"
                  className="h-full w-full object-cover rounded-[10px]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full cursor-pointer text-xl"
                  aria-label="Remove image"
                >
                  <IoIosClose />
                </button>
              </div>
            ))}

            <div className="image-block h-[90px] w-[90px]">
              <Label
                htmlFor="images"
                className="h-full w-full flex items-center justify-center border border-dashed border-droobGray-300 rounded-[10px] text-droobGray-300 font-normal cursor-pointer"
              >
                + Add
              </Label>
              <input
                id="images"
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                multiple
                hidden
                onChange={(e) => handleFilesAdd(e.target.files)}
              />
            </div>
          </div>

          {errors.images && (
            <p className="text-red-500 text-xs mt-2">{errors.images.message}</p>
          )}

          {progress.total > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              Uploading {progress.done}/{progress.total}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button className="w-full shrink" variant="outline" asChild>
            <Link to="/login">Back to Login</Link>
          </Button>
          <Button
            loading={submitting}
            type="submit"
            variant="default"
            className={"w-full"}
            disabled={submitting}
          >
            Submit
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        triggerText="Sign up"
        triggerClass="w-full"
        title="Request Sent"
        description="Your Approval request has been sent to the admin, and you’ll be notified when the request is approved."
        linkTo="/login"
        linkText="Okay"
        triggerVariant="default"
      />
    </WelcomeLayout>
  );
}
