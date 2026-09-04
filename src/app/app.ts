import { Component, inject, signal } from '@angular/core';

import { CountryPanel } from './features/country-data/components/country-panel/country-panel';
import { IndicatorsPanel } from './features/country-data/components/indicators-panel/indicators-panel';
import { TrendPanel } from './features/country-data/components/trend-panel/trend-panel';
import { QuickStatsPanel } from './features/country-data/components/quick-stats-panel/quick-stats-panel';
import { CountryIndicator } from './features/country-data/models/country-indicator';
import {
  WorldBankCountry,
  WorldBankService,
} from './features/country-data/services/world-bank';
import { WorldMap } from './features/map/components/world-map/world-map';
import { MapCountry } from './features/map/models/map-country';

@Component({
  selector: 'app-root',
  imports: [
    WorldMap, 
    CountryPanel, 
    QuickStatsPanel,
    IndicatorsPanel,
    TrendPanel,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly worldBankService = inject(WorldBankService);

  readonly selectedCountry = signal<MapCountry | null>(null);
  readonly countryDetails = signal<WorldBankCountry | null>(null);
  readonly isCountryLoading = signal(false);
  readonly hasCountryError = signal(false);

  readonly quickStats = signal<CountryIndicator[]>([]);
  readonly areQuickStatsLoading = signal(false);
  readonly hasQuickStatsError = signal(false);

  readonly developmentIndicators = signal<CountryIndicator[]>([]);
  readonly areDevelopmentIndicatorsLoading = signal(false);
  readonly hasDevelopmentIndicatorsError = signal(false);
  readonly selectedIndicator = signal<CountryIndicator | null>(null);

  onCountrySelected(country: MapCountry): void {
    this.selectedCountry.set(country);

    this.countryDetails.set(null);
    this.quickStats.set([]);
    this.developmentIndicators.set([]);
    this.selectedIndicator.set(null);

    this.hasCountryError.set(false);
    this.hasQuickStatsError.set(false);
    this.hasDevelopmentIndicatorsError.set(false);

    if (!country.iso2Code) {
      return;
    }

    this.isCountryLoading.set(true);
    this.areQuickStatsLoading.set(true);
    this.areDevelopmentIndicatorsLoading.set(true);

    this.worldBankService.getCountry(country.iso2Code).subscribe({
      next: (details) => {
        this.countryDetails.set(details);
        this.isCountryLoading.set(false);
      },
      error: () => {
        this.hasCountryError.set(true);
        this.isCountryLoading.set(false);
      },
    });

    this.worldBankService.getQuickStats(country.iso2Code).subscribe({
      next: (stats) => {
        this.quickStats.set(stats);
        this.areQuickStatsLoading.set(false);
      },
      error: () => {
        this.hasQuickStatsError.set(true);
        this.areQuickStatsLoading.set(false);
      },
    });

    this.worldBankService
      .getDevelopmentIndicators(country.iso2Code)
      .subscribe({
        next: (indicators) => {
          this.developmentIndicators.set(indicators);
          this.selectedIndicator.set(indicators[0] ?? null);
          this.areDevelopmentIndicatorsLoading.set(false);
        },
        error: () => {
          this.hasDevelopmentIndicatorsError.set(true);
          this.areDevelopmentIndicatorsLoading.set(false);
        },
      });
  }

  selectIndicator(indicator: CountryIndicator): void {
    this.selectedIndicator.set(indicator);
  }

  formatIndicator(indicator: CountryIndicator): string {
    if (indicator.value === null) {
      return '—';
    }

    switch (indicator.id) {
      case 'SP.POP.TOTL':
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(indicator.value);

      case 'NY.GDP.MKTP.CD':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
          maximumFractionDigits: 2,
        }).format(indicator.value);

      case 'NY.GDP.PCAP.CD':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(indicator.value);

      case 'SP.DYN.LE00.IN':
        return `${indicator.value.toFixed(1)} yrs`;

      default:
        return new Intl.NumberFormat('en-US').format(indicator.value);
    }
  }
}