/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove or comment out rewrites if you don't want to proxy API calls anymore
  /*
  async rewrites() {
    const azureApiBase = process.env.AZURE_API_BASE_URL?.replace(/\/v1$/, '') || ''

    return [
      {
        source: '/api/:path*',
        destination: `${azureApiBase}/docs/api/:path*`,
      },
    ]
  },
  */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
    ],
  },
}

export default nextConfig
