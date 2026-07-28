// src/ui/toast/ToastProvider.js
import React, { createContext, useContext, useRef, useMemo } from "react";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const toastRef = useRef(null);

  const api = useMemo(
    () => ({
      show: (msg) => toastRef.current && toastRef.current.show(msg),
      success: (summary, detail, life = 3000) =>
        toastRef.current &&
        toastRef.current.show({ severity: "success", summary, detail, life }),
      info: (summary, detail, life = 3000) =>
        toastRef.current &&
        toastRef.current.show({ severity: "info", summary, detail, life }),
      warn: (summary, detail, life = 4000) =>
        toastRef.current &&
        toastRef.current.show({ severity: "warn", summary, detail, life }),
      error: (summary, detail, life = 5000) =>
        toastRef.current &&
        toastRef.current.show({ severity: "error", summary, detail, life }),
      clear: () => toastRef.current && toastRef.current.clear(),
    }),
    []
  );

  return (
    <ToastContext.Provider value={api}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}
