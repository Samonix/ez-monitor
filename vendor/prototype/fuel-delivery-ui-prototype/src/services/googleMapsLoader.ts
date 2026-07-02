import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let configuredKey: string | null = null;

export async function loadGoogleMaps(apiKey: string) {
  if (!configuredKey) {
    setOptions({
      key: apiKey,
      v: 'weekly',
      language: 'uk',
      region: 'UA',
      authReferrerPolicy: 'origin',
    });
    configuredKey = apiKey;
  }

  const [mapsLibrary, routesLibrary] = await Promise.all([
    importLibrary('maps'),
    importLibrary('routes'),
  ]);

  return {
    mapsLibrary: mapsLibrary as google.maps.MapsLibrary,
    routesLibrary: routesLibrary as google.maps.RoutesLibrary,
  };
}
