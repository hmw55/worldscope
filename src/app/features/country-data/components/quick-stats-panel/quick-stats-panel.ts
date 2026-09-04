import { Component, input } from '@angular/core';

import { CountryIndicator } from '../../models/country-indicator';

@Component({
  selector: 'app-quick-stats-panel',
  imports: [],
  templateUrl: './quick-stats-panel.html',
  styleUrl: './quick-stats-panel.scss',
})
export class QuickStatsPanel {
  readonly hasSelection = input(false);
  readonly stats = input<CountryIndicator[]>([]);
  readonly isLoading = input(false);
  readonly hasError = input(false);

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