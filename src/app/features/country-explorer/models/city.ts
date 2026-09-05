export interface City {
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string | null;
  population: number | null;
  isCapital: boolean;
}