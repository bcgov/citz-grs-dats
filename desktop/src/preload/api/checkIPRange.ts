import os from "node:os";

export const checkIpRange = async (): Promise<boolean> => {
	try {
		const networkInterfaces = os.networkInterfaces();
		const allowedRanges = ["142.0.0.0/8"];

		// Loop through all network interfaces
		for (const [interfaceName, interfaceDetails] of Object.entries(
			networkInterfaces,
		)) {
			if (interfaceDetails) {
				for (const details of interfaceDetails) {
					if (details.family === "IPv4" && !details.internal) {
						const ipv4Address = details.address;
						console.log(`${interfaceName} IPv4 Address: ${ipv4Address}`);

						// Check if the IP is in the allowed ranges using a more accurate method
						if (
							allowedRanges.some((range) => isIpInRange(ipv4Address, range))
						) {
							return true; // Return true as soon as one matching IP is found
						}
					}
				}
			}
		}

		console.error("No matching IPv4 address found on any interfaces.");
		return false;
	} catch (error) {
		console.error("Error getting user IP:", error);
		return false;
	}
};

// Helper function to check if an IP is within a given CIDR range
const isIpInRange = (ip: string, cidr: string): boolean => {
	const [range, bits] = cidr.split("/");
	const mask = -1 << (32 - Number(bits));
	const ipInt = ipToInt(ip);
	const rangeInt = ipToInt(range);
	return (ipInt & mask) === (rangeInt & mask);
};

// Convert an IPv4 address to a 32-bit integer
const ipToInt = (ip: string): number => {
	return ip
		.split(".")
		.map((octet) => Number.parseInt(octet, 10))
		.reduce((acc, octet) => (acc << 8) + octet);
};
