/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    RAPID_API_KEY: process.env.RAPID_API_KEY,
  },
};

export default nextConfig;
