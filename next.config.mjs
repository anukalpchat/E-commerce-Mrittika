const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Stops other sites framing Mrittika pages (clickjacking).
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Browsers only honour HSTS over HTTPS, so it is sent in production deployments only.
  ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets the test server (scripts/test-server.mjs) build into its own folder, so it can run
  // alongside `npm run dev` without the two overwriting each other's .next output.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}
export default nextConfig
