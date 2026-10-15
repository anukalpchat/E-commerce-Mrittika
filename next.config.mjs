/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets the test server (scripts/test-server.mjs) build into its own folder, so it can run
  // alongside `npm run dev` without the two overwriting each other's .next output.
  distDir: process.env.NEXT_DIST_DIR || '.next',
}
export default nextConfig
