import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { App } from './app';
import { WorldBankService } from './features/country-data/services/world-bank';
import { CountryIndicator } from './features/country-data/models/country-indicator';
import { MapCountry } from './features/map/models/map-country';

describe('App', () => {
  const worldBankServiceMock = {
    getCountry: vi.fn(),
    getQuickStats: vi.fn(),
    getDevelopmentIndicators: vi.fn(),
  };

  beforeEach(async () => {
    worldBankServiceMock.getCountry.mockReturnValue(
      of({
        id: 'JPN',
        iso2Code: 'JP',
        name: 'Japan',
        capitalCity: 'Tokyo',
        longitude: '139.77',
        latitude: '35.67',
        region: 'East Asia & Pacific',
        incomeLevel: 'High income',
      }),
    );

    worldBankServiceMock.getQuickStats.mockReturnValue(
      of([
        {
          id: 'SP.POP.TOTL',
          label: 'Population',
          shortLabel: 'Population',
          unit: 'people',
          value: 123753041,
          year: 2024,
        },
        {
          id: 'NY.GDP.MKTP.CD',
          label: 'Gross Domestic Product',
          shortLabel: 'GDP',
          unit: 'USD',
          value: 4_026_000_000_000,
          year: 2024,
        },
        {
          id: 'NY.GDP.PCAP.CD',
          label: 'GDP per Capita',
          shortLabel: 'GDP per Capita',
          unit: 'USD',
          value: 32500,
          year: 2024,
        },
        {
          id: 'SP.DYN.LE00.IN',
          label: 'Life Expectancy',
          shortLabel: 'Life Expectancy',
          unit: 'years',
          value: 84,
          year: 2023,
        },
      ]),
    );

  worldBankServiceMock.getDevelopmentIndicators.mockReturnValue(
    of([
      {
        id: 'SL.UEM.TOTL.ZS',
        label: 'Unemployment Rate',
        shortLabel: 'Unemployment',
        unit: '%',
        value: 2.6,
        year: 2024,
      },
      {
        id: 'EN.GHG.CO2.PC.CE.AR5',
        label: 'CO₂ Emissions per Capita',
        shortLabel: 'CO₂ / Capita',
        unit: 't',
        value: 7.8,
        year: 2023,
      },
      {
        id: 'SP.URB.TOTL.IN.ZS',
        label: 'Urban Population',
        shortLabel: 'Urban Population',
        unit: '%',
        value: 92,
        year: 2024,
      },
      {
        id: 'IT.NET.USER.ZS',
        label: 'Individuals Using the Internet',
        shortLabel: 'Internet Users',
        unit: '%',
        value: 87,
        year: 2023,
      },
    ]),
  );

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: WorldBankService,
          useValue: worldBankServiceMock,
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('should render the WorldScope brand', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('WorldScope');
  });

  it('should render primary navigation', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const navigation = compiled.querySelector('nav');

    expect(navigation).not.toBeNull();
    expect(navigation?.textContent).toContain('About');
  });

  it('should load country data and indicators when a country is selected', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    const country: MapCountry = {
      name: 'Japan',
      iso2Code: 'JP',
      iso3Code: 'JPN',
      region: 'East Asia & Pacific',
      path: '',
    };

    app.onCountrySelected(country);
    fixture.detectChanges();

    expect(worldBankServiceMock.getCountry).toHaveBeenCalledWith('JP');
    expect(worldBankServiceMock.getQuickStats).toHaveBeenCalledWith('JP');

    expect(app.selectedCountry()).toEqual(country);
    expect(app.countryDetails()?.capitalCity).toBe('Tokyo');
    expect(app.quickStats()).toHaveLength(4);

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Japan');
    expect(compiled.textContent).toContain('Tokyo');
    expect(compiled.textContent).toContain('Population');

    expect(
      worldBankServiceMock.getDevelopmentIndicators,
    ).toHaveBeenCalledWith('JP');

    expect(app.developmentIndicators()).toHaveLength(4);
    expect(app.selectedIndicator()?.id).toBe('SL.UEM.TOTL.ZS');

    expect(compiled.textContent).toContain('Unemployment');
    expect(compiled.textContent).toContain('2.6%');
  });

  it('should change the selected development indicator', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    const indicator: CountryIndicator = {
      id: 'IT.NET.USER.ZS',
      label: 'Individuals Using the Internet',
      shortLabel: 'Internet Users',
      unit: '%',
      value: 87,
      year: 2023,
    };

    app.selectIndicator(indicator);

    expect(app.selectedIndicator()).toEqual(indicator);
  });
});