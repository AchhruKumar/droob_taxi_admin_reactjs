import React from "react";
import Select from "react-select";

const CustomSelect = ({
  options = [],
  value,
  onChange,
  isMulti = false,
  isDisabled = false,
  placeholder = "Select...",
  name,
  label,
  error,
  className = "",
  ...rest
}) => {
  return (
    <div className={`custom-select-container ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-base font-medium text-mainclr dark:text-white"
        >
          {label}
        </label>
      )}
      <Select
        inputId={name}
        name={name}
        options={options}
        value={value}
        onChange={onChange}
        isMulti={isMulti}
        isDisabled={isDisabled}
        placeholder={placeholder}
        className="custom-select"
        classNames={{
          control: () =>
            `border rounded-full py-2 px-3 text-sm md:text-base outline-none focus:outline-none ${
              error ? "border-red-500" : "border-gray-300"
            }`,
          menu: () => "z-100 relative mt-1 bg-white shadow-lg rounded-md",
          option: (state) =>
            `p-2 cursor-pointer ${
              state.isSelected ? "bg-blue-500 text-white" : "text-gray-800"
            } hover:bg-blue-100`,
        }}
        {...rest}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default CustomSelect;
