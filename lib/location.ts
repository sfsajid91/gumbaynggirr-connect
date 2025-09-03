import * as Location from "expo-location";

export async function getUserLocation(): Promise<Location.LocationObject | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;
  return await Location.getCurrentPositionAsync({});
}

// Fast equirectangular approximation (~2x faster than haversine, accurate for short distances)
export function fastDistanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const dLat = lat2 - lat1;
  const dLon = toRad(b.longitude - a.longitude);
  const x = dLon * Math.cos((lat1 + lat2) / 2);
  const y = dLat;
  return R * Math.sqrt(x * x + y * y);
}
