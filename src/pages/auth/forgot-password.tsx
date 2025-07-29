import { useState } from "react";
import { Link } from 'react-router-dom';
import { HelpCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string; general?: string; }>(
    {}
  );
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form validation
  const validateForm = () => {
    const newErrors: { email?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setErrors({});
      setLoading(true);
      setShowSuccessMessage(false);
      try {
        const response = await fetch(`http://localhost:8000/api/users/request-password-reset?email=${encodeURIComponent(email)}`, {
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
        const errorMsg = err.message || "An error occurred";
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Forgot Password Form */}
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

          {/* Forgot Password Form */}
          <div>
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "20px",
                lineHeight: "100%",
                letterSpacing: "0%",
                color: "#585858",
                marginBottom: "8px",
              }}
            >
              Forgot Password
            </h2>

            {!showSuccessMessage ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 text-xs ${
                      errors.email
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200"
                    }`}
                    placeholder="Enter your email"
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
                    height: "46px",
                    margin: "32px auto 0 auto",
                    opacity: 1,
                    borderRadius: "12px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    gap: "8px",
                    color: "white",
                    fontWeight: 500,
                    fontSize: "16px",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  disabled={!email.trim() || loading}
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

            <div className="mt-4 text-center text-xs">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
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
            className="flex items-center space-x-2 transition-colors"
            style={{
              width: "120px",
              height: "30px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontStyle: "normal",
              fontSize: "20px",
              lineHeight: "150%",
              letterSpacing: "0%",
              color: "#F7FAFC",
            }}
          >
            <img
              src="/mdoutlinesupportagent.png"
              alt="Support Agent"
              className="w-5 h-5"
            />
            <span>Support</span>
          </button>
        </div>

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
              width: "542px",
              height: "34px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontStyle: "normal",
              fontSize: "36px",
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
              fontSize: "20px",
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
    </div>
  );
}