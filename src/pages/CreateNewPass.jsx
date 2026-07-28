import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WelcomeLayout from "@/layouts/WelcomeLayout";
import { RESPONSE_CODE } from "@/utils/constants";
import { AUTH } from "@/utils/endPoints";
import { patchRequest, postRequest } from "@/utils/http-client/axiosClient";
import { useToast } from "@/utils/toaster";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
const schema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Password should be at least 6 characters")
    .required("Password is required"),
  cpassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const CreateNewPass = () => {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      password: "",
      cpassword: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    const payload = {
      token: sessionStorage.getItem("resetToken"),
      password: data.password,
    };

    try {
      const response = await patchRequest(`${AUTH.RESET_PASSWORD}`, payload);

      if (response.status === RESPONSE_CODE[200]) {
        reset();
        sessionStorage.clear();
        setDialogOpen(true);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data.message);
    }
    setLoading(false);
  };
  return (
    <WelcomeLayout title="Create New Password">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="New Password"
          type="password"
          id="new_password"
          placeholder="Enter new password"
          parentClass="mb-4"
          {...register("password")}
          error={errors.password?.message}
        />
        <Input
          label="Confirm New Password"
          type="password"
          id="cpassword"
          placeholder="Re-enter new password"
          parentClass="mb-4"
          {...register("cpassword")}
          error={errors.cpassword?.message}
        />
        <Button
          className={"w-full"}
          loading={loading}
          type="submit"
          variant={"default"}
        >
          Change password
        </Button>
        <ConfirmationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          triggerText="Sign up"
          triggerClass={"w-full"}
          title="Password Changed"
          description="Your new password has been changed now."
          linkTo="/login"
          linkText="Continue Login"
          triggerVariant="default"
        />
      </form>
    </WelcomeLayout>
  );
};

export default CreateNewPass;
