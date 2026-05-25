import React from 'react';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import Checkbox from '../components/Checkbox';
import { PersonIcon, MailIcon, LockIcon, ArrowForwardIcon } from '../components/Icons';

const SignupPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] flex flex-col">
      <header className="w-full flex justify-between items-center px-8 py-4">
        <span className="text-lg font-bold text-yellow-400">LevelUp Fitness</span>
        <div>
          <a href="/login" className="text-gray-300 mr-6 hover:underline">Login</a>
          <a href="/signup" className="bg-yellow-400 text-black px-4 py-1 rounded font-semibold ml-2">Join Now</a>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <AuthCard
          title="Elevate Your Game"
          subtitle="Join the community of elite athletes and data-driven coaches today."
        >
          <form className="space-y-0">
            <InputField label="Full Name" name="fullname" placeholder="Enter your full name" icon={<PersonIcon />} />
            <InputField label="Email Address" name="email" placeholder="Enter your email address" icon={<MailIcon />} />
            <div className="flex gap-2">
              <div className="w-1/2">
                <InputField label="Password" name="password" type="password" placeholder="********" icon={<LockIcon />} />
              </div>
              <div className="w-1/2">
                <InputField label="Confirm" name="confirm" type="password" placeholder="********" icon={<LockIcon />} />
              </div>
            </div>
            <Checkbox
              name="terms"
              label={<span>I agree to the <a href="#" className="underline text-yellow-400">Terms of Service</a> and <a href="#" className="underline text-yellow-400">Privacy Policy</a>.</span>}
            />
            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-md mt-2 transition-colors flex items-center justify-center"
            >
              Create Account <span className="ml-2"><ArrowForwardIcon /></span>
            </button>
          </form>
          <div className="text-center mt-6 text-gray-400 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-yellow-400 hover:underline">Login to LevelUp</a>
          </div>
        </AuthCard>
      </main>
    </div>
  );
};

export default SignupPage;
