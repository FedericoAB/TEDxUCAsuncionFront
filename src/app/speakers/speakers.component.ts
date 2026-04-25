import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Speaker {
  n: string;
  r: string;
  t: string;
  line: string;
}

@Component({
  standalone: true,
  selector: 'app-speakers',
  imports: [CommonModule],
  templateUrl: './speakers.component.html',
  styleUrl: './speakers.component.scss',
})
export class SpeakersComponent {
  /**
   * Oradores confirmados.
   * - Vacío  → renderiza el placeholder "Próximamente".
   * - ≥1     → renderiza la grilla con el formato del landing original.
   *
   * Cuando haya confirmación sólo agregá objetos acá.
   */
  speakers: Speaker[] = [];

  readonly formOradores = 'https://forms.gle/GphPYfL93bDPTAtu8';
}
