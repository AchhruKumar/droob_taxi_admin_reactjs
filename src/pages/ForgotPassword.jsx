import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WelcomeLayout from "@/layouts/WelcomeLayout";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useToast } from "@/utils/toaster";
import { postRequest } from "@/utils/http-client/axiosClient";
import { AUTH } from "@/utils/endPoints";
import { RESPONSE_CODE } from "@/utils/constants";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
    },
  });
  const toast = useToast();

  const handleForgetPassword = async (data) => {
    setLoading(true);

    const payload = {
      email: data.email,
    };

    try {
      const response = await postRequest(`${AUTH.FORGET_PASSSWORD}`, payload);
      if (response.status === RESPONSE_CODE[200]) {
        reset();
        setDialogOpen(true);
        sessionStorage.setItem("email", data.email);
        sessionStorage.setItem("forgetToken", response.data.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data.message);
    }
    setLoading(false);
  };
  return (
    <WelcomeLayout title="Forgot Password">
      <form onSubmit={handleSubmit(handleForgetPassword)}>
        <Input
          label="Email"
          type="email"
          id="email"
          placeholder="Enter email"
          parentClass="mb-4"
          {...register("email")}
          error={errors.email?.message}
        />
        <div className="grid grid-cols-2 gap-4">
          <Button className="w-full shrink" variant="outline" asChild>
            <Link to="/login">Back to Login</Link>
          </Button>
          <Button loading={loading} type="submit" variant={"default"}>
            Get OTP
          </Button>
          <ConfirmationDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            triggerText="Get OTP"
            title="OTP Sent"
            description="We’ve sent you the 4 digit code to your email, please check your email."
            linkTo="/otp-verification"
            linkText="Okay"
            triggerVariant="default"
          />
        </div>
      </form>
    </WelcomeLayout>
  );
};

export default ForgotPassword;
