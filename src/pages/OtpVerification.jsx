import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import WelcomeLayout from "@/layouts/WelcomeLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/utils/toaster";
import { RESPONSE_CODE } from "@/utils/constants";
import { AUTH } from "@/utils/endPoints";
import { postRequest } from "@/utils/http-client/axiosClient";

const schema = yup.object({
  otp: yup
    .string()
    .required("OTP is required")
    .matches(/^\d+$/, "OTP must contain only digits")
    .length(4, "OTP must be 4 digits"),
});

const OtpVerification = () => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { otp: "" },
    mode: "onSubmit",
  });
  const [resendLoading, setResendLoadng] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const onSubmit = async (values) => {
    setLoading(true);
    console.log("OTP submitted:", values.otp);

    const payload = {
      token: sessionStorage.getItem("forgetToken"),
      otp: values.otp,
    };

    try {
      const response = await postRequest(`${AUTH.OTP_VERIFIED}`, payload);
      if (response.status === RESPONSE_CODE[200]) {
        reset();
        sessionStorage.clear();
        sessionStorage.setItem("resetToken", response.data.data);
        navigate("/create-new-password");
        toast.success("OTP has been sent succesfully");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data.message);
    }

    setLoading(false);
  };

  const handleResetPassword = async () => {
    setResendLoadng(true);

    const payload = {
      email: sessionStorage.getItem("email"),
    };

    try {
      const response = await postRequest(`${AUTH.FORGET_PASSSWORD}`, payload);
      if (response.status === RESPONSE_CODE[200]) {
        reset();
        toast.success("OTP has been sent succesfully");
        sessionStorage.setItem("forgetToken", response.data.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data.message);
    }
    setResendLoadng(false);
  };

  return (
    <WelcomeLayout title="Enter OTP">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          control={control}
          name="otp"
          render={({ field }) => (
            <div className="w-full">
              <InputOTP
                maxLength={4}
                value={field.value}
                onChange={field.onChange}
              >
                <InputOTPGroup className="justify-center mb-2 w-full">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
              {errors.otp && (
                <p className="text-center text-xs text-red-500">
                  {errors.otp.message}
                </p>
              )}
            </div>
          )}
        />

        <div className="flex items-center gap-4 mt-6">
          <Button
            type="button"
            className="w-full shrink"
            variant="outline"
            onClick={handleResetPassword}
            loading={resendLoading}
          >
            Resend OTP
          </Button>
          <Button
            type="submit"
            className="w-full shrink"
            variant="default"
            disabled={loading}
            loading={loading}
          >
            Verify
          </Button>
        </div>
      </form>
    </WelcomeLayout>
  );
};

export default OtpVerification;
