import { readFile, writeFile } from 'node:fs/promises';

const INPUT_PATH =
  'tmp/natural-earth-cities/populated-places.geojson';

const OUTPUT_PATH =
  'src/app/features/country-explorer/data/major-cities.ts';

const MAX_CITIES_PER_COUNTRY = 5;

const source = JSON.parse(
  await readFile(INPUT_PATH, 'utf8'),
);

const citiesByCountry = new Map();

const COUNTRY_CODE_ALIASES = {
  KOS: 'KSV',
  PSX: 'PSE',
  SAH: 'ESH',
};

for (const feature of source.features) {
  const properties = feature.properties;
  const coordinates = feature.geometry?.coordinates;

  if (
    !properties?.NAME ||
    !properties?.ADM0_A3 ||
    !Array.isArray(coordinates)
  ) {
    continue;
  }

  const [longitude, latitude] = coordinates;

  const city = {
    name: properties.NAME,
    countryCode:
      COUNTRY_CODE_ALIASES[properties.ADM0_A3] ??
      properties.ADM0_A3,
    latitude,
    longitude,
    timezone: properties.TIMEZONE || null,
    population:
      typeof properties.POP_MAX === 'number'
        ? properties.POP_MAX
        : null,
    isCapital: properties.ADM0CAP === 1,
  };

  const countryCities =
    citiesByCountry.get(city.countryCode) ?? [];

  countryCities.push(city);
  citiesByCountry.set(city.countryCode, countryCities);
}

const selectedCities = [];

for (const countryCities of citiesByCountry.values()) {
  const sortedCities = [...countryCities].sort(
    (a, b) => (b.population ?? 0) - (a.population ?? 0),
  );

  const capital = sortedCities.find(
    (city) => city.isCapital,
  );

  const selection = [];

  if (capital) {
    selection.push(capital);
  }

  for (const city of sortedCities) {
    if (selection.length >= MAX_CITIES_PER_COUNTRY) {
      break;
    }

    if (city === capital) {
      continue;
    }

    selection.push(city);
  }

  selectedCities.push(...selection);
}

selectedCities.sort((a, b) => {
  const countryComparison =
    a.countryCode.localeCompare(b.countryCode);

  if (countryComparison !== 0) {
    return countryComparison;
  }

  if (a.isCapital !== b.isCapital) {
    return a.isCapital ? -1 : 1;
  }

  return (b.population ?? 0) - (a.population ?? 0);
});

const output = `import { City } from '../models/city';

export const MAJOR_CITIES: City[] = ${JSON.stringify(
  selectedCities,
  null,
  2,
)};
`;

await writeFile(OUTPUT_PATH, output);

console.log(
  `Generated ${selectedCities.length} cities across ${citiesByCountry.size} countries.`,
);