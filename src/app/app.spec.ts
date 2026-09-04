import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('should render the WorldScope heading', () => {
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Every country has a story.',
    );
  });

  it('should render primary navigation', () => {
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const navigation = compiled.querySelector('nav');

    expect(navigation?.textContent).toContain('Explore');
    expect(navigation?.textContent).toContain('About');
  });
});