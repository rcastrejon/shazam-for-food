/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb", // TODO: Optimize image uploading and remove this
    },
  },
};

export default nextConfig;
