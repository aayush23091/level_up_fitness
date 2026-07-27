import React from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => (
  <div className="w-full max-w-md mx-auto bg-card rounded-xl shadow-lg p-8 border border-border mt-16" style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.15)' }}>
    <h2 className="text-2xl font-bold text-center text-foreground mb-2">{title}</h2>
    <p className="text-center text-muted text-sm mb-6">{subtitle}</p>
    {children}
  </div>
);

export default AuthCard;
