import {
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
} from '@angular/core';

import { MapCountry } from '../../../map/models/map-country';

@Component({
  selector: 'app-country-search',
  imports: [],
  templateUrl: './country-search.html',
  styleUrl: './country-search.scss',
})
export class CountrySearch {
  private readonly elementRef: ElementRef<HTMLElement>;

  readonly countries = input<MapCountry[]>([]);
  readonly countrySelected = output<MapCountry>();

  readonly searchQuery = signal('');
  readonly activeSearchIndex = signal(-1);

  readonly filteredCountries = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return [];
    }

    return this.countries()
      .filter((country) =>
        country.name.toLowerCase().includes(query),
      )
      .slice(0, 8);
  });

  constructor(elementRef: ElementRef<HTMLElement>) {
    this.elementRef = elementRef;
  }

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
    this.activeSearchIndex.set(-1);
  }

  selectSearchResult(country: MapCountry): void {
    this.countrySelected.emit(country);
    this.clearSearch();
  }

  handleSearchKeydown(event: KeyboardEvent): void {
    const results = this.filteredCountries();

    switch (event.key) {
      case 'ArrowDown': {
        if (results.length === 0) {
          return;
        }

        event.preventDefault();

        const nextIndex =
          this.activeSearchIndex() < results.length - 1
            ? this.activeSearchIndex() + 1
            : 0;

        this.activeSearchIndex.set(nextIndex);
        break;
      }

      case 'ArrowUp': {
        if (results.length === 0) {
          return;
        }

        event.preventDefault();

        const nextIndex =
          this.activeSearchIndex() > 0
            ? this.activeSearchIndex() - 1
            : results.length - 1;

        this.activeSearchIndex.set(nextIndex);
        break;
      }

      case 'Enter': {
        const activeIndex = this.activeSearchIndex();

        if (activeIndex >= 0 && results[activeIndex]) {
          event.preventDefault();
          this.selectSearchResult(results[activeIndex]);
        }

        break;
      }

      case 'Escape':
        this.clearSearch();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;

    if (!this.elementRef.nativeElement.contains(target)) {
      this.clearSearch();
    }
  }

  private clearSearch(): void {
    this.searchQuery.set('');
    this.activeSearchIndex.set(-1);
  }
}