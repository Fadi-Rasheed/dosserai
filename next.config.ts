import { withSerwist } from "@serwist/turbopack";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  cacheComponents: true,
  serverExternalPackages: ["pdf-parse"],
  turbopack: {
    root: projectRoot,
  },
};

export default withSerwist(nextConfig);
