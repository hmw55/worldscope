import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { CountryIndicator, WorldBankIndicatorApiResponse } from '../models/country-indicator';
import { IndicatorObservation } from '../models/indicator-observation';

export interface WorldBankCountry {
  id: string;
  iso2Code: string;
  name: string;
  capitalCity: string;
  longitude: string;
  latitude: string;
  region: string;
  incomeLevel: string;
}

interface WorldBankCountryResponse {
  id: string;
  iso2Code: string;
  name: string;
  capitalCity: string;
  longitude: string;
  latitude: string;
  region: {
    value: string;
  };
  incomeLevel: {
    value: string;
  };
}

type WorldBankCountryApiResponse = [
  unknown,
  WorldBankCountryResponse[],
];

@Injectable({
  providedIn: 'root',
})
export class WorldBankService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.worldbank.org/v2';

  getCountry(code: string): Observable<WorldBankCountry> {
    return this.http
      .get<WorldBankCountryApiResponse>(
        `${this.baseUrl}/country/${code}?format=json`,
      )
      .pipe(
        map((response) => {
          const country = response[1][0];

          return {
            id: country.id,
            iso2Code: country.iso2Code,
            name: country.name,
            capitalCity: country.capitalCity,
            longitude: country.longitude,
            latitude: country.latitude,
            region: country.region.value,
            incomeLevel: country.incomeLevel.value,
          };
        }),
      );
  }

  getLatestIndicator(
    countryCode: string,
    indicatorId: string,
    label: string,
    shortLabel: string,
    unit: string,
  ): Observable<CountryIndicator> {
    return this.http
        .get<WorldBankIndicatorApiResponse>(
        `${this.baseUrl}/country/${countryCode}/indicator/${indicatorId}?format=json&date=2015:2030&per_page=100`,
        )
        .pipe(
        map((response) => {
            const observations = response[1] ?? [];

            const latest = observations.find(
            (observation) => observation.value !== null,
            );

            return {
            id: indicatorId,
            label,
            shortLabel,
            unit,
            value: latest?.value ?? null,
            year: latest ? Number(latest.date) : null,
            };
        }),
      );
    }

  getQuickStats(countryCode: string): Observable<CountryIndicator[]> {
    return forkJoin([
      this.getLatestIndicator(
        countryCode,
        'SP.POP.TOTL',
        'Population',
        'Population',
        'people',
      ),
      this.getLatestIndicator(
        countryCode,
        'NY.GDP.MKTP.CD',
        'Gross Domestic Product',
        'GDP',
        'USD',
      ),
      this.getLatestIndicator(
        countryCode,
        'NY.GDP.PCAP.CD',
        'GDP per Capita',
        'GDP per Capita',
        'USD',
      ),
      this.getLatestIndicator(
        countryCode,
        'SP.DYN.LE00.IN',
        'Life Expectancy',
        'Life Expectancy',
        'years',
      ),
    ]);
  } 

  getDevelopmentIndicators(
    countryCode: string,
  ): Observable<CountryIndicator[]> {
    return forkJoin([
      this.getLatestIndicator(
        countryCode,
        'SL.UEM.TOTL.ZS',
        'Unemployment Rate',
        'Unemployment',
        '%',
      ),
      this.getLatestIndicator(
        countryCode,
        'EN.GHG.CO2.PC.CE.AR5',
        'CO₂ Emissions per Capita',
        'CO₂ / Capita',
        't',
      ),
      this.getLatestIndicator(
        countryCode,
        'SP.URB.TOTL.IN.ZS',
        'Urban Population',
        'Urban Population',
        '%',
      ),
      this.getLatestIndicator(
        countryCode,
        'IT.NET.USER.ZS',
        'Individuals Using the Internet',
        'Internet Users',
        '%',
      ),
    ]);
  }

  getIndicatorHistory(
    countryCode: string,
    indicatorId: string,
  ): Observable<IndicatorObservation[]> {
    return this.http
      .get<WorldBankIndicatorApiResponse>(
        `${this.baseUrl}/country/${countryCode}/indicator/${indicatorId}?format=json&date=2000:2030&per_page=100`,
      )
      .pipe(
        map((response) => {
          const observations = response[1] ?? [];

          return observations
            .filter(
              (observation) =>
                observation.value !== null &&
                Number.isFinite(Number(observation.date)),
            )
            .map((observation) => ({
              year: Number(observation.date),
              value: observation.value as number,
            }))
            .sort((a, b) => a.year - b.year);
        }),
      );
  }
}