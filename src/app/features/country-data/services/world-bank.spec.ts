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

  it('should return the latest non-null indicator value', () => {
    service
      .getLatestIndicator(
        'US',
        'SP.POP.TOTL',
        'Population',
        'Population',
        'people',
      )
      .subscribe((indicator) => {
        expect(indicator).toEqual({
          id: 'SP.POP.TOTL',
          label: 'Population',
          shortLabel: 'Population',
          unit: 'people',
          value: 340110988,
          year: 2023,
        });
      });

    const request = httpTesting.expectOne(
      'https://api.worldbank.org/v2/country/US/indicator/SP.POP.TOTL?format=json&date=2015:2030&per_page=100',
    );

    expect(request.request.method).toBe('GET');

    request.flush([
      {
        page: 1,
        pages: 1,
        per_page: 100,
        total: 3,
      },
      [
        {
          indicator: {
            id: 'SP.POP.TOTL',
            value: 'Population, total',
          },
          country: {
            id: 'US',
            value: 'United States',
          },
          countryiso3code: 'USA',
          date: '2025',
          value: null,
          unit: '',
        },
        {
          indicator: {
            id: 'SP.POP.TOTL',
            value: 'Population, total',
          },
          country: {
            id: 'US',
            value: 'United States',
          },
          countryiso3code: 'USA',
          date: '2024',
          value: null,
          unit: '',
        },
        {
          indicator: {
            id: 'SP.POP.TOTL',
            value: 'Population, total',
          },
          country: {
            id: 'US',
            value: 'United States',
          },
          countryiso3code: 'USA',
          date: '2023',
          value: 340110988,
          unit: '',
        },
      ],
    ]);
  });

  it('should return null values when indicator data is unavailable', () => {
    service
      .getLatestIndicator(
        'US',
        'SP.TEST',
        'Test Indicator',
        'Test',
        'units',
      )
      .subscribe((indicator) => {
        expect(indicator).toEqual({
          id: 'SP.TEST',
          label: 'Test Indicator',
          shortLabel: 'Test',
          unit: 'units',
          value: null,
          year: null,
        });
      });

    const request = httpTesting.expectOne(
      'https://api.worldbank.org/v2/country/US/indicator/SP.TEST?format=json&date=2015:2030&per_page=100',
    );

    request.flush([
      {
        page: 1,
        pages: 1,
        per_page: 100,
        total: 2,
      },
      [
        {
          indicator: {
            id: 'SP.TEST',
            value: 'Test Indicator',
          },
          country: {
            id: 'US',
            value: 'United States',
          },
          countryiso3code: 'USA',
          date: '2025',
          value: null,
          unit: '',
        },
        {
          indicator: {
            id: 'SP.TEST',
            value: 'Test Indicator',
          },
          country: {
            id: 'US',
            value: 'United States',
          },
          countryiso3code: 'USA',
          date: '2024',
          value: null,
          unit: '',
        },
      ],
    ]);
  });
  
  it('should fetch the country quick stats', () => {
    service.getQuickStats('JP').subscribe((indicators) => {
      expect(indicators).toHaveLength(4);

      expect(indicators.map((indicator) => indicator.id)).toEqual([
        'SP.POP.TOTL',
        'NY.GDP.MKTP.CD',
        'NY.GDP.PCAP.CD',
        'SP.DYN.LE00.IN',
      ]);
    });

    const requests = httpTesting.match(
      (request) =>
        request.url.startsWith(
          'https://api.worldbank.org/v2/country/JP/indicator/',
        ),
    );

    expect(requests).toHaveLength(4);

    requests.forEach((request, index) => {
      request.flush([
        {
          page: 1,
          pages: 1,
          per_page: 100,
          total: 1,
        },
        [
          {
            indicator: {
              id: [
                'SP.POP.TOTL',
                'NY.GDP.MKTP.CD',
                'NY.GDP.PCAP.CD',
                'SP.DYN.LE00.IN',
              ][index],
              value: 'Test Indicator',
            },
            country: {
              id: 'JP',
              value: 'Japan',
            },
            countryiso3code: 'JPN',
            date: '2023',
            value: 100,
            unit: '',
          },
        ],
      ]);
    });
  });

  it('should fetch development indicators', () => {
    service.getDevelopmentIndicators('JP').subscribe((indicators) => {
      expect(indicators).toHaveLength(4);

      expect(indicators.map((indicator) => indicator.id)).toEqual([
        'SL.UEM.TOTL.ZS',
        'EN.GHG.CO2.PC.CE.AR5',
        'SP.URB.TOTL.IN.ZS',
        'IT.NET.USER.ZS',
      ]);
    });

    const requests = httpTesting.match(
      (request) =>
        request.url.startsWith(
          'https://api.worldbank.org/v2/country/JP/indicator/',
        ),
    );

    expect(requests).toHaveLength(4);

    const indicatorIds = [
      'SL.UEM.TOTL.ZS',
      'EN.GHG.CO2.PC.CE.AR5',
      'SP.URB.TOTL.IN.ZS',
      'IT.NET.USER.ZS',
    ];

    requests.forEach((request, index) => {
      request.flush([
        {
          page: 1,
          pages: 1,
          per_page: 100,
          total: 1,
        },
        [
          {
            indicator: {
              id: indicatorIds[index],
              value: 'Test Indicator',
            },
            country: {
              id: 'JP',
              value: 'Japan',
            },
            countryiso3code: 'JPN',
            date: '2024',
            value: 10,
            unit: '',
          },
        ],
      ]);
    });
  });
});