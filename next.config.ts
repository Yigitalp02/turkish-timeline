import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// Derive the server URL for image remote patterns (avoids hardcoding).
// Defaults to localhost:3000 for local dev; override with NEXT_PUBLIC_SERVER_URL in production.
const serverUrl = new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000')

const nextConfig: NextConfig = {
  // Produces a minimal self-contained build in .next/standalone suitable for
  // the Docker runner stage (no node_modules copy needed at deploy time).
  output: 'standalone',

  images: {
    // Local paths (same origin) — for when Payload returns a relative URL
    localPatterns: [
      { pathname: '/api/media/file/**' },
    ],
    // Absolute URLs from Payload (includes protocol + hostname)
    remotePatterns: [
      {
        protocol: serverUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: serverUrl.hostname,
        ...(serverUrl.port ? { port: serverUrl.port } : {}),
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
