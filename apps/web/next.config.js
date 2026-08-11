const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_CREATE_BASE_URL: process.env.NEXT_PUBLIC_CREATE_BASE_URL,
    NEXT_PUBLIC_CREATE_HOST: process.env.NEXT_PUBLIC_CREATE_HOST,
    NEXT_PUBLIC_PROJECT_GROUP_ID: process.env.NEXT_PUBLIC_PROJECT_GROUP_ID,
  },
  serverExternalPackages: [
    '@neondatabase/serverless',
    'ws',
    '@better-auth/kysely-adapter',
    'kysely',
  ],
  // Resolve leftover `@auth/create` imports to local shims (see src/__create/@auth/create).
  turbopack: {
    root: path.join(__dirname, '..', '..'),
    resolveAlias: {
      '@auth/create/react': path.join(
        __dirname,
        'src/__create/@auth/create/react.tsx'
      ),
      '@auth/create': path.join(__dirname, 'src/__create/@auth/create/index.ts'),
    },
  },
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@auth/create/react': path.join(
        __dirname,
        'src/__create/@auth/create/react.tsx'
      ),
      '@auth/create': path.join(__dirname, 'src/__create/@auth/create/index.ts'),
    };
    // better-auth instruments every DB call with OpenTelemetry; the dynamic
    // `import("@opentelemetry/api")` resolves to a CJS namespace whose named
    // exports are undefined under the Node server runtime, crashing auth. Alias
    // it to a shim that re-exports the CommonJS build as ESM. Only on the Node
    // server bundle — the edge runtime (middleware) can't use `require`.
    if (isServer && config.name !== 'edge-server') {
      config.resolve.alias['@opentelemetry/api'] = path.join(
        __dirname,
        'src/__create/opentelemetry-api-shim.ts'
      );
    }
    return config;
  },
  rewrites() {
    return [
      {
        source: '/fontawesome/:path*',
        destination: 'https://ka-p.fontawesome.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
