import React from 'react';
import { GithubIcon } from 'lucide-react';

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'https://gitviz.onrender.com/auth/github';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white px-8 py-12 shadow-lg rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">GitHub Branch Viewer</h2>
            <p className="text-gray-600 mb-8">Sign in with GitHub to view your repositories</p>
            <button
              onClick={handleLogin}
              className="flex items-center justify-center w-full px-4 py-2 space-x-3 text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <GithubIcon className="w-5 h-5" />
              <span>Login with GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;