import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "placehold.co",
  },
  {
    protocol: "https",
    hostname: "www.aparat.com",
    pathname: "/video/video/thumb/**",
  },
  {
    protocol: "https",
    hostname: "static.cdn.asset.aparat.com",
    pathname: "/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "8000",
    pathname: "/storage/**",
  },
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (apiUrl) {
  try {
    const parsed = new URL(apiUrl);
    const protocol = parsed.protocol.replace(":", "") as "http" | "https";
    const port = parsed.port || undefined;
    const duplicate = remotePatterns.some(
      (pattern) =>
        pattern.hostname === parsed.hostname &&
        pattern.protocol === protocol &&
        (pattern.port ?? undefined) === port,
    );

    if (!duplicate) {
      remotePatterns.push({
        protocol,
        hostname: parsed.hostname,
        ...(port ? { port } : {}),
        pathname: "/storage/**",
      });
    }
  } catch {
    // ignore invalid NEXT_PUBLIC_API_URL
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
