import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next dev blocks RSC/HMR requests from non-localhost origins by default.
  // Whitelist the origins we test from so the dev runtime hydrates over them.
  // No effect on production builds.
  //
  // Find your current laptop LAN IP with: ifconfig | grep "inet "
  // Then point your phone (on the same WiFi) at http://<that-ip>:3000 —
  // no tunnel needed. If the IP changes (DHCP renewal, new network), update
  // the exact entry below or rely on the wildcard ranges.
  allowedDevOrigins: [
    // Cloudflared quick-tunnel subdomains (used for off-network testing).
    "*.trycloudflare.com",

    // Current LAN IP at time of writing — exact match, always works.
    "172.20.117.32",

    // Wildcard ranges covering common RFC1918 private subnets so a new LAN
    // IP (DHCP shuffle, joining another WiFi) tends to work without touching
    // this file. Next's matcher treats each octet as a glob segment.
    "192.168.*.*", // typical home routers
    "172.20.*.*",  // current network's /16
    "10.*.*.*",    // some routers, VPNs, corporate / managed WiFi
  ],
};

export default nextConfig;
