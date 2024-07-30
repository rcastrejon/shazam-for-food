import { paraglide } from "@inlang/paraglide-next/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb", // TODO: Optimize image uploading and remove this
    },
  },
};

export default paraglide({
  paraglide: {
    project: "./project.inlang",
    outdir: "./src/paraglide",
  },
  ...nextConfig,
});
