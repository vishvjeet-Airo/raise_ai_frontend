import { API_BASE_URL } from "@/lib/config";
import { useState } from "react";
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

  const response = await fetch(`${API_BASE_URL}api/auth/login`, {
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
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(username)) {
      newErrors.username = "Please enter a valid email address.";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setUsername(newEmail);
    if (errors.username) {
        setErrors(prev => ({ ...prev, username: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setErrors({});
      setLoading(true);
      setApiResponse(null);
      try {
        const data = await loginUser({ username, password });
        // Store access token in local storage (if present)
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        }
        setApiResponse(JSON.stringify(data, null, 2));
        // Redirect to all documents page
        navigate('/documents');
      } catch (err: any) {
        let finalErrorMessage = 'Login failed. Please check your credentials and try again.';
        if (err.message) {
            const lowerCaseError = err.message.toLowerCase();
            if (lowerCaseError.includes('does not exist') || lowerCaseError.includes('user not found')) {
                finalErrorMessage = "User isn't registered. Please sign up first.";
            } else if (lowerCaseError.includes('incorrect username or password')) {
                finalErrorMessage = 'Incorrect Password , Please try again';
            }
        }
        setErrorMessage(finalErrorMessage);
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-[360px] text-sm">
          {/* Logo */}
          <div className="mb-16">
            <img
              src="/accelacompliance-logo.png"
              alt="AccelaCompliance"
              width="220"
              height="41"
              className="w-[220px] h-[41px]"
            />
          </div>

          {/* Sign In Form */}
          <div>
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '18px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: '#585858',
                marginBottom: '4px'
              }}
            >
              Sign in
            </h2>

            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                lineHeight: '140%',
                color: '#A0AEC0',
                marginBottom: '24px'
              }}
            >
              Don't have an account?
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="username"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '100%',
                    color: '#718096',
                    marginBottom: '8px',
                    display: 'block'
                  }}
                >
                  E-mail
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
                    width: '100%',
                    height: '48px',
                    padding: '12px 16px',
                    border: errors.username ? '1px solid #E53E3E' : '1px solid #E2E8F0',
                    borderRadius: '8px',
                    background: '#F7FAFC',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    color: '#2D3748',
                    outline: 'none'
                  }}
                  placeholder="Enter your username"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3182CE';
                    e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.username ? '#E53E3E' : '#E2E8F0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '100%',
                    color: '#718096',
                    marginBottom: '8px',
                    display: 'block'
                  }}
                >
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
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '12px 16px',
                      paddingRight: '48px',
                      border: errors.password ? '1px solid #E53E3E' : '1px solid #E2E8F0',
                      borderRadius: '8px',
                      background: '#F7FAFC',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      color: '#2D3748',
                      outline: 'none'
                    }}
                    placeholder="Enter your password"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3182CE';
                      e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.password ? '#E53E3E' : '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4"
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
              <div className="flex items-center justify-between" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: '15px',
                      height: '15px',
                      accentColor: '#3182CE',
                      marginRight: '7px'
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      color: '#718096'
                    }}
                  >
                    Remember me
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: '#3182CE',
                    textDecoration: 'underline',
                    fontWeight: 500
                  }}
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
                  width: '100%',
                  height: '38px',
                  marginTop: '24px',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: (!username.trim() || !password.trim() || loading) ? 0.6 : 1
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
          <button className="flex items-center space-x-1 text-[10px] text-gray-600 hover:text-gray-900 transition-colors bg-white rounded-full px-2 py-1 shadow-md">
            <HelpCircle className="w-3 h-3" />
            <span className="text-[8px]">Support</span>
          </button>
        </div>
 

      {/* Right Side - Feature Presentation */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: '#052E65' }}>
        {/* Support Button */}
        <div className="absolute top-6 left-12 z-10">
          <button 
            className="flex items-center space-x-2 transition-colors"
            style={{
              width: '120px',
              height: '30px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: '17px',
              lineHeight: '150%',
              letterSpacing: '0%',
              color: '#F7FAFC'
            }}
          >
            <img 
              src="/mdoutlinesupportagent.png" 
              alt="Support Agent" 
              className="w-4 h-4"
            />
            <span>Support</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center items-center text-center px-12 relative z-10 h-full w-full">
          {/* Frame Image */}
          <div className="mt-9 mb-7 relative flex flex-col items-center justify-center">
            <img 
              src="/frame.png" 
              alt="Frame" 
              width="411"
              height="509"
              className="w-[290px] h-[390px]"
            />
          </div>

          {/* Text Content */}
          <h2 
            style={{
              width: '542px',
              height: '34px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 540,
              fontStyle: 'normal',
              fontSize: '26px',
              lineHeight: '100%',
              letterSpacing: '0%',
              color: '#F7FAFC',
              marginBottom: '16px'
            }}
          >
            Presenting additional features
          </h2>
          <p 
            style={{
              width: '498px',
              height: '84px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '15px',
              lineHeight: '138%',
              letterSpacing: '0%',
              textAlign: 'center',
              color: '#CFD9E0',
              marginBottom: '32px'
            }}
          >
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500
          </p>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            {/* Error Title */}
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
              Login Failed
            </h3>

            {/* Error Message */}
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              {errorMessage}
            </p>

            {/* Close Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
