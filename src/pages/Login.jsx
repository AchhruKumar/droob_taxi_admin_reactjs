import React, { useEffect, useRef, useState } from "react";
import { data, useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WelcomeLayout from "@/layouts/WelcomeLayout";
import { postRequest } from "@/utils/http-client/axiosClient";
import { AUTH } from "@/utils/endPoints";
import { useToast } from "@/utils/toaster";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { loginAction } from "@/modules/Auth/Login/LoginActions";

const schema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter valid email address",
    ),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const { loader, message, messageType } = useSelector(
    (state) => state.request,
  );

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
      email: "",
      password: "",
    },
  });
  const location = useLocation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const didVerifyRef = useRef(false);
  const lastTokenRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      didVerifyRef.current = false;
      lastTokenRef.current = null;
      return;
    }

    if (didVerifyRef.current && lastTokenRef.current === token) return;

    const ac = new AbortController();
    const verify = async () => {
      try {
        didVerifyRef.current = true;
        lastTokenRef.current = token;
        setLoading(true);

        const res = await postRequest(`${AUTH.VERIFY}`, { token });
        toast.success("Email verified successfully!");
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Email verification failed.";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [location.search, toast]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogin = async (e) => {
    try {
      const payload = {
        email: e.email,
        password: e.password,
      };
      dispatch(loginAction(payload, navigate));
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!loader && messageType === "error") {
      toast.error(message);
    }
  }, [loader]);

  return (
    <WelcomeLayout title="Restaurant Login">
      <form onSubmit={handleSubmit(handleLogin)}>
        <Input
          label="Email"
          type="email"
          id="email"
          placeholder="email@address.com"
          parentClass="mb-4"
          {...register("email")}
          error={errors?.email?.message}
        />
        <Input
          label="Password"
          type="password"
          id="password"
          {...register("password")}
          error={errors?.password?.message}
          placeholder="••••••••"
        />
        {/* <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-500 my-4 inline-block hover:underline"
          >
            Forgot Password?
          </Link>
        </div> */}
        <Button type="submit" className="w-full" loading={loader}>
          Login
        </Button>
        <p className="mb-0 mt-10 text-sm">
          Become a Member?{" "}
          <Link
            to="/signup"
            className="text-droobGray-900 underline font-semibold"
          >
            SignUp
          </Link>
        </p>
      </form>
    </WelcomeLayout>
  );
};

export default Login;
