/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    cpus: 1,
    workerThreads: false,
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;
