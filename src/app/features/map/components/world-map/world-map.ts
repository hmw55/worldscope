import { HttpClient } from '@angular/common/http';
import {
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  geoEqualEarth,
  geoPath,
} from 'd3-geo';

import {
  CountryFeature,
  CountryFeatureCollection,
} from '../../models/country-geojson';
import { MapCountry } from '../../models/map-country';

@Component({
  selector: 'app-world-map',
  imports: [],
  templateUrl: './world-map.html',
  styleUrl: './world-map.scss',
})
export class WorldMap implements OnInit {
  private readonly http = inject(HttpClient);

  readonly selectedCountryCode = input<string | null>(null);

  readonly countrySelected = output<MapCountry>();
  readonly countriesLoaded = output<MapCountry[]>();

  readonly countries = signal<MapCountry[]>([]);
  readonly hoveredCountry = signal<string | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  ngOnInit(): void {
    this.loadMap();
  }

  selectCountry(country: MapCountry): void {
    if (!country.iso3Code) {
      return;
    }

    this.countrySelected.emit(country);
  }

  private loadMap(): void {
    this.http
      .get<CountryFeatureCollection>('/data/countries.geojson')
      .subscribe({
        next: (data) => {
          const countries = this.createCountries(data.features);

          this.countries.set(countries);
          this.countriesLoaded.emit(countries);
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  private createCountries(features: CountryFeature[]): MapCountry[] {
    const projection = geoEqualEarth()
      .scale(155)
      .translate([480, 250]);

    const pathGenerator = geoPath(projection);

    return features
      .map((feature) => {
        const codes = this.resolveCountryCodes(feature.properties);

        return {
          name: feature.properties.ADMIN,
          iso2Code: codes.iso2Code,
          iso3Code: codes.iso3Code,
          region: feature.properties.REGION_WB,
          path: pathGenerator(feature) ?? '',
        };
      })
      .filter((country) => country.path);
  }

  private resolveCountryCodes(
    properties: CountryFeature['properties'],
  ): Pick<MapCountry, 'iso2Code' | 'iso3Code'> {
    let iso2Code = this.validCode(properties.ISO_A2);
    let iso3Code = this.validCode(properties.ISO_A3);

    iso2Code ??= this.validCode(properties.WB_A2);
    iso3Code ??= this.validCode(properties.WB_A3);

    // Natural Earth 1:110m v5.1.1 does not expose usable
    // ISO/WB identifiers for Norway in this feature.
    if (properties.ADMIN === 'Norway') {
      iso2Code = 'NO';
      iso3Code = 'NOR';
    }

    return { iso2Code, iso3Code };
  }

  private validCode(code: string): string | null {
    return code && code !== '-99' ? code : null;
  }
}