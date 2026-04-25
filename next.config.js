/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    /* Enable WASM */
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    /* Tell webpack to ignore /beatlab.js — it lives in public/ and is
       loaded at runtime, not bundled */
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    config.plugins.push(
      new (require("webpack").IgnorePlugin)({
        resourceRegExp: /^\/beatlab\.js$/,
      })
    );

    return config;
  },

  async headers() {
    return [
      {
        source: "/:path*.wasm",
        headers: [
          { key: "Content-Type", value: "application/wasm" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;