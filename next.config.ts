import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Prisma (engineType "client") carga un .wasm en runtime; hay que forzar
  // que Vercel lo incluya en el bundle serverless.
  outputFileTracingIncludes: {
    '/**/*': [
      './node_modules/.prisma/client/**/*',
      './node_modules/@prisma/client/**/*',
    ],
  },
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
}
export default nextConfig
