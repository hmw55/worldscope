import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CountryExplorer } from './country-explorer';

describe('CountryExplorer', () => {
  let component: CountryExplorer;
  let fixture: ComponentFixture<CountryExplorer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryExplorer],
    }).compileComponents();

    fixture = TestBed.createComponent(CountryExplorer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
