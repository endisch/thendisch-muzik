/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Keep production builds usable until the project installs its ESLint CLI.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
