const repoBasePath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || "";
const normalizedBasePath = repoBasePath
  ? repoBasePath.startsWith("/")
    ? repoBasePath
    : `/${repoBasePath}`
  : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  basePath: normalizedBasePath || undefined,
  assetPrefix: normalizedBasePath || undefined,
};

module.exports = nextConfig;
