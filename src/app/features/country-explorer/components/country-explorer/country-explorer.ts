import {
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

import { MAJOR_CITIES } from '../../data/major-cities';
import { City } from '../../models/city';
import { CurrentWeather } from '../../models/current-weather';
import { WeatherService } from '../../services/weather';

@Component({
  selector: 'app-country-explorer',
  imports: [],
  templateUrl: './country-explorer.html',
  styleUrl: './country-explorer.scss',
})
export class CountryExplorer implements OnDestroy {
  selectedCountryCode = input<string | null>(null);

  selectedCity = signal<City | null>(null);

  weather = signal<CurrentWeather | null>(null);
  weatherLoading = signal(false);
  weatherError = signal(false);

  private readonly weatherService = inject(WeatherService);

  private readonly now = signal(new Date());

  private readonly clockInterval = window.setInterval(() => {
    this.now.set(new Date());
  }, 10_000);

  cities = computed<City[]>(() => {
    const countryCode = this.selectedCountryCode();

    if (!countryCode) {
      return [];
    }

    return MAJOR_CITIES.filter(
      (city) => city.countryCode === countryCode,
    );
  });

  currentDay = computed<string>(() => {
    const city = this.selectedCity();

    this.now();

    if (!city?.timezone) {
      return 'Unavailable';
    }

    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: city.timezone,
        weekday: 'long',
      }).format(this.now());
    } catch {
      return 'Unavailable';
    }
  });

  currentTime = computed<string>(() => {
    const city = this.selectedCity();

    this.now();

    if (!city?.timezone) {
      return 'Unavailable';
    }

    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: city.timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(this.now());
    } catch {
      return 'Unavailable';
    }
  });

  constructor() {
    effect(() => {
      const cities = this.cities();
      const city = cities.length > 0 ? cities[0] : null;

      this.selectedCity.set(city);

      if (city) {
        this.loadWeather(city);
      } else {
        this.weather.set(null);
        this.weatherLoading.set(false);
        this.weatherError.set(false);
      }
    });
  }

  selectCity(city: City): void {
    this.selectedCity.set(city);
    this.loadWeather(city);
  }

  weatherDescription(code: number): string {
    if (code === 0) {
      return 'Clear';
    }

    if (code === 1) {
      return 'Mostly Clear';
    }

    if (code === 2) {
      return 'Partly Cloudy';
    }

    if (code === 3) {
      return 'Overcast';
    }

    if (code === 45 || code === 48) {
      return 'Fog';
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
      return 'Drizzle';
    }

    if ([61, 63, 65, 66, 67].includes(code)) {
      return 'Rain';
    }

    if ([71, 73, 75, 77].includes(code)) {
      return 'Snow';
    }

    if ([80, 81, 82].includes(code)) {
      return 'Rain Showers';
    }

    if ([85, 86].includes(code)) {
      return 'Snow Showers';
    }

    if ([95, 96, 99].includes(code)) {
      return 'Thunderstorm';
    }

    return 'Unknown';
  }

  ngOnDestroy(): void {
    window.clearInterval(this.clockInterval);
  }

  private loadWeather(city: City): void {
    this.weatherLoading.set(true);
    this.weatherError.set(false);
    this.weather.set(null);

    this.weatherService
      .getCurrentWeather(city.latitude, city.longitude)
      .subscribe({
        next: (weather) => {
          this.weather.set(weather);
          this.weatherLoading.set(false);
        },
        error: () => {
          this.weatherError.set(true);
          this.weatherLoading.set(false);
        },
      });
  }
}