import MainLayout from "@/layouts/MainLayout";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector } from "react-redux";
import { WALLET } from "@/utils/endPoints";
import { postRequest } from "@/utils/http-client/axiosClient";
import { RESPONSE_CODE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/utils/toaster";

const schema = yup.object().shape({
  bankname: yup.string().required("Bank name is required"),
  accountHolderName: yup.string().required("Account holder's name is required"),
  accountNumber: yup
    .string()
    .required("Account number is required")
    .matches(/^\d{12}$/, "Account number must be 12 digits"),
  cAccountNumber: yup
    .string()
    .oneOf([yup.ref("accountNumber"), null], "Account numbers must match")
    .required("Confirm account number is required"),
  code: yup.string().required("Swift code is required"),
});

const AddMethod = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      bankname: "",
      accountHolderName: "",
      accountNumber: "",
      cAccountNumber: "",
      code: "",
    },
  });
  const login = useSelector((state) => state.login);
  const [loading, setLoading] = useState(false);
  console.log(login?.user?.resturant?.id, "cshbjkbdjksbdsdd");
  const navigate = useNavigate();
  const toast = useToast();
  const onSubmit = async (data) => {
    setLoading(true);
    const payload = {
      resturantId: login?.user?.resturant?.id,
      bankname: data.bankname,
      accountHolderName: data.accountHolderName,
      accountNumber: data.accountNumber,
      code: data.code,
    };

    try {
      const response = await postRequest(`${WALLET.ADD_BANK}`, payload);

      if (response.status === RESPONSE_CODE[200]) {
        reset();
        navigate("/wallet");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data.message);
    }
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="pb-5 mb-10 border-b flex justify-between items-center flex-wrap">
        <h2 className="text-[28px] font-medium">Add Payment Mode</h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-[700px] space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="grid">
            <Label htmlFor="bankname">Bank Name</Label>
            <Input
              id="bankname"
              placeholder="Enter bank name"
              {...register("bankname")}
            />
            {errors.bankname && (
              <span className="text-red-500 text-sm">
                {errors.bankname.message}
              </span>
            )}
          </div>

          <div className="grid">
            <Label htmlFor="accountHolderName">
              Account Holder's Full Name
            </Label>
            <Input
              id="accountHolderName"
              placeholder="Enter your full name"
              {...register("accountHolderName")}
            />
            {errors.accountHolderName && (
              <span className="text-red-500 text-sm">
                {errors.accountHolderName.message}
              </span>
            )}
          </div>

          <div className="grid">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="Enter 12 digit account number"
              {...register("accountNumber")}
            />
            {errors.accountNumber && (
              <span className="text-red-500 text-sm">
                {errors.accountNumber.message}
              </span>
            )}
          </div>

          <div className="grid">
            <Label htmlFor="cAccountNumber">Confirm Account Number</Label>
            <Input
              id="cAccountNumber"
              placeholder="Re-enter account number"
              {...register("cAccountNumber")}
            />
            {errors.cAccountNumber && (
              <span className="text-red-500 text-sm">
                {errors.cAccountNumber.message}
              </span>
            )}
          </div>

          <div className="grid md:col-span-2">
            <Label htmlFor="code">Swift Code</Label>
            <Input
              id="code"
              placeholder="Enter swift code"
              {...register("code")}
            />
            {errors.code && (
              <span className="text-red-500 text-sm">
                {errors.code.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-7">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/wallet")}
          >
            Cancel
          </Button>
          <Button loading={loading} type="submit" variant="default">
            Add
          </Button>
        </div>
      </form>
    </MainLayout>
  );
};

export default AddMethod;
