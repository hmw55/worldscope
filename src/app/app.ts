import { Component } from '@angular/core';
import { WorldMap } from './features/map/components/world-map/world-map';

@Component({
  selector: 'app-root',
  imports: [WorldMap],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}