import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  /** Link oficial al programa TEDx — requisito de los TEDx Web + Social guidelines. */
  readonly tedxProgramLink =
    'https://www.ted.com/about/programs-initiatives/tedx-program';
}
