import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

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
}