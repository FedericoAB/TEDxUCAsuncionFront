import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  /** Link oficial al programa TEDx — requisito de los TEDx Web + Social guidelines. */
  readonly tedxProgramLink =
    'https://www.ted.com/about/programs-initiatives/tedx-program';

  /** Redes oficiales */
  readonly instagramUrl = 'https://www.instagram.com/tedxucasuncion/';

  /** Estado del menú hamburguesa (sólo visible en mobile) */
  menuOpen = false;

  constructor(private router: Router) {
    // Cerrar el menú automáticamente al cambiar de ruta
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => (this.menuOpen = false));
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  /** Cerrar el menú con tecla Escape */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen) this.menuOpen = false;
  }
}
