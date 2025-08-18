/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', 
  reactStrictMode: true,
  swcMinify: true,
  // Allow React Router to handle client-side routing
  trailingSlash: false,
  // Custom webpack configuration if needed
  webpack: (config) => {
    return config;
  },
}

module.exports = nextConfig;
