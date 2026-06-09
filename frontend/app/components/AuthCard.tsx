import React from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => (
  <div className="w-full max-w-md mx-auto bg-[#181818] rounded-xl shadow-lg p-8 border border-[#232323] mt-16" style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.25)' }}>
    <h2 className="text-2xl font-bold text-center text-gray-100 mb-2">{title}</h2>
    <p className="text-center text-gray-400 text-sm mb-6">{subtitle}</p>
    {children}
  </div>
);

export default AuthCard;
