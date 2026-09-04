import { Component, inject, signal } from '@angular/core';

import { CountryPanel } from './features/country-data/components/country-panel/country-panel';
import { IndicatorsPanel } from './features/country-data/components/indicators-panel/indicators-panel';
import { TrendPanel } from './features/country-data/components/trend-panel/trend-panel';
import { QuickStatsPanel } from './features/country-data/components/quick-stats-panel/quick-stats-panel';
import { CountryIndicator } from './features/country-data/models/country-indicator';
import { IndicatorObservation } from './features/country-data/models/indicator-observation';
import {
  WorldBankCountry,
  WorldBankService,
} from './features/country-data/services/world-bank';
import { WorldMap } from './features/map/components/world-map/world-map';
import { MapCountry } from './features/map/models/map-country';
import { CountrySearch } from './features/search/components/country-search/country-search';

@Component({
  selector: 'app-root',
  imports: [
    WorldMap,
    CountrySearch,
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

  readonly countries = signal<MapCountry[]>([]);

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

  readonly indicatorHistory = signal<IndicatorObservation[]>([]);
  readonly isIndicatorHistoryLoading = signal(false);
  readonly hasIndicatorHistoryError = signal(false);

  onCountriesLoaded(countries: MapCountry[]): void {
    this.countries.set(
      countries
        .filter(
          (country) =>
            country.iso2Code !== null &&
            country.iso3Code !== null,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  onCountrySelected(country: MapCountry): void {
    this.selectedCountry.set(country);

    this.countryDetails.set(null);
    this.quickStats.set([]);
    this.developmentIndicators.set([]);
    this.selectedIndicator.set(null);
    this.indicatorHistory.set([]);

    this.hasCountryError.set(false);
    this.hasQuickStatsError.set(false);
    this.hasDevelopmentIndicatorsError.set(false);
    this.hasIndicatorHistoryError.set(false);

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

          const firstIndicator = indicators[0] ?? null;
          this.selectedIndicator.set(firstIndicator);

          this.areDevelopmentIndicatorsLoading.set(false);

          if (firstIndicator) {
            this.loadIndicatorHistory(
              country.iso2Code!,
              firstIndicator.id,
            );
          }
        },
        error: () => {
          this.hasDevelopmentIndicatorsError.set(true);
          this.areDevelopmentIndicatorsLoading.set(false);
        },
      });
  }

  selectIndicator(indicator: CountryIndicator): void {
    this.selectedIndicator.set(indicator);

    const countryCode = this.selectedCountry()?.iso2Code;

    if (!countryCode) {
      return;
    }

    this.loadIndicatorHistory(countryCode, indicator.id);
  }

  private loadIndicatorHistory(
    countryCode: string,
    indicatorId: string,
  ): void {
    this.indicatorHistory.set([]);
    this.hasIndicatorHistoryError.set(false);
    this.isIndicatorHistoryLoading.set(true);

    this.worldBankService
      .getIndicatorHistory(countryCode, indicatorId)
      .subscribe({
        next: (history) => {
          this.indicatorHistory.set(history);
          this.isIndicatorHistoryLoading.set(false);
        },
        error: () => {
          this.hasIndicatorHistoryError.set(true);
          this.isIndicatorHistoryLoading.set(false);
        },
      });
  }
}