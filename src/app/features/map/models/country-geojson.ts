import type {
  Feature,
  FeatureCollection,
  Geometry,
} from 'geojson';

export interface CountryProperties {
  ADMIN: string;
  ISO_A2: string;
  ISO_A3: string;
  WB_A2: string;
  WB_A3: string;
  REGION_WB: string;
}

export type CountryFeature = Feature<Geometry, CountryProperties>;

export type CountryFeatureCollection = FeatureCollection<
  Geometry,
  CountryProperties
>;