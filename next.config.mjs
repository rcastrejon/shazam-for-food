/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // TODO: Optimize image uploading and remove this
    },
  },
};

export default nextConfig;
