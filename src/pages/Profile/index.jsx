import React, { useEffect, useState, useRef, useMemo } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Label } from "@/components/ui/label";
import { EditIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import TimePicker from "@/components/TimePicker";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { uploadMultipleFiles, uploadSingleFile } from "@/utils/upload";
import { AUTH, UPLOAD_FILE } from "@/utils/endPoints";
import { IMAGE_URL, RESPONSE_CODE, STORAGE_INDEXES } from "@/utils/constants";
import { PhoneInput } from "@/components/PhoneInput";
import { patchRequest, postRequest } from "@/utils/http-client/axiosClient";
import {
  getCountryCallingCode,
  parsePhoneNumber,
} from "react-phone-number-input";
import { updateUserAccountAction } from "@/modules/Auth/Login/LoginActions";
import { setOnLocalStorage } from "@/utils/localStorage";
import { useToast } from "@/utils/toaster";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import CustomSelect from "@/components/ui/CustomSelect";

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

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

const CUISINE_OPTIONS = [
  { value: "Italian", label: "Italian" },
  { value: "Chinese", label: "Chinese" },
  { value: "Indian", label: "Indian" },
  { value: "American", label: "American" },
  { value: "French", label: "French" },
  { value: "Japanese", label: "Japanese" },
  { value: "Mexican", label: "Mexican" },
  { value: "Middle Eastern", label: "Middle Eastern" },
  { value: "Thai", label: "Thai" },
  { value: "Mediterranean", label: "Mediterranean" },
  { value: "Other", label: "Other" },
];

const schema = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .max(25, "First name cannot exceed 25 characters"),

  lastName: yup
    .string()
    .trim()
    .required("Last name is required")
    .max(25, "Last name cannot exceed 25 characters"),
  email: yup.string().trim().email().required("Email is required"),
  phoneNumber: yup.string().trim().required("Phone number is required"),
  countryCode: yup.string().trim().required("Country code is required"),
  cuisine: yup
    .object()
    .shape({
      label: yup.string(),
      value: yup.string(),
    })
    .nullable(),
  availableTimeStart: yup.date().nullable(true),
  availableTimeEnd: yup
    .date()
    .nullable(true)
    .test("is-greater", "End time must be after start time", function (value) {
      const { availableTimeStart } = this.parent;
      if (!availableTimeStart || !value) return true;
      return new Date(value).getTime() > new Date(availableTimeStart).getTime();
    }),
  workingHours: yup.array().of(
    yup.object().shape({
      day: yup.string(),
      isOpen: yup.boolean(),
      openTime: yup.mixed().when("isOpen", {
        is: true,
        then: (schema) => schema.required("Start time required"),
        otherwise: (schema) => schema.nullable(),
      }),
      closeTime: yup.mixed().when("isOpen", {
        is: true,
        then: (schema) =>
          schema
            .required("End time required")
            .test(
              "is-greater",
              "End time must be after start time",
              function (value) {
                const { openTime } = this.parent;
                if (!openTime || !value) return true;
                return new Date(value).getTime() > new Date(openTime).getTime();
              },
            ),
        otherwise: (schema) => schema.nullable(),
      }),
    }),
  ),
  holidays: yup.array().of(yup.date()),
});

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const Profile = () => {
  const { user, loading: userLoading } =
    useSelector((state) => state.login) || {};
  const login = useSelector((state) => state.login);
  const dispatch = useDispatch();
  const toast = useToast();

  const [hydrating, setHydrating] = useState(true);
  const [images, setImages] = useState([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState("SY");
  const [profileImgSrc, setProfileImgSrc] = useState(null);
  const [profileImgKey, setProfileImgKey] = useState(null);
  const [profileUploading, setProfileUploading] = useState(false);
  const profileBlobUrlRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      countryCode: "",
      cuisine: null,
      availableTimeStart: null,
      availableTimeEnd: null,
      workingHours: DAYS_OF_WEEK.map((day) => ({
        day,
        isOpen: true,
        openTime: null,
        closeTime: null,
      })),
      holidays: [],
    },
  });

  useEffect(() => {
    if (!user) return;

    const restaurant = user?.resturant || {};
    const fullPhone =
      user?.countryCode && user?.phoneNumber
        ? `${user.countryCode}${user.phoneNumber}`
        : user?.phoneNumber || "";

    let detectedCountry = "SY";
    try {
      const parsed = parsePhoneNumber(fullPhone);
      if (parsed?.country) detectedCountry = parsed.country;
    } catch {}

    setSelectedCountry(detectedCountry);

    reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: fullPhone,
      countryCode: user?.countryCode || "",
      cuisine: restaurant?.cuisine
        ? { value: restaurant.cuisine, label: restaurant.cuisine }
        : null,
      availableTimeStart: toTimeOrNull(restaurant?.availableTimeStart),
      availableTimeEnd: toTimeOrNull(restaurant?.availableTimeEnd),
      workingHours: DAYS_OF_WEEK.map((day) => {
        const dayData = restaurant?.workingHours?.find((d) => d.day === day);
        return {
          day,
          isOpen: dayData ? dayData.isOpen : true,
          openTime: toTimeOrNull(dayData?.openTime),
          closeTime: toTimeOrNull(dayData?.closeTime),
        };
      }),
      holidays: (restaurant?.holidays || [])
        .map((h) => new Date(h.holidayDate || h))
        .filter((h) => !isNaN(h.getTime())),
    });

    const serverImages =
      restaurant?.files?.map((f) => ({
        id: String(f.id),
        src: `${IMAGE_URL}/${f.media}`,
        fileKey: f.media,
        server: true,
      })) || [];
    setImages(serverImages);

    console.log("user1--->", user);
    const profileMedia = user?.profileImg || null;
    setProfileImgSrc(profileMedia ? `${IMAGE_URL}/${profileMedia}` : null);
    setHydrating(false);
  }, [user, reset]);

  useEffect(() => {
    return () => {
      if (profileBlobUrlRef.current)
        URL.revokeObjectURL(profileBlobUrlRef.current);
      images.forEach(
        (img) => img.objectUrl && URL.revokeObjectURL(img.objectUrl),
      );
    };
  }, [images]);

  const handleImageChange = async (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (!rawFiles.length) return;
    setUploadingCount((c) => c + rawFiles.length);

    const previews = rawFiles.map((file) => ({
      id: URL.createObjectURL(file),
      src: URL.createObjectURL(file),
      file,
      server: false,
    }));
    setImages((prev) => [...prev, ...previews]);

    try {
      const results = await uploadMultipleFiles({
        endpoint: UPLOAD_FILE.UPLOAD,
        files: rawFiles,
        postRequest,
        extraPayload: { type: "image", folder: "restaurant" },
        concurrency: 4,
      });

      const uploaded = results
        .filter((r) => r?.fileKey || r?.key)
        .map((r, idx) => ({
          id: r.fileKey || r.key,
          src: previews[idx].src,
          fileKey: r.fileKey || r.key,
          server: true,
        }));

      setImages((prev) => [
        ...prev.filter((p) => !rawFiles.includes(p.file)),
        ...uploaded,
      ]);
      toast.success("Images uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Image upload failed.");
    } finally {
      setUploadingCount(0);
      e.target.value = "";
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileUploading(true);

    try {
      const res = await uploadSingleFile({
        endpoint: UPLOAD_FILE.UPLOAD,
        file,
        postRequest,
        extraPayload: { type: "image", folder: "profile" },
      });

      const key = res?.fileKey || res?.key;
      const preview = URL.createObjectURL(file);

      if (profileBlobUrlRef.current)
        URL.revokeObjectURL(profileBlobUrlRef.current);
      profileBlobUrlRef.current = preview;

      setProfileImgSrc(preview);
      setProfileImgKey(key);
      toast.success("Profile image uploaded!");
    } catch (err) {
      console.error("Profile upload failed:", err);
      toast.error("Profile image upload failed.");
    } finally {
      setProfileUploading(false);
      e.target.value = "";
    }
  };

  // --------------------------------
  // Remove image
  // --------------------------------
  const handleRemoveImage = (id) =>
    setImages((prev) => prev.filter((img) => img.id !== id));

  // --------------------------------
  // Submit handler
  // --------------------------------
  const onSubmit = async (data) => {
    const media = images.map((img) => img.fileKey).filter(Boolean);
    const toHHMM = (d) =>
      d
        ? new Date(d).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : null;

    let countryCode = "";
    let phoneNumber = "";
    try {
      const phoneObj = parsePhoneNumber(data.phoneNumber);
      countryCode = phoneObj ? "+" + phoneObj.countryCallingCode : "";
      phoneNumber = phoneObj ? phoneObj.nationalNumber : data.phoneNumber;
      if (phoneObj) setSelectedCountry(phoneObj.country);
    } catch {
      countryCode = selectedCountry
        ? "+" + getCountryCallingCode(selectedCountry)
        : "";
      phoneNumber = data.phoneNumber;
    }

    const payload = {
      authId: user?.authId,
      firstName: data.firstName,
      lastName: data.lastName,
      countryCode,
      phoneNumber,
      cuisine: data.cuisine?.value,
      media,
      availableTimeStart: toHHMM(data.availableTimeStart),
      availableTimeEnd: toHHMM(data.availableTimeEnd),
      workingHours: data.workingHours.map((wh) => ({
        day: wh.day,
        isOpen: wh.isOpen,
        openTime: toHHMM(wh.openTime),
        closeTime: toHHMM(wh.closeTime),
      })),
      holidays: (data.holidays || [])
        .filter((h) => h instanceof Date && !isNaN(h.getTime()))
        .map((h) => format(h, "yyyy-MM-dd")),
      profileImg: profileImgKey || null,
    };

    try {
      const response = await patchRequest(`${AUTH.UPDATE_PROFILE}`, payload);
      if (response.status === RESPONSE_CODE[200]) {
        const dataRes = response?.data?.data;
        const updatedData = {
          ...login,
          user: {
            ...login.user,
            profileImg: dataRes?.updatedAuth?.profile?.profileImg,
            firstName: dataRes?.updatedAuth?.profile?.firstName,
            lastName: dataRes?.updatedAuth?.profile?.lastName,
            phoneNumber: dataRes?.updatedAuth?.phoneNumber,
            countryCode,
            resturant: {
              ...login?.user?.resturant,
              availableTimeEnd: dataRes?.updatedResturant?.availableTimeEnd,
              availableTimeStart: dataRes?.updatedResturant?.availableTimeStart,
              workingHours: dataRes?.updatedResturant?.workingHours,
              holidays: dataRes?.updatedResturant?.holidays,
              cuisine: dataRes?.updatedResturant?.cuisine,
            },
          },
        };
        dispatch(updateUserAccountAction(updatedData));
        setOnLocalStorage(STORAGE_INDEXES.APP_STORAGE, updatedData);
        toast.success(response?.data?.message || "Profile updated!");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(error?.data?.message || "Profile update failed");
    }
  };

  const availableStart = watch("availableTimeStart");
  const availableEnd = watch("availableTimeEnd");

  const isLoading = userLoading || hydrating;
  const welcomeName = useMemo(() => user?.firstName || "User", [user]);

  return (
    <MainLayout>
      {/* Profile header */}
      <div className="profile-hero bg-theme-primary rounded-[10px] p-5 flex items-center gap-7 flex-wrap mb-12">
        <div className="profile-image relative">
          <div className="size-36 rounded-full ring-5 ring-white/40 overflow-hidden bg-white/20">
            {isLoading ? (
              <Skeleton className="size-36 rounded-full" />
            ) : profileImgSrc ? (
              <img
                src={profileImgSrc}
                className="size-36 object-cover"
                alt="Profile"
              />
            ) : (
              <div className="size-36 flex items-center justify-center text-white/80">
                No Image
              </div>
            )}
          </div>
          <Label
            className="size-11 bg-white rounded-full flex items-center justify-center absolute bottom-0 right-0 cursor-pointer"
            htmlFor="profileImage"
          >
            <EditIcon />
            <input
              type="file"
              id="profileImage"
              hidden
              accept="image/*"
              onChange={handleProfileImageChange}
            />
          </Label>
          {profileUploading && (
            <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center text-white text-xs">
              Uploading...
            </div>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-64 rounded" />
        ) : (
          <p className="text-white text-[28px] font-semibold">
            Welcome {welcomeName}
          </p>
        )}
      </div>

      {/* Main form */}
      <form
        className="max-w-[700px]"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <h2 className="text-xl font-medium mb-7">Basic Information</h2>

        <div className="grid md:grid-cols-2 gap-7">
          {/* First name */}
          <div className="grid">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              {...register("firstName")}
            />
            {errors.firstName && (
              <span className="text-red-500 text-sm mt-1">
                {errors.firstName.message}
              </span>
            )}
          </div>

          {/* Last name */}
          <div className="grid">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              {...register("lastName")}
            />
            {errors.lastName && (
              <span className="text-red-500 text-sm mt-1">
                {errors.lastName.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="grid md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" disabled {...register("email")} />
          </div>

          {/* Phone */}
          <div className="grid md:col-span-2">
            <Label>Contact number</Label>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  value={value}
                  onChange={(val) => {
                    onChange(val || "");
                    try {
                      const parsed = parsePhoneNumber(val);
                      if (parsed) {
                        setValue(
                          "countryCode",
                          `+${parsed.countryCallingCode}`,
                        );
                        setSelectedCountry(parsed.country);
                      } else setValue("countryCode", "");
                    } catch {
                      setValue("countryCode", "");
                    }
                  }}
                  placeholder="Enter phone number"
                  defaultCountry={selectedCountry || "SY"}
                  international
                  withCountryCallingCode
                />
              )}
            />
          </div>

          {/* Cuisine */}
          <div className="grid md:col-span-2">
            <Label htmlFor="cuisine">Cuisine</Label>
            <Controller
              name="cuisine"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  name="cuisine"
                  options={CUISINE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select cuisine"
                  isClearable
                  error={errors.cuisine?.message}
                />
              )}
            />
          </div>

          {/* Time pickers */}
          {/* <div className="grid">
            <Label htmlFor="time-picker-start">Available Time Starts</Label>
            <TimePicker
              id="time-picker-start"
              selected={toTimeOrNull(availableStart)}
              onChange={(val) =>
                setValue("availableTimeStart", toTimeOrNull(val))
              }
              placeholder="Select start time"
            />
          </div>

          <div className="grid">
            <Label htmlFor="time-picker-end">Available Time Ends</Label>
            <TimePicker
              id="time-picker-end"
              selected={toTimeOrNull(availableEnd)}
              onChange={(val) =>
                setValue("availableTimeEnd", toTimeOrNull(val))
              }
              placeholder="Select end time"
              className={cn(
                errors.availableTimeEnd && "border-red-500 ring-red-500/20"
              )}
            />
            {errors.availableTimeEnd && (
              <span className="text-red-500 text-sm mt-1">
                {errors.availableTimeEnd.message}
              </span>
            )}
          </div> */}
        </div>

        {/* Weekly Schedule */}
        <div className="mt-12 bg-gray-50/50 p-6 rounded-[10px] border border-gray-100">
          <h3 className="text-xl font-medium mb-6">Weekly Schedule</h3>
          <div className="space-y-6">
            {DAYS_OF_WEEK.map((day, index) => (
              <div
                key={day}
                className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className="min-w-[120px] flex items-center gap-3">
                  <Controller
                    name={`workingHours.${index}.isOpen`}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium",
                      !watch(`workingHours.${index}.isOpen`) &&
                        "text-gray-400 line-through",
                    )}
                  >
                    {day}
                  </span>
                </div>

                {watch(`workingHours.${index}.isOpen`) && (
                  <div className="flex items-center gap-4 flex-1 justify-end">
                    <div className="max-w-[180px] w-full">
                      <Controller
                        name={`workingHours.${index}.openTime`}
                        control={control}
                        render={({ field }) => (
                          <div className="grid gap-1">
                            <TimePicker
                              selected={toTimeOrNull(field.value)}
                              onChange={(val) =>
                                field.onChange(toTimeOrNull(val))
                              }
                              placeholder="Open"
                              className={cn(
                                errors.workingHours?.[index]?.openTime &&
                                  "border-red-500 ring-red-500/20",
                              )}
                            />
                            {errors.workingHours?.[index]?.openTime && (
                              <span className="text-[10px] text-red-500">
                                {errors.workingHours[index].openTime.message}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <span className="text-gray-400 mt-[-10px]">to</span>
                    <div className="max-w-[180px] w-full">
                      <Controller
                        name={`workingHours.${index}.closeTime`}
                        control={control}
                        render={({ field }) => (
                          <div className="grid gap-1">
                            <TimePicker
                              selected={toTimeOrNull(field.value)}
                              onChange={(val) =>
                                field.onChange(toTimeOrNull(val))
                              }
                              placeholder="Close"
                              className={cn(
                                errors.workingHours?.[index]?.closeTime &&
                                  "border-red-500 ring-red-500/20",
                              )}
                            />
                            {errors.workingHours?.[index]?.closeTime && (
                              <span className="text-[10px] text-red-500">
                                {errors.workingHours[index].closeTime.message}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}
                {!watch(`workingHours.${index}.isOpen`) && (
                  <span className="text-sm text-gray-400 italic">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Holidays */}
        {/* <div className="mt-12">
          <h3 className="text-xl font-medium mb-4">Holidays</h3>
          <p className="text-gray-500 text-sm mb-4">
            Select dates when the restaurant will be closed for special occasions.
          </p>
          <div className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full md:w-auto h-12 gap-2"
                >
                  <CalendarIcon className="size-4" />
                  Select Holidays
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Controller
                  name="holidays"
                  control={control}
                  render={({ field }) => (
                    <Calendar
                      mode="multiple"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  )}
                />
              </PopoverContent>
            </Popover>

            <div className="flex flex-wrap gap-2">
              {watch("holidays")?.length > 0 ? (
                watch("holidays").map((date, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-theme-primary/10 text-theme-primary px-3 py-1.5 rounded-full text-sm font-medium border border-theme-primary/20"
                  >
                    {date instanceof Date && !isNaN(date.getTime())
                      ? format(date, "MMM dd, yyyy")
                      : "Invalid Date"}
                    <button
                      type="button"
                      onClick={() => {
                        const newHolidays = watch("holidays").filter(
                          (_, i) => i !== idx
                        );
                        setValue("holidays", newHolidays);
                      }}
                      className="hover:bg-theme-primary/20 rounded-full p-0.5 transition"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No holidays selected</p>
              )}
            </div>
          </div>
        </div> */}

        {/* Image gallery */}
        <div className="mt-10 restaurant-images">
          <h3 className="text-[22px] font-medium mb-2">
            Add Restaurant Images
          </h3>
          {uploadingCount > 0 && (
            <p className="text-sm text-gray-500">
              Uploading {uploadingCount} file(s)...
            </p>
          )}
          <div className="image-gallery grid grid-cols-3 md:grid-cols-4 gap-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative h-[152px] rounded-[10px] overflow-hidden group"
              >
                <img
                  src={img.src}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded-[10px]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70 opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="image-block h-[152px] w-full flex items-center justify-center border border-dashed border-gray-300 rounded-[10px]">
              <label
                htmlFor="images"
                className="cursor-pointer text-gray-500 text-center"
              >
                + Add Image
              </label>
              <input
                type="file"
                id="images"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

        <Button
          className="max-w-[338px] w-full mt-10"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </MainLayout>
  );
};

export default Profile;
