import { Component, inject, signal } from '@angular/core';

import { CountryIndicator } from './features/country-data/models/country-indicator';
import { WorldBankService, WorldBankCountry } from './features/country-data/services/world-bank';
import { WorldMap } from './features/map/components/world-map/world-map';
import { MapCountry } from './features/map/models/map-country';

@Component({
  selector: 'app-root',
  imports: [WorldMap],
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

  onCountrySelected(country: MapCountry): void {
    this.selectedCountry.set(country);

    this.countryDetails.set(null);
    this.quickStats.set([]);

    this.hasCountryError.set(false);
    this.hasQuickStatsError.set(false);

    if (!country.iso2Code) {
      return;
    }

    this.isCountryLoading.set(true);
    this.areQuickStatsLoading.set(true);

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

