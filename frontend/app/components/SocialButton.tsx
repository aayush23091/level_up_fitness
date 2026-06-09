import React from 'react';
import { AppleIcon } from './AppleIcon';

interface SocialButtonProps {
  provider: 'Google' | 'Apple';
}

const GoogleIcon = (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><g><path d="M44.5 20H24V28.5H36.5C35.1 33.1 30.9 36.5 25.5 36.5C18.6 36.5 13 30.9 13 24C13 17.1 18.6 11.5 25.5 11.5C28.5 11.5 31.2 12.6 33.2 14.4L39.1 8.5C35.6 5.3 30.9 3.5 25.5 3.5C14.7 3.5 6 12.2 6 23C6 33.8 14.7 42.5 25.5 42.5C35.1 42.5 43.5 34.1 43.5 24C43.5 22.7 43.4 21.4 43.2 20.1L44.5 20Z" fill="#FFC107"/><path d="M6 12.2L13.1 17.7C15.2 13.2 20 11.5 25.5 11.5C28.5 11.5 31.2 12.6 33.2 14.4L39.1 8.5C35.6 5.3 30.9 3.5 25.5 3.5C18.6 3.5 13 7.7 10.2 13.1L6 12.2Z" fill="#FF3D00"/><path d="M25.5 42.5C30.8 42.5 35.3 40.7 38.7 37.7L32.1 32.3C30.1 33.7 27.9 34.5 25.5 34.5C20.9 34.5 16.9 31.3 15.5 27.2L6.1 32.8C9.1 38.2 16.6 42.5 25.5 42.5Z" fill="#4CAF50"/><path d="M43.2 20.1H42V20H24V28.5H36.5C35.8 30.7 34.3 32.6 32.1 34.1L38.7 37.7C41.7 34.9 43.5 30.9 43.5 24C43.5 22.7 43.4 21.4 43.2 20.1Z" fill="#1976D2"/></g></svg>
);

const SocialButton: React.FC<SocialButtonProps> = ({ provider }) => (
  <button
    type="button"
    className="flex items-center justify-center w-full py-2 mb-2 rounded-md border border-[#333] bg-[#181818] hover:bg-[#232323] text-gray-100 font-medium transition-colors"
  >
    <span className="mr-2">
      {provider === 'Google' ? GoogleIcon : <AppleIcon />}
    </span>
    Continue with {provider}
  </button>
);

export default SocialButton;
