import os from "node:os";

const NETWORK_ALLOWED_RANGES = [
  "142.22.0.0/16", "142.23.0.0/16", "142.23.63.0/24", "142.23.66.0/24",
  "142.24.0.0/16", "142.25.0.0/16", "142.26.0.0/16", "142.27.0.0/16",
  "142.28.0.0/16", "142.29.0.0/16", "142.30.0.0/16", "142.31.0.0/16",
  "142.32.0.0/16", "142.33.0.0/16", "142.35.0.0/16", "142.36.0.0/16",
  "192.105.106.0/24", "192.136.27.0/24", "192.151.109.0/24",
  "192.75.10.0/24", "192.75.26.0/24", "199.175.36.0/24", "199.175.37.0/24",
  "199.175.38.0/24", "199.175.96.0/23", "204.239.67.0/24", "204.239.70.0/23",
];

const ipToInt = (ip: string): number =>
  ip
    .split(".")
    .map((octet) => Number.parseInt(octet, 10))
    .reduce((acc, octet) => (acc << 8) + octet);

const isIpInRange = (ip: string, cidr: string): boolean => {
  const [range, bits] = cidr.split("/");
  const mask = -1 << (32 - Number(bits));
  return (ipToInt(ip) & mask) === (ipToInt(range) & mask);
};

export const checkIpRange = (): boolean => {
  const interfaces = os.networkInterfaces();
  for (const details of Object.values(interfaces)) {
    if (!details) continue;
    for (const d of details) {
      if (d.family === "IPv4" && !d.internal) {
        if (NETWORK_ALLOWED_RANGES.some((r) => isIpInRange(d.address, r))) {
          return true;
        }
      }
    }
  }
  return false;
};
