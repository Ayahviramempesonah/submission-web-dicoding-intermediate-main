import Map from '../utils/map';

export async function reportMapper(report) {
  if (typeof report.lat !== 'number' || typeof report.lon !== 'number') {
    console.warn(
      'Report data is missing lat/lon or they are not numbers. Cannot fetch place name.',
    );
    return {
      ...report, // Spread original properties
      location: {
        // Add a location object with default/error values
        placeName: 'Location data unavailable',
        latitude: report.lat, // Store original lat if available
        longitude: report.lon, // Store original lon if available
      },
    };
  }

  const placeName = await Map.getPlaceNameByCoordinate(
    report.lat, // Use report.lat
    report.lon, // Use report.lon
  );

  return {
    ...report, // Spread all original properties from the input report (response.story)
    location: {
      // Create/overwrite the location property on the mapped report
      placeName: placeName,
      latitude: report.lat, // Add original lat to the new location object
      longitude: report.lon,
    },
  };
}
