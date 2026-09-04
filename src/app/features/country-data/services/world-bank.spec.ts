import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { WorldBankService } from './world-bank';

describe('WorldBankService', () => {
  let service: WorldBankService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorldBankService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(WorldBankService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should fetch and normalize country metadata', () => {
    service.getCountry('US').subscribe((country) => {
      expect(country).toEqual({
        id: 'USA',
        iso2Code: 'US',
        name: 'United States',
        capitalCity: 'Washington D.C.',
        longitude: '-77.032',
        latitude: '38.8895',
        region: 'North America',
        incomeLevel: 'High income',
      });
    });

    const request = httpTesting.expectOne(
      'https://api.worldbank.org/v2/country/US?format=json',
    );

    expect(request.request.method).toBe('GET');

    request.flush([
      {
        page: 1,
        pages: 1,
        per_page: '50',
        total: 1,
      },
      [
        {
          id: 'USA',
          iso2Code: 'US',
          name: 'United States',
          capitalCity: 'Washington D.C.',
          longitude: '-77.032',
          latitude: '38.8895',
          region: {
            id: 'NAC',
            iso2code: 'XU',
            value: 'North America',
          },
          incomeLevel: {
            id: 'HIC',
            iso2code: 'XD',
            value: 'High income',
          },
        },
      ],
    ]);
  });
});