/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  // libSQL có binding native khi chạy với file SQLite cục bộ -> không bundle.
  serverExternalPackages: ['@libsql/client', 'libsql'],
  async headers() {
    return [
      {
        source: '/photos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      },
    ];
  },
};

export default nextConfig;
