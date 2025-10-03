'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation'; // Removed Next.js specific import
// import Link from 'next/link'; // Removed Next.js specific import
import Image from 'next/image'; // Import Image for Google logo - Note: Image component from next/image will not work outside Next.js environment without custom setup.
import { Eye, EyeOff, X } from 'lucide-react'; // Import icons from lucide-react

export default function RegisterPage() {
  // Dummy router object for non-Next.js environment
  const router = {
    push: (path: string) => console.log(`Navigating to: ${path}`),
    back: () => console.log('Going back'),
  };

  // Updated formData to include 'username', 'fullName', 'email', 'password',
  // and now 'alamat', 'tanggalLahir', 'noHp' as they are required by the backend schema.
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    alamat: '', // Added: Required by backend
    tanggalLahir: '', // Added: Required by backend, will be Date string (YYYY-MM-DD)
    noHp: '', // Added: Required by backend
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [agreeToTerms, setAgreeToTerms] = useState(false); // State for terms checkbox
  const [registrationSuccess, setRegistrationSuccess] = useState(false); // New state for registration success

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setRegistrationSuccess(false); // Reset success state on new submission

    if (!agreeToTerms) {
      setErrorMsg('You must agree to the Terms and Privacy Policy.');
      setLoading(false);
      return;
    }

    try {
      // This fetch call assumes a backend running at localhost:3001
      const res = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          namaLengkap: formData.fullName,
          alamat: formData.alamat, // Included: Required by backend
          tanggalLahir: formData.tanggalLahir, // Included: Required by backend
          noHp: formData.noHp, // Included: Required by backend
          // fotoProfil is optional in backend, not included in form for simplicity
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Assuming backend returns an access_token on successful registration
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      
      setRegistrationSuccess(true); // Set success state
      // Delay redirection slightly to show success message on button
      setTimeout(() => {
        router.push('/paket-wisata'); // Redirect after successful registration
      }, 1500); // Redirect after 1.5 seconds
      
    } catch (error: any) {
      console.error('Error during registration:', error);
      setErrorMsg(error.message);
    } finally {
      // Loading state is set to false only if there's an error or before redirection
      if (!registrationSuccess) { // Only set loading to false if not successful yet (i.e., error occurred)
        setLoading(false);
      }
    }
  };

  const handleGoogleSignUp = () => {
    // Implement Google Sign-Up logic here
    console.log("Sign Up with Google clicked");
    // This typically involves Firebase, NextAuth.js, or a direct OAuth flow.
    // For now, it's just a console log.
  };

  return (
    <div className="min-h-screen bg-gray-900 bg-opacity-70 flex items-center justify-center p-4"> {/* Darker background for modal effect */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-8 pt-6"> {/* Adjusted padding and border-t-4 removed */}
        
        {/* Close Button */}
        <button
          onClick={() => router.back()} // Or router.push('/') to go to home
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Create Account</h1> {/* Changed text color and margin */}

        <form onSubmit={handleSubmit}>
          {/* Username Input Field */}
          <div className="mb-6">
            <label htmlFor="username" className="block mb-2 text-gray-700 font-medium text-lg">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="Choose a unique username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200"
            />
          </div>

          {/* Full Name Input Field */}
          <div className="mb-6">
            <label htmlFor="fullName" className="block mb-2 text-gray-700 font-medium text-lg">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200"
            />
          </div>

          <div className="mb-6"> {/* Increased margin-bottom */}
            <label htmlFor="email" className="block mb-2 text-gray-700 font-medium text-lg">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200"
            />
          </div>

          <div className="mb-4"> {/* Adjusted margin-bottom */}
            <label htmlFor="password" className="block mb-2 text-gray-700 font-medium text-lg">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent pr-12 transition duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* New Alamat Input Field */}
          <div className="mb-6">
            <label htmlFor="alamat" className="block mb-2 text-gray-700 font-medium text-lg">Address</label>
            <input
              type="text"
              id="alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleInputChange}
              required
              placeholder="Enter your full address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200"
            />
          </div>

          {/* New Tanggal Lahir Input Field */}
          <div className="mb-6">
            <label htmlFor="tanggalLahir" className="block mb-2 text-gray-700 font-medium text-lg">Date of Birth</label>
            <input
              type="date" // Use type="date" for date input
              id="tanggalLahir"
              name="tanggalLahir"
              value={formData.tanggalLahir}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200"
            />
          </div>

          {/* New No HP Input Field */}
          <div className="mb-6">
            <label htmlFor="noHp" className="block mb-2 text-gray-700 font-medium text-lg">Phone Number</label>
            <input
              type="tel" // Use type="tel" for phone numbers
              id="noHp"
              name="noHp"
              value={formData.noHp}
              onChange={handleInputChange}
              required
              placeholder="e.g., 08123456789"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200"
            />
          </div>

          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-gray-700 text-sm">
              I agree with{' '}
              <a href="/terms" className="text-orange-500 hover:underline">Terms</a> and{' '}
              <a href="/privacy" className="text-orange-500 hover:underline">Privacy</a>
            </label>
          </div>

          {errorMsg && (
            <div className="mb-4 text-red-600 text-sm text-center font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 w-full rounded-lg shadow-md transition-colors duration-200 text-lg"
            disabled={loading || !agreeToTerms || registrationSuccess} // Disable if loading, not agreed to terms, or success
          >
            {loading ? 'Signing Up...' : registrationSuccess ? 'Success!' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center my-6 text-gray-500">or</div>

        {/* Sign Up with Google Button (commented out) */}
        {/*
        <button
          onClick={handleGoogleSignUp}
          className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold py-3 w-full rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 text-lg"
        >
          Sign Up with Google
        </button>
        */}

        <p className="mt-8 text-center text-gray-700 text-md">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-orange-500 font-semibold hover:underline"
          >
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}