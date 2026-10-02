/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www\\.thendisch\\.com' }],
        destination: 'https://thendisch.com/:path*',
        permanent: true,
      },
    ];
  },
  eslint: {
    // Keep production builds usable until the project installs its ESLint CLI.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
