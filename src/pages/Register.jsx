import React, { useState } from "react";
import WelcomeLayout from "@/layouts/WelcomeLayout";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/PhoneInput"; // your unchanged PhoneInput
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import {
  getCountryCallingCode,
  parsePhoneNumber,
} from "react-phone-number-input";
import { useToast } from "@/utils/toaster";
import { postRequest } from "@/utils/http-client/axiosClient";
import { AUTH } from "@/utils/endPoints";
import { RESPONSE_CODE } from "@/utils/constants";

const phoneValidation = yup
  .string()
  .required("Phone number is required")
  .test("is-valid-phone", "Phone number is not valid", function (value) {
    if (!value) return false;
    try {
      const phoneNumber = parsePhoneNumber(value);
      if (!phoneNumber.isValid()) return false;
      // Optionally check length — e.g., national number length between 9–10
      const length = phoneNumber.nationalNumber.length;
      return length >= 9 && length <= 10;
    } catch {
      return false;
    }
  });
const nameRegex = /^[A-Z][a-zA-Z]{1,10}$/;
const schema = yup.object().shape({
  firstName: yup
    .string()
    .required("First Name is required")
    .matches(
      nameRegex,
      "First letter must be uppercase and length between 2–10 letters",
    ),
  lastName: yup
    .string()
    .required("Last Name is required")
    .matches(
      nameRegex,
      "First letter must be uppercase and length between 2–10 letters",
    ),
  phone: phoneValidation,
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password should be at least 6 characters")
    .required("Password is required"),
  cpassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  terms: yup.bool().oneOf([true], "You must accept the terms and condition"),
});

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState("SY");
  const toast = useToast();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      cpassword: "",
      terms: false,
    },
  });

  const phoneValue = watch("phone");

  const onSubmit = async (data) => {
    setLoading(true);
    let countryCode = "";
    let phoneNumber = "";

    try {
      const phoneObj = parsePhoneNumber(data.phone);
      countryCode = phoneObj ? "+" + phoneObj.countryCallingCode : "";
      phoneNumber = phoneObj ? phoneObj.nationalNumber : data.phone;
    } catch (err) {
      countryCode = selectedCountry
        ? "+" + getCountryCallingCode(selectedCountry)
        : "";
      phoneNumber = data.phone;
    }

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      countryCode,
      phoneNumber,
      password: data.password,
      roleName: "restaurant_owner",
    };

    try {
      const response = await postRequest(`${AUTH.SIGNUP}`, payload);

      // FIX: Check for status 200 (as per your API log) OR 201
      // Also check for the success boolean in the response body
      if (response.status === 200 || response.data?.success === true) {
        reset();
        setDialogOpen(true); // This opens the dialog
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <WelcomeLayout title="Restaurant Sign Up">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="register-form grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            id="fname"
            placeholder="Enter first name"
            {...register("firstName")}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name"
            type="text"
            id="lname"
            placeholder="Enter last name"
            {...register("lastName")}
            error={errors.lastName?.message}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                {...field}
                defaultCountry={selectedCountry}
                className="col-span-2"
                error={errors.phone?.message}
              />
            )}
          />
          <Input
            label="Email"
            type="email"
            id="email"
            placeholder="email@address.com"
            parentClass="col-span-2"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            id="password"
            placeholder="•••••••"
            parentClass="col-span-2"
            {...register("password")}
            error={errors.password?.message}
          />
          <Input
            label="Confirm Password"
            type="password"
            id="cpassword"
            placeholder="••••••••"
            parentClass="col-span-2"
            {...register("cpassword")}
            error={errors.cpassword?.message}
          />
        </div>
        <div className="flex items-center gap-3 my-6">
          <Controller
            name="terms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="terms"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="terms" className="m-0 font-normal">
            I accept the{" "}
            <Link to="/terms" className="text-theme-primary">
              terms and conditions
            </Link>
          </Label>
        </div>
        {errors.terms && (
          <p className="text-red-600 text-xs mb-4">{errors.terms.message}</p>
        )}
        <Button
          className={"w-full"}
          loading={loading}
          type="submit"
          variant={"default"}
        >
          Sign up
        </Button>
        <ConfirmationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          triggerText="Sign up"
          triggerClass="w-full"
          title="Email Verification"
          description="An email verification link has been sent to your registered email id."
          linkTo="/login"
          linkText="Okay"
          triggerVariant="default"
        />
        <p className="mb-0 mt-10 text-sm">
          Already a Member?{" "}
          <Link
            to="/login"
            className="text-droobGray-900 underline font-semibold"
          >
            SignIn
          </Link>
        </p>
      </form>
    </WelcomeLayout>
  );
};

export default Register;
