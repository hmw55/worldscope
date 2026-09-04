import { Component, computed, input, signal } from '@angular/core';

import { CountryIndicator } from '../../models/country-indicator';
import { IndicatorObservation } from '../../models/indicator-observation';

interface ChartPoint extends IndicatorObservation {
  x: number;
  y: number;
}

@Component({
  selector: 'app-trend-panel',
  imports: [],
  templateUrl: './trend-panel.html',
  styleUrl: './trend-panel.scss',
})
export class TrendPanel {
  readonly selectedIndicator = input<CountryIndicator | null>(null);
  readonly observations = input<IndicatorObservation[]>([]);
  readonly isLoading = input(false);
  readonly hasError = input(false);

  readonly activePoint = signal<ChartPoint | null>(null);

  readonly chartPointData = computed<ChartPoint[]>(() => {
    const data = this.observations();

    if (data.length < 2) {
      return [];
    }

    const width = 320;
    const height = 140;
    const padding = 16;

    const values = data.map((point) => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    return data.map((point, index) => {
      const x =
        padding +
        (index / (data.length - 1)) * (width - padding * 2);

      const y =
        height -
        padding -
        ((point.value - minValue) / range) * (height - padding * 2);

      return {
        ...point,
        x,
        y,
      };
    });
  });

  readonly chartPoints = computed(() =>
    this.chartPointData()
      .map((point) => `${point.x},${point.y}`)
      .join(' '),
  );

  formatValue(value: number): string {
    const indicator = this.selectedIndicator();

    if (!indicator) {
      return value.toFixed(1);
    }

    switch (indicator.unit) {
      case '%':
        return `${value.toFixed(1)}%`;

      case 't':
        return `${value.toFixed(1)} t`;

      default:
        return new Intl.NumberFormat('en-US', {
          maximumFractionDigits: 1,
        }).format(value);
    }
  }

  trendColor(): string {
    switch (this.selectedIndicator()?.id) {
      case 'SL.UEM.TOTL.ZS':
        return 'var(--data-orange)';

      case 'EN.GHG.CO2.PC.CE.AR5':
        return 'var(--data-pink)';

      case 'SP.URB.TOTL.IN.ZS':
        return 'var(--data-cyan)';

      case 'IT.NET.USER.ZS':
        return 'var(--data-purple)';

      default:
        return 'var(--accent)';
    }
  }

  showPoint(point: ChartPoint): void {
    this.activePoint.set(point);
  }

  hidePoint(): void {
    this.activePoint.set(null);
  }
}