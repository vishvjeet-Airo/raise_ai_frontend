import { API_BASE_URL } from "@/lib/config";
import { useState } from "react";
import { Link } from 'react-router-dom';
import { HelpCircle, CheckCircle2 } from "lucide-react";
import { SupportModal } from "@/components/SupportModal";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string; general?: string; }>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSupportModal, setShowSupportModal] = useState(false);

  const validateEmail = (email: string) => {
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Please enter a valid email address." });
    } else {
      setErrors({});
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (errors.email) {
      return;
    }

    setLoading(true);
    setShowSuccessMessage(false);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/request-password-reset?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send reset email');
      }

      setShowSuccessMessage(true);

    } catch (err: any) {
      let finalErrorMessage = 'Failed to send reset email. Please try again.';
      if (err.message) {
          if (err.message.toLowerCase().includes('user not found')) {
              finalErrorMessage = 'Email not registered. Please sign up first.';
          } else if (!err.message.includes('Failed to fetch')) {
              finalErrorMessage = err.message;
          }
      }
      setErrorMessage(finalErrorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Forgot Password Form */}
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

          {/* Forgot Password Form */}
          <div>
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "100%",
                letterSpacing: "0%",
                color: "#585858",
                marginBottom: "4px",
              }}
            >
              Forgot Password
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
            </p>

            {!showSuccessMessage ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
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
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '12px 16px',
                      border: errors.email ? '1px solid #E53E3E' : '1px solid #E2E8F0',
                      borderRadius: '8px',
                      background: '#F7FAFC',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      color: '#2D3748',
                      outline: 'none'
                    }}
                    placeholder="Enter your email"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3182CE';
                      e.target.style.boxShadow = '0 0 0 3px rgba(49, 130, 206, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.email ? '#E53E3E' : '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* General Error Message */}
                {errors.general && (
                  <div className="rounded-md bg-red-50 p-2">
                    <div className="text-xs text-red-700">{errors.general}</div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  style={{
                    background: "#052E65",
                    width: "100%",
                    height: "38px",
                    marginTop: "24px",
                    borderRadius: "12px",
                    color: "white",
                    fontWeight: 500,
                    fontSize: "16px",
                    fontFamily: "Inter, sans-serif",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    opacity: (!email.trim() || !!errors.email || loading) ? 0.6 : 1
                  }}
                  disabled={!email.trim() || !!errors.email || loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            ) : (
              <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6 my-4">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800">Link Sent!</h3>
                <p className="text-gray-600 mt-2">
                  A password reset link has been sent to your email address. Please check your inbox.
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/login"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: '#3182CE',
                  textDecoration: 'underline',
                  fontWeight: 500
                }}
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Feature Presentation */}
      <div
        className="hidden lg:flex flex-1 relative overflow-hidden"
        style={{ background: "#052E65" }}
      >
        {/* Support Button */}
        <div className="absolute top-6 left-12 z-10">
          <button
            onClick={() => setShowSupportModal(true)}
            className="flex items-center space-x-2 transition-colors hover:opacity-80"
            style={{
              width: "120px",
              height: "30px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontStyle: "normal",
              fontSize: "17px",
              lineHeight: "150%",
              letterSpacing: "0%",
              color: "#F7FAFC",
            }}
          >
            <img
              src="/MdOutlineSupportAgent.png"
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
              src="/Frame.png"
              alt="Frame"
              width="411"
              height="509"
              className="w-[290px] h-[390px]"
            />
          </div>

          {/* Text Content */}
          <h2
            style={{
              width: "542px",
              height: "34px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 540,
              fontStyle: "normal",
              fontSize: "26px",
              lineHeight: "100%",
              letterSpacing: "0%",
              color: "#F7FAFC",
              marginBottom: "16px",
            }}
          >
            Presenting additional features
          </h2>
          <p
            style={{
              width: "498px",
              height: "84px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "15px",
              lineHeight: "138%",
              letterSpacing: "0%",
              textAlign: "center",
              color: "#CFD9E0",
              marginBottom: "32px",
            }}
          >
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500
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
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Title */}
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
              Request Failed
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

      {/* Support Modal */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </div>
  );
}
