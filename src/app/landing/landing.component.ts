import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Slot {
  time: string;
  title: string;
  italic?: string;
  kind: string;
  kindClass?: 'talk' | 'perf' | 'break' | '';
  desc: string;
}

@Component({
  standalone: true,
  selector: 'app-landing',
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('orbitRing') orbitRing?: ElementRef<HTMLDivElement>;
  @ViewChild('mark') mark?: ElementRef<HTMLElement>;

  orbitLabels = [
    'Periferia geográfica',
    'Periferia del conocimiento',
    'Periferia existencial',
    'Periferia cultural',
    'Mosaico de ideas',
  ];

  /** Links oficiales de postulación */
  readonly formOradores = 'https://forms.gle/GphPYfL93bDPTAtu8';
  readonly formVoluntarios = 'https://forms.gle/icSho1WVDo6F8as5A';

  schedule: Slot[] = [
    { time: '14:00', title: 'Acreditación & Festival', italic: 'de Ideas', kind: 'open', kindClass: '', desc: 'Recepción, kit del asistente, exhibiciones artísticas e intervenciones al aire libre sobre la costanera.' },
    { time: '15:00', title: 'Apertura ·', italic: 'Ñandutí', kind: 'performance', kindClass: 'perf', desc: 'Bienvenida del equipo curatorial y performance inaugural — un preludio sonoro tejido entre guaraní y español.' },
    { time: '15:20', title: 'Bloque I ·', italic: 'Periferias geográficas', kind: '3 charlas', kindClass: 'talk', desc: 'Ideas que nacen en los bordes del mapa y redibujan lo que consideramos centro.' },
    { time: '16:40', title: 'Intermedio & café', kind: 'pausa', kindClass: 'break', desc: 'Recorrido por el festival de ideas, networking, degustación local.' },
    { time: '17:10', title: 'Bloque II ·', italic: 'Periferias del conocimiento', kind: '3 charlas', kindClass: 'talk', desc: 'Cruces interdisciplinarios: ciencia, arte, tecnología y sociedad en conversación.' },
    { time: '18:30', title: 'Intervalo artístico', kind: 'performance', kindClass: 'perf', desc: 'Invitación sonora y visual — un respiro entre bloques.' },
    { time: '19:00', title: 'Bloque III ·', italic: 'Periferias existenciales & culturales', kind: '3–4 charlas', kindClass: 'talk', desc: 'Identidad, lengua, memoria y las formas en que habitamos lo incierto.' },
    { time: '20:30', title: 'Cierre & brindis', kind: 'open', kindClass: '', desc: 'Conversación informal con oradores, equipo y asistentes. Registro de testimonios.' },
    { time: '21:00', title: 'Festival', italic: 'hasta tarde', kind: 'open', kindClass: '', desc: 'Los espacios complementarios del puerto permanecen abiertos sobre la costanera.' },
  ];

  periferias = [
    { num: '01', h: 'Geográficas', p: 'Territorios que se piensan a sí mismos desde el borde del mapa — y desde ahí imaginan el centro.' },
    { num: '02', h: 'Del conocimiento', p: 'Las fronteras entre disciplinas, donde lo que no tiene nombre todavía empieza a tener forma.' },
    { num: '03', h: 'Existenciales', p: 'Los bordes de lo humano: identidad, cuerpo, tiempo, memoria y el modo en que habitamos lo incierto.' },
    { num: '04', h: 'Culturales', p: 'Lengua, sonido, oficio, ritual. El bilingüismo guaraní–español como atmósfera y como argumento.' },
  ];

  faqs = [
    { q: '¿Quién puede asistir?', a: 'El evento es abierto al público con inscripción previa. Prioridad para estudiantes universitarios, jóvenes profesionales y comunidad académica.' },
    { q: '¿Dónde es exactamente?', a: 'Puerto de Asunción — sobre la costanera, frente al río Paraguay. Escenario principal + festival de ideas en los espacios al aire libre del puerto.' },
    { q: '¿En qué idioma son las charlas?', a: 'Principalmente en español, con intervenciones en guaraní. Las charlas se publican luego con subtítulos en los canales oficiales.' },
    { q: '¿Cómo se seleccionan las ideas?', a: 'A través de un proceso curatorial con convocatoria abierta, búsqueda directa y desarrollo guiado junto a coaches de contenido.' },
    { q: '¿Se transmite en vivo?', a: 'Sí — la transmisión oficial se publica en la sección "Ver en vivo". Las charlas también se graban y publican posteriormente en los canales oficiales de TED y TEDx.' },
    { q: '¿Cuál es el costo?', a: 'Entrada a precio único para todo público. El precio y la fecha de lanzamiento de venta se anunciarán próximamente. Cupo limitado a 100 butacas.' },
  ];

  private rafId = 0;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const ring = this.orbitRing?.nativeElement;
        if (!ring) {
          this.rafId = requestAnimationFrame(tick);
          return;
        }
        const w = ring.clientWidth || 600;
        const h = ring.clientHeight || 600;
        const r = Math.min(w * 0.56, 380);
        const cx = w / 2;
        const cy = h / 2;
        const PERIOD = 60000;
        const phase = ((now - t0) / PERIOD) * Math.PI * 2;
        const els = ring.querySelectorAll<HTMLElement>('.lbl');
        const n = els.length;
        els.forEach((el, i) => {
          const a = phase + (i / n) * Math.PI * 2 - Math.PI / 2;
          el.style.left = cx + Math.cos(a) * r + 'px';
          el.style.top = cy + Math.sin(a) * r + 'px';
        });
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const mark = this.mark?.nativeElement;
    if (!mark) return;
    const y = window.scrollY;
    const h = window.innerHeight;
    if (y < h * 1.4) {
      const shift = Math.min(y * 0.15, 80);
      mark.style.transform = `translateY(${shift}px)`;
    }
  }
}
