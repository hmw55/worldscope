export interface CountryIndicator {
  id: string;
  label: string;
  shortLabel: string;
  unit: string;
  value: number | null;
  year: number | null;
}

export interface WorldBankIndicatorObservation {
  indicator: {
    id: string;
    value: string;
  };
  country: {
    id: string;
    value: string;
  };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
}

export type WorldBankIndicatorApiResponse = [
  unknown,
  WorldBankIndicatorObservation[],
];