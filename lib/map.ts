import { MarkerData } from "@/types/type";
import { BASE_FARE, FARE_RATE_PER_KM, FARE_RATE_PER_MINUTE, OSRM_BASE } from "@/constants";

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: MarkerData[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver) => {
    const latitude = driver.latitude || userLatitude;
    const longitude = driver.longitude || userLongitude;

    return {
      ...driver,
      latitude,
      longitude,
      title: `${driver.first_name} ${driver.last_name}`,
    };
  });
};

export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 5.6037,
      longitude: -0.187,
      zoomLevel: 12,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      zoomLevel: 14,
    };
  }

  const latitude = (userLatitude + destinationLatitude) / 2;
  const longitude = (userLongitude + destinationLongitude) / 2;

  const latDelta = Math.abs(userLatitude - destinationLatitude);
  const lngDelta = Math.abs(userLongitude - destinationLongitude);
  const maxDelta = Math.max(latDelta, lngDelta);

  let zoomLevel = 14;
  if (maxDelta > 0.5) zoomLevel = 10;
  else if (maxDelta > 0.2) zoomLevel = 11;
  else if (maxDelta > 0.1) zoomLevel = 12;
  else if (maxDelta > 0.05) zoomLevel = 13;

  return {
    latitude,
    longitude,
    zoomLevel,
  };
};

export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (!userLatitude || !userLongitude || !destinationLatitude || !destinationLongitude) return;

  const userToDestUrl = `${OSRM_BASE}/route/v1/driving/${userLongitude},${userLatitude};${destinationLongitude},${destinationLatitude}?overview=false`;

  let timeToDestination: number | null = null;
  let distanceToDestination: number | null = null;
  try {
    const res = await fetch(userToDestUrl);
    const data = await res.json();
    timeToDestination = data.routes?.[0]?.duration ? data.routes[0].duration / 60 : null;
    distanceToDestination = data.routes?.[0]?.distance
      ? data.routes[0].distance / 1000 // Convert meters to km
      : null;
  } catch {
    // fallback will be used per-driver
  }

  const timesPromises = markers.map(async (marker, index) => {
    try {
      const responseToUser = await fetch(
        `${OSRM_BASE}/route/v1/driving/${marker.longitude},${marker.latitude};${userLongitude},${userLatitude}?overview=false`,
      );
      const dataToUser = await responseToUser.json();
      const timeToUser = dataToUser.routes?.[0]?.duration
        ? dataToUser.routes[0].duration / 60
        : null;
      const distanceToUser = dataToUser.routes?.[0]?.distance
        ? dataToUser.routes[0].distance / 1000
        : null;

      if (timeToUser !== null && timeToDestination !== null && distanceToDestination !== null) {
        const totalTime = timeToUser + timeToDestination;
        const totalDistance = (distanceToUser || 0) + distanceToDestination; // Optional: include distance to user
        const price = (
          BASE_FARE +
          totalDistance * FARE_RATE_PER_KM +
          totalTime * FARE_RATE_PER_MINUTE
        ).toFixed(2);
        return { ...marker, time: totalTime, price, distance: totalDistance };
      }

      if (timeToUser !== null) {
        const totalTime = timeToUser + 10;
        const totalDistance = (distanceToUser || 0) + 5;
        const price = (
          BASE_FARE +
          totalDistance * FARE_RATE_PER_KM +
          totalTime * FARE_RATE_PER_MINUTE
        ).toFixed(2);
        return { ...marker, time: totalTime, price, distance: totalDistance };
      }
    } catch {
      // OSRM call failed for this driver
    }

    // Fallback: estimate based on driver index
    const fallbackTime = 5 + index * 2;
    const fallbackDistance = 5;
    const fallbackPrice = (
      BASE_FARE +
      fallbackDistance * FARE_RATE_PER_KM +
      fallbackTime * FARE_RATE_PER_MINUTE
    ).toFixed(2);
    return { ...marker, time: fallbackTime, price: fallbackPrice, distance: fallbackDistance };
  });

  return await Promise.all(timesPromises);
};
