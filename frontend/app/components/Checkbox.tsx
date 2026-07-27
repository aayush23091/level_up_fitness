import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => (
  <label className="flex items-center text-xs text-foreground cursor-pointer mb-4">
    <input type="checkbox" className="accent-accent mr-2" {...props} />
    {label}
  </label>
);

export default Checkbox;
