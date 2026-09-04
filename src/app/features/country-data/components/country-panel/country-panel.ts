import { Component, input } from '@angular/core';

import {
  WorldBankCountry,
} from '../../services/world-bank';
import { MapCountry } from '../../../map/models/map-country';

@Component({
  selector: 'app-country-panel',
  imports: [],
  templateUrl: './country-panel.html',
  styleUrl: './country-panel.scss',
})
export class CountryPanel {
  readonly selectedCountry = input<MapCountry | null>(null);
  readonly countryDetails = input<WorldBankCountry | null>(null);
  readonly isLoading = input(false);
  readonly hasError = input(false);
}