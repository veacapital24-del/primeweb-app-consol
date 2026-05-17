import type { NextConfig } from "next";

// Comma-separated allowlist of image hosts, e.g.
//   NEXT_PUBLIC_IMAGE_HOSTS="picsum.photos,xyz.supabase.co,cdn.cloudinary.com"
// We always include `nulakaz.com` for legacy WP-uploaded media.
const extraImageHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const allowedHosts = Array.from(
  new Set(["nulakaz.com", ...extraImageHosts]),
);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "172.20.10.2", "localhost"],
  images: {
    // Note: we deliberately omit `search` from every pattern so URLs with
    // query strings (e.g. Unsplash's `?auto=format&fit=crop&w=800&q=80`)
    // are allowed. Setting `search: ""` would *require* an empty query
    // string and reject every Unsplash URL with INVALID_IMAGE_OPTIMIZE_REQUEST.
    remotePatterns: allowedHosts.map((hostname) =>
      hostname === "nulakaz.com"
        ? {
            protocol: "https",
            hostname: "nulakaz.com",
            port: "",
            pathname: "/wp-content/uploads/**",
          }
        : {
            protocol: "https",
            hostname,
            port: "",
            pathname: "/**",
          },
    ),
  },
};

export default nextConfig;
