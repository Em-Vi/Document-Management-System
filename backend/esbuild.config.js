require("esbuild")
  .build({
    entryPoints: ["src/server.ts"], // adjust if your entry is different
    bundle: true,
    platform: "node",
    target: "node18",
    outfile: "dist/bundle.js",
    external: [
      "@fastify/mysql",
      "mock-aws-s3",
      "aws-sdk",
      "nock",
      "@mapbox/node-pre-gyp",
      "node-pre-gyp",
      "bcrypt",
    ], // optionally exclude native deps
  })
  .catch(() => process.exit(1));
