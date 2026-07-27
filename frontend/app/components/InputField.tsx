import React, { forwardRef } from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, type = 'text', placeholder, icon, error, className, ...props }, ref) => (
    <div className="mb-4">
      <label className="block text-xs font-semibold mb-1 text-foreground" htmlFor={props.id || props.name}>{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-md bg-card-secondary border ${
            error ? 'border-red-500' : 'border-border'
          } text-foreground px-10 py-2 focus:outline-none focus:ring-2 ${
            error ? 'focus:ring-red-500' : 'focus:ring-accent'
          } placeholder:text-muted ${className || ''}`}
          autoComplete="off"
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
);

InputField.displayName = 'InputField';

export default InputField;
