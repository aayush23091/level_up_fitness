import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => (
  <label className="flex items-center text-xs text-gray-300 cursor-pointer mb-4">
    <input type="checkbox" className="accent-yellow-500 mr-2" {...props} />
    {label}
  </label>
);

export default Checkbox;
