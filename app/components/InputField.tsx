import React from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  name: string;
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', placeholder, name, icon }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold mb-1 text-gray-300" htmlFor={name}>{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`w-full rounded-md bg-[#232323] border border-[#333] text-gray-100 px-10 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder:text-gray-400`}
        autoComplete="off"
      />
    </div>
  </div>
);

export default InputField;
