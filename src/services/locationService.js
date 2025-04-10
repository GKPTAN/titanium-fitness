import ipFetch from "../config/axiosConfig.js";

async function getUserLocation(ip) {
  try {
    const response = await ipFetch.get(
      `/${ip}/json?token=${process.env.IPINFO_TOKEN}`
    );
    const data = response.data;
    return {
      city: data.city || "Localização indisponível",
      region: data.region || "Localização indisponível",
      country: data.country || "Localização indisponível",
      loc: data.loc || "Localização indisponível",
    };
  } catch (error) {
    console.error("Localização indisponível");
    return {
      city: "Localização indisponível",
      region: "Localização indisponível",
      country: "Localização indisponível",
      loc: "Localização indisponível",
    };
  }
}

export default getUserLocation;
