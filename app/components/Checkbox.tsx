import React from 'react';

interface CheckboxProps {
  label: React.ReactNode;
  name: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, name }) => (
  <label className="flex items-center text-xs text-gray-300 cursor-pointer mb-4">
    <input type="checkbox" name={name} className="accent-yellow-500 mr-2" />
    {label}
  </label>
);

export default Checkbox;
