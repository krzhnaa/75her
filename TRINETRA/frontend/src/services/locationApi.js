export async function searchLocations(query) {
  if (!query || query.length < 2) return [];

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
  );

  const data = await res.json();

  return data.slice(0, 5).map((item) => ({
    name: item.display_name,
    lat: item.lat,
    lon: item.lon,
  }));
}