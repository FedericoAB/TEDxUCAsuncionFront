import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Sponsor {
  name: string;
  tier: 'principal' | 'aliado' | 'media';
  url?: string;
}

@Component({
  standalone: true,
  selector: 'app-sponsors',
  imports: [CommonModule],
  templateUrl: './sponsors.component.html',
  styleUrl: './sponsors.component.scss',
})
export class SponsorsComponent {
  /**
   * Sponsors y aliados. Cuando haya, agregá objetos acá.
   * Los logos en el render siempre son MÁS CHICOS que el del evento
   * (requisito explícito de los TEDx guidelines).
   */
  sponsors: Sponsor[] = [];

  readonly tiers: Array<{ id: Sponsor['tier']; label: string; desc: string }> = [
    { id: 'principal', label: 'Principal', desc: 'Acompañan la edición completa del evento.' },
    { id: 'aliado',    label: 'Aliados estratégicos', desc: 'Universidades, organismos y organizaciones que suman soporte.' },
    { id: 'media',     label: 'Media partners',        desc: 'Medios y plataformas que amplifican el mensaje.' },
  ];

  sponsorsOf(tier: Sponsor['tier']): Sponsor[] {
    return this.sponsors.filter(s => s.tier === tier);
  }
}
