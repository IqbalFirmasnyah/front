'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode
import Image from 'next/image'; // Import Image for Google logo
import Link from 'next/link'; // Use Link for navigation, not 'a' tags

// Import icons from lucide-react if you want to use them for eye/close
import { Eye, EyeOff, X } from 'lucide-react'; 

// Definisikan interface untuk payload JWT yang Anda harapkan
// Sesuaikan dengan JwtPayload interface di backend Anda
interface DecodedToken {
  role: string; // 'user', 'admin', 'superadmin'
  // Anda bisa menambahkan properti lain seperti 'id', 'username', 'namaLengkap' jika perlu
  // sub: number;
  // username: string;
  // namaLengkap: string;
  // adminRole?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Jika login gagal, throw error dari backend
        throw new Error(data.message || 'Login failed'); // Changed to English for consistency
      }

      // Pastikan backend mengembalikan 'accessToken'
      if (!data.accessToken) {
        throw new Error('Access token not found in response.'); // Changed to English
      }

      localStorage.setItem('token', data.accessToken);

      // --- LOGIKA PENGALIHAN BERDASARKAN PERAN ---
      try {
        const decodedToken = jwtDecode<DecodedToken>(data.accessToken);
        
        // Periksa peran dan arahkan sesuai
        if (decodedToken.role === 'admin' || decodedToken.role === 'superadmin') {
          router.push('/admin/dashboard'); // Arahkan admin/superadmin ke dashboard admin
        } else if (decodedToken.role === 'user') {
          router.push('/paket-wisata'); // Arahkan user biasa ke halaman paket wisata
        } else {
          // Fallback jika peran tidak dikenali
          console.warn('Unrecognized role:', decodedToken.role); // Changed to English
          router.push('/'); // Arahkan ke halaman utama atau halaman default lainnya
        }
      } catch (decodeError) {
        // Tangani jika token tidak bisa didekode (misalnya malformed token)
        console.error('Failed to decode token after login:', decodeError); // Changed to English
        setErrorMsg('Login successful, but failed to identify role. Please try again.'); // Changed to English
        router.push('/'); // Fallback ke halaman utama jika gagal dekode
      }
      // --- AKHIR LOGIKA PENGALIHAN BERDASARKAN PERAN ---

    } catch (error: any) {
      console.error('Error during login:', error); // Changed to English
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Implement Google Sign-In logic here
    console.log("Sign In with Google clicked");
    // Redirect to Google OAuth flow or handle client-side Google login
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

        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Login</h1> {/* Changed text color and margin */}

        <form onSubmit={handleLogin}>
          <div className="mb-6"> {/* Increased margin-bottom */}
            <label className="block mb-2 text-gray-700 font-medium text-lg">Email Address</label> {/* Increased font size and margin */}
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200" // Adjusted padding, border, focus style
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address" // Placeholder as per image
            />
          </div>

          <div className="mb-4"> {/* Adjusted margin-bottom */}
            <label className="block mb-2 text-gray-700 font-medium text-lg">Password</label> {/* Increased font size and margin */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent pr-12 transition duration-200" // Adjusted padding, border, focus style, and added pr for icon
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password" // Placeholder as per image
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
            <div className="text-right mt-2">
              <Link href="/forgot-password" className="text-sm text-gray-500 hover:underline">
                Forgot your password?
              </Link>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 text-red-600 text-sm text-center font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 w-full rounded-lg shadow-md transition-colors duration-200 text-lg" // Orange background, adjusted padding, font size, shadow
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'} {/* Changed text */}
          </button>
        </form>

        <div className="text-center my-6 text-gray-500">or</div> {/* "or" separator */}

        {/* Sign In with Google Button */}
        {/* <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold py-3 w-full rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 text-lg"
        >
          <Image src="/icons/google.svg" alt="Google Logo" width={20} height={20} className="mr-3" /> 
          Sign In with Google
        </button> */}

        <p className="mt-8 text-center text-gray-700 text-md"> {/* Adjusted margin and text color */}
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-orange-500 font-semibold hover:underline" // Orange link color
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}