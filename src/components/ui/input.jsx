import * as React from "react";
import { cn } from "@/lib/utils";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import { Label } from "@/components/ui/label";

// Add error prop for validation messages
function Input({ className, type = "text", label, parentClass, error, ...props }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField
    ? showPassword
      ? "text"
      : "password"
    : type;

  if (label) {
    return (
      <div
        className={cn(
          "relative bg-droobGray-200 rounded-[8px] p-4 w-full",
          parentClass
        )}
      >
        <Label
          htmlFor={props.id}
          className="block text-sm font-medium text-droobGray-400 mb-1"
        >
          {label}
        </Label>
        <input
          type={inputType}
          data-slot="input"
          aria-invalid={!!error}
          className={cn(
            "bg-transparent focus:border-0 focus:outline-0 w-full placeholder:text-droobGray-300",
            isPasswordField && "pr-10",
            error && "border border-red-400", // highlight error
            className
          )}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[50%] transform -translate-y-1/2 text-droobGray-400 cursor-pointer"
          >
            {showPassword ? (
              <LuEyeClosed className="text-droobGray-300" size={20} />
            ) : (
              <LuEye className="text-droobGray-300" size={20} />
            )}
          </button>
        )}
        {error && (
          <p className="text-red-500 text-xs mt-2">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={parentClass}>
      <input
        type={inputType}
        data-slot="input"
        aria-invalid={!!error}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex py-5 px-5 w-full min-w-0 rounded-md bg-droobGray-200 leading-none text-sm h-12 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          error && "border border-red-400",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}
    </div>
  );
}

export { Input };
