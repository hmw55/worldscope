import { Component, input, output } from '@angular/core';

import { CountryIndicator } from '../../models/country-indicator';

@Component({
  selector: 'app-indicators-panel',
  imports: [],
  templateUrl: './indicators-panel.html',
  styleUrl: './indicators-panel.scss',
})
export class IndicatorsPanel {
  readonly hasSelection = input(false);
  readonly indicators = input<CountryIndicator[]>([]);
  readonly selectedIndicator = input<CountryIndicator | null>(null);
  readonly isLoading = input(false);
  readonly hasError = input(false);

  readonly indicatorSelected = output<CountryIndicator>();

  selectIndicator(indicator: CountryIndicator): void {
    this.indicatorSelected.emit(indicator);
  }

  formatIndicator(indicator: CountryIndicator): string {
    if (indicator.value === null) {
      return '—';
    }

    switch (indicator.unit) {
      case '%':
        return `${indicator.value.toFixed(1)}%`;

      case 't':
        return `${indicator.value.toFixed(1)} t`;

      default:
        return new Intl.NumberFormat('en-US', {
          maximumFractionDigits: 1,
        }).format(indicator.value);
    }
  }
}