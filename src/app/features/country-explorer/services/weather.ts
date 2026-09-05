import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { CurrentWeather } from '../models/current-weather';

interface OpenMeteoCurrentResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private readonly baseUrl =
    'https://api.open-meteo.com/v1/forecast';

  constructor(private readonly http: HttpClient) {}

  getCurrentWeather(
    latitude: number,
    longitude: number,
  ): Observable<CurrentWeather> {
    const params = {
      latitude,
      longitude,
      current:
        'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
      temperature_unit: 'fahrenheit',
      wind_speed_unit: 'mph',
    };

    return this.http
      .get<OpenMeteoCurrentResponse>(this.baseUrl, {
        params,
      })
      .pipe(
        map((response) => ({
          temperature: response.current.temperature_2m,
          apparentTemperature:
            response.current.apparent_temperature,
          humidity:
            response.current.relative_humidity_2m,
          windSpeed:
            response.current.wind_speed_10m,
          weatherCode:
            response.current.weather_code,
        })),
      );
  }
}