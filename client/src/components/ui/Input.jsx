import React from 'react';

const Input = ({ label, error, className, ...props }) => {
  return (
    <div className="input-wrapper w-full">
      {label && <label className="block mb-2 text-sm font-semibold text-slate-700">{label}</label>}

      <input
        {...props}
        className={`input ${error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""} ${className || ""}`}
      />

      {error && <p className="error-text text-red-500 text-sm font-medium mt-1">{error}</p>}
    </div>
  )
}

export default Input;