import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Speaker {
  name: string;
  tag?: string;
}

@Component({
  standalone: true,
  selector: 'app-landing',
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  @ViewChild('heroCarousel') heroCarousel?: ElementRef<HTMLDivElement>;

  private autoScrollId: any;
  private heroItems: HTMLElement[] = [];
  private currentIndex = 0;
  ngAfterViewInit(): void {
    // nos aseguramos de que la vista ya está renderizada
    setTimeout(() => {
      const el = this.heroCarousel?.nativeElement;
      if (!el) {
        return;
      }

      this.heroItems = Array.from(
        el.querySelectorAll<HTMLElement>('.hero-item')
      );

      if (!this.heroItems.length) {
        return;
      }

      // centrar primer ítem
      this.centerHeroItem(this.currentIndex, false);
      this.updateHeroScales();

      // actualizar escala cuando el usuario scrollea manualmente
      el.addEventListener('scroll', () => this.updateHeroScales());

      // arrancar animación automática
      this.startAutoScroll();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.autoScrollId) {
      clearInterval(this.autoScrollId);
    }
  }
  private startAutoScroll(): void {
    if (!this.heroItems.length) {
      return;
    }

    const intervalMs = 2600; // tiempo entre un ítem y otro

    this.autoScrollId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.heroItems.length;
      this.centerHeroItem(this.currentIndex, true);
    }, intervalMs);
  }

  private centerHeroItem(index: number, smooth: boolean): void {
    const el = this.heroCarousel?.nativeElement;
    if (!el) {
      return;
    }

    const item = this.heroItems[index];
    if (!item) {
      return;
    }

    const itemOffsetLeft = item.offsetLeft;
    const itemWidth = item.offsetWidth;
    const containerWidth = el.clientWidth;

    const targetScrollLeft = itemOffsetLeft - (containerWidth - itemWidth) / 2;

    el.scrollTo({
      left: targetScrollLeft,
      behavior: smooth ? 'smooth' : 'auto',
    });

    // aseguramos recalcular la escala
    this.updateHeroScales();
  }
  private updateHeroScales(): void {
    const el = this.heroCarousel?.nativeElement;
    if (!el) {
      return;
    }

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    this.heroItems.forEach((item) => {
      const r = item.getBoundingClientRect();
      const itemCenter = r.left + r.width / 2;
      const distance = Math.abs(itemCenter - centerX);

      const maxDistance = rect.width / 2;
      const t = Math.min(distance / maxDistance, 1); // 0 centro, 1 bordes

      const scale = 1.4 - 0.6 * t; // centro grande, bordes chicos
      item.style.transform = `scale(${scale})`;
      item.style.opacity = String(1 - 0.3 * t);
    });
  }
  showLivePlayer = false;

  toggleLive(): void {
    this.showLivePlayer = !this.showLivePlayer;
  }

  speakers: Speaker[] = [
    { name: 'Disertante 1', tag: 'Innovación' },
    { name: 'Disertante 2', tag: 'Educación' },
    { name: 'Disertante 3', tag: 'Tecnología' },
    { name: 'Disertante 4', tag: 'Emprendimiento' },
    { name: 'Disertante 5', tag: 'Salud' },
    { name: 'Disertante 6', tag: 'Arte' },
  ];
  //nosotros uwu
  organizers = [
    { name: 'Nombre Organizador 1', role: 'Curaduría' },
    { name: 'Nombre Organizador 2', role: 'Producción' },
    { name: 'Nombre Organizador 3', role: 'Diseño' },
    { name: 'Nombre Organizador 4', role: 'Comunicación' },
    { name: 'Nombre Organizador 5', role: 'Logística' },
  ];

  scrollTo(anchor: string): void {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
  }
}
