import { useState } from "react";
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, HelpCircle } from "lucide-react";

async function loginUser({ username, password }: { username: string; password: string }) {
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('username', username);
  params.append('password', password);
  params.append('scope', '');
  params.append('client_id', 'string');
  params.append('client_secret', ''); // You can set this if needed

  const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json',
    },
    body: params.toString(),
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    general?: string;
  }>({});
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form validation
  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setErrors({});
      setLoading(true);
      setApiResponse(null);
      try {
        const data = await loginUser({ username, password });
        // Store access token in cookie (if present)
        if (data.access_token) {
          Cookies.set('access_token', data.access_token, { path: '/', sameSite: 'strict' });
        }
        setApiResponse(JSON.stringify(data, null, 2));
        // Redirect to all documents page
        navigate('/documents');
      } catch (err: any) {
        setApiResponse(err.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-sm text-sm">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">R</span>
              </div>
              <div>
                <div className="text-base font-semibold text-gray-900">RAISE-AI</div>
                <div className="text-[12px] text-gray-500">Regulatory Action Intelligence & Summarization Engine</div>
              </div>
            </div>
          </div>

          {/* Sign In Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In</h2>
            
            <p className="text-sm text-gray-600 mb-8">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="username"
                  style={{
                    color: '#718096',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '20px',
                    letterSpacing: '-0.15px'
                  }}
                  className="mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) {
                      setErrors(prev => ({ ...prev, username: undefined }));
                    }
                  }}
                  style={{
                    width: '428px',
                    height: '20px',
                    left: '-1px',
                    opacity: 1,
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: errors.username ? '1px solid #F56565' : '1px solid #E2E8F0',
                    background: '#F7FAFC',
                    color: '#2D3748',
                    fontSize: '14px'
                  }}
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 text-xs ${
                      errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs text-gray-600">Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* General Error Message */}
              {errors.general && (
                <div className="rounded-md bg-red-50 p-2">
                  <div className="text-xs text-red-700">{errors.general}</div>
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                style={{
                  background: '#052E65',
                  width: '482px',
                  height: '46px',
                  margin: '32px auto 0 auto',
                  opacity: 1,
                  borderRadius: '12px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  gap: '8px',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '16px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                disabled={!username.trim() || !password.trim() || loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              {apiResponse && (
                <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-800 whitespace-pre-wrap">
                  {apiResponse}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Support Button */}
      <div className="lg:hidden fixed top-4 right-4 z-10">
        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-white rounded-full px-3 py-2 shadow-md">
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm">Support</span>
        </button>
      </div>

      {/* Right Side - Feature Presentation */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 relative overflow-hidden">
        {/* Support Button */}
        <div className="absolute top-6 right-6 z-10">
          <button className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm">Support</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center items-center text-center px-12 relative z-10 h-full w-full">
          {/* 3D Illustration Placeholder */}
          <div className="mb-12 relative flex flex-col items-center justify-center">
            {/* Main cylindrical base */}
            <div className="w-48 h-32 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full relative shadow-2xl">
              {/* Glowing top */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-40 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-80 blur-sm"></div>
              
              {/* Geometric network overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-32 h-24 text-white/30" viewBox="0 0 100 60">
                  <path d="M20,20 L40,10 L60,20 L80,10 M20,20 L20,40 M40,10 L40,30 M60,20 L60,40 M80,10 L80,30" 
                        stroke="currentColor" strokeWidth="1" fill="none"/>
                  <circle cx="20" cy="20" r="2" fill="currentColor"/>
                  <circle cx="40" cy="10" r="2" fill="currentColor"/>
                  <circle cx="60" cy="20" r="2" fill="currentColor"/>
                  <circle cx="80" cy="10" r="2" fill="currentColor"/>
                  <circle cx="20" cy="40" r="2" fill="currentColor"/>
                  <circle cx="40" cy="30" r="2" fill="currentColor"/>
                  <circle cx="60" cy="40" r="2" fill="currentColor"/>
                  <circle cx="80" cy="30" r="2" fill="currentColor"/>
                </svg>
              </div>

              {/* Side pillars */}
              <div className="absolute -left-8 top-4 w-6 h-20 bg-gradient-to-b from-purple-400 to-purple-600 rounded-lg shadow-lg"></div>
              <div className="absolute -right-8 top-4 w-6 h-20 bg-gradient-to-b from-purple-400 to-purple-600 rounded-lg shadow-lg"></div>
            </div>

            {/* Floating particles */}
            <div className="absolute -top-8 -left-8 w-2 h-2 bg-white rounded-full opacity-60"></div>
            <div className="absolute -top-4 -right-6 w-1 h-1 bg-white rounded-full opacity-80"></div>
            <div className="absolute top-2 -left-12 w-1 h-1 bg-white rounded-full opacity-70"></div>
            <div className="absolute -bottom-2 -right-10 w-2 h-2 bg-white rounded-full opacity-50"></div>
          </div>

          {/* Text Content */}
          <h2 className="text-2xl font-semibold text-white mb-4">
            Presenting RAISE-AI
          </h2>
          <p className="text-blue-100 leading-relaxed max-w-md mb-8">
            Upload your pdf and see the magic!
          </p>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
           