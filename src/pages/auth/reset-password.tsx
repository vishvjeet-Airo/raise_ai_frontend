import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isTokenValidating, setIsTokenValidating] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError("No reset token found. Please request a new password reset.");
        setIsTokenValidating(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/api/auth/validate-reset-token?token=${token}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to validate token.");
        }
        setIsTokenValidating(false);
      } catch (err: any) {
        setTokenError(err.message || "An error occurred during token validation.");
        setIsTokenValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validateForm = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    }
    if (newPassword.trim().length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setErrors({});
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/auth/reset-password", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token,
            password: newPassword,
            confirm_password: confirmPassword,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to reset password.");
        }

        const result = await response.json();
        setSuccessMessage(result.message || "Password has been reset successfully.");
        setShowSuccessModal(true);
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);

      } catch (err: any) {
        const errorMsg = err.message || 'Failed to reset password';
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderContent = () => {
    if (isTokenValidating) {
      return (
        <div className="text-center">
          <p>Validating your reset link...</p>
        </div>
      );
    }

    if (tokenError) {
      return (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Link Invalid or Expired</h2>
          <p className="text-gray-600 mb-6">{tokenError}</p>
          <Link to="/auth/forgot-password" className="text-blue-600 hover:underline">
            Request a new password reset link
          </Link>
        </div>
      );
    }

    return (
      <div>
        <h2 
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '20px',
            lineHeight: '100%',
            letterSpacing: '0%',
            color: '#585858',
            marginBottom: '8px'
          }}
        >
          Reset Password
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password Field */}
          <div>
            <label htmlFor="new-password" className="block text-xs font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) {
                    setErrors(prev => ({ ...prev, newPassword: undefined }));
                  }
                }}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 text-xs ${
                  errors.newPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                }`}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-2"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label htmlFor="confirm-password" className="block text-xs font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 text-xs ${
                  errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                }`}
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="rounded-md bg-red-50 p-2">
              <div className="text-xs text-red-700">{errors.general}</div>
            </div>
          )}

          {/* Reset Password Button */}
          <button
            type="submit"
            style={{
              background: '#052E65',
              width: '100%',
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
            disabled={!newPassword.trim() || !confirmPassword.trim() || loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Reset Password Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-sm text-sm">
          {/* Logo */}
          <div className="mb-12">
            <img 
              src="/accelacompliance-logo.png" 
              alt="AccelaCompliance" 
              width="220" 
              height="41"
              className="w-[220px] h-[41px]"
            />
          </div>

          {/* Content Area */}
          {renderContent()}
        </div>
      </div>

      {/* Right Side - Feature Presentation */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: '#052E65' }}>
        {/* Content */}
        <div className="flex flex-col justify-center items-center text-center px-12 relative z-10 h-full w-full">
          {/* Frame Image */}
          <div className="mb-8 relative flex flex-col items-center justify-center">
            <img 
              src="/frame.png" 
              alt="Frame" 
              width="411"
              height="509"
              className="w-[411px] h-[509px]"
            />
          </div>

          {/* Text Content */}
          <h2 
            style={{
              width: '542px',
              height: '34px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontStyle: 'normal',
              fontSize: '36px',
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
              fontSize: '20px',
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
              Success!
            </h3>
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              {successMessage}
            </p>
            <p className="text-gray-500 text-center text-sm">
              Redirecting to login...
            </p>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
              Reset Failed
            </h3>
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              {errorMessage}
            </p>
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

