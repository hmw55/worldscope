import { Component, inject, signal } from '@angular/core';

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

  onCountrySelected(country: MapCountry): void {
    this.selectedCountry.set(country);
    this.countryDetails.set(null);
    this.hasCountryError.set(false);

    if (!country.iso2Code) {
      return;
    }

    this.isCountryLoading.set(true);

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
  }
}