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

interface Speaker {
  n: string;
  r: string;
  t: string;
  line: string;
}

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

  days = '—';
  hours = '—';
  mins = '—';
  secs = '—';

  speakers: Speaker[] = [
    { n: 'Orador / a 01', r: 'Investigadora · UC', t: '“Mapas del sonido: escuchar la ciudad en guaraní.”', line: 'periferia cultural' },
    { n: 'Orador / a 02', r: 'Neurociencia', t: '“El cerebro y la atención en un entorno infinito.”', line: 'conocimiento' },
    { n: 'Orador / a 03', r: 'Innovación social', t: '“Construir una orquesta con lo que sobra.”', line: 'geográfica' },
    { n: 'Orador / a 04', r: 'Arte & diseño', t: '“Tejer software como si fuera ñandutí.”', line: 'conocimiento' },
    { n: 'Orador / a 05', r: 'Filosofía', t: '“Habitar la incertidumbre sin apagarla.”', line: 'existencial' },
    { n: 'Orador / a 06', r: 'Arquitectura', t: '“Lo público como infraestructura del afecto.”', line: 'cultural' },
    { n: 'Orador / a 07', r: 'Ciencia & clima', t: '“Del Chaco al satélite: leer el territorio.”', line: 'geográfica' },
    { n: 'Orador / a 08', r: 'Emprendimiento joven', t: '“Ideas que empiezan antes de graduarse.”', line: 'cultural' },
  ];

  schedule: Slot[] = [
    { time: '14:00', title: 'Acreditación & Festival', italic: 'de Ideas', kind: 'open', kindClass: '', desc: 'Recepción, kit del asistente, exhibiciones artísticas e intervenciones en los patios contiguos al auditorio.' },
    { time: '15:00', title: 'Apertura ·', italic: 'Ñandutí', kind: 'performance', kindClass: 'perf', desc: 'Bienvenida del equipo curatorial y performance inaugural — un preludio sonoro tejido entre guaraní y español.' },
    { time: '15:20', title: 'Bloque I ·', italic: 'Periferias geográficas', kind: '3 charlas', kindClass: 'talk', desc: 'Ideas que nacen en los bordes del mapa y redibujan lo que consideramos centro.' },
    { time: '16:40', title: 'Intermedio & café', kind: 'pausa', kindClass: 'break', desc: 'Recorrido por el festival de ideas, networking, degustación local.' },
    { time: '17:10', title: 'Bloque II ·', italic: 'Periferias del conocimiento', kind: '3 charlas', kindClass: 'talk', desc: 'Cruces interdisciplinarios: ciencia, arte, tecnología y sociedad en conversación.' },
    { time: '18:30', title: 'Intervalo artístico', kind: 'performance', kindClass: 'perf', desc: 'Invitación sonora y visual — un respiro entre bloques.' },
    { time: '19:00', title: 'Bloque III ·', italic: 'Periferias existenciales & culturales', kind: '3–4 charlas', kindClass: 'talk', desc: 'Identidad, lengua, memoria y las formas en que habitamos lo incierto.' },
    { time: '20:30', title: 'Cierre & brindis', kind: 'open', kindClass: '', desc: 'Conversación informal con oradores, equipo y asistentes. Registro de testimonios.' },
    { time: '21:00', title: 'Festival', italic: 'hasta tarde', kind: 'open', kindClass: '', desc: 'Los espacios complementarios permanecen abiertos en el campus.' },
  ];

  periferias = [
    { num: '01', h: 'Geográficas', p: 'Territorios que se piensan a sí mismos desde el borde del mapa — y desde ahí imaginan el centro.' },
    { num: '02', h: 'Del conocimiento', p: 'Las fronteras entre disciplinas, donde lo que no tiene nombre todavía empieza a tener forma.' },
    { num: '03', h: 'Existenciales', p: 'Los bordes de lo humano: identidad, cuerpo, tiempo, memoria y el modo en que habitamos lo incierto.' },
    { num: '04', h: 'Culturales', p: 'Lengua, sonido, oficio, ritual. El bilingüismo guaraní–español como atmósfera y como argumento.' },
  ];

  faqs = [
    { q: '¿Quién puede asistir?', a: 'El evento es abierto al público con inscripción previa. Prioridad para estudiantes universitarios, jóvenes profesionales y comunidad académica.' },
    { q: '¿Dónde es exactamente?', a: 'Campus Santa Librada, Universidad Católica “Nuestra Señora de la Asunción”. Auditorio central + patios para el festival de ideas.' },
    { q: '¿En qué idioma son las charlas?', a: 'Principalmente en español, con intervenciones en guaraní. Las charlas se publican luego con subtítulos en los canales oficiales.' },
    { q: '¿Cómo se seleccionan las ideas?', a: 'A través de un proceso curatorial con convocatoria abierta, búsqueda directa y desarrollo guiado junto a coaches de contenido.' },
    { q: '¿Se transmite en vivo?', a: 'La edición es 100% presencial. Las charlas se graban y publican posteriormente en los canales oficiales de TED y TEDx.' },
    { q: '¿Cuál es el costo?', a: 'Acceso con aporte simbólico para asistentes generales y tarifa reducida para estudiantes UC. Cupo limitado a 100 butacas.' },
  ];

  private rafId = 0;
  private countdownId: any;
  private t0 = 0;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.t0 = performance.now();
      this.tickOrbit(this.t0);
    });
    this.startCountdown();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    if (this.countdownId) clearInterval(this.countdownId);
  }

  private tickOrbit = (now: number) => {
    const ring = this.orbitRing?.nativeElement;
    if (!ring) {
      this.rafId = requestAnimationFrame(this.tickOrbit);
      return;
    }
    const w = ring.clientWidth || 600;
    const h = ring.clientHeight || 600;
    const r = Math.min(w * 0.56, 380);
    const cx = w / 2;
    const cy = h / 2;
    const PERIOD = 60000;
    const phase = ((now - this.t0) / PERIOD) * Math.PI * 2;
    const els = ring.querySelectorAll<HTMLElement>('.lbl');
    const n = els.length;
    els.forEach((el, i) => {
      const a = phase + (i / n) * Math.PI * 2 - Math.PI / 2;
      el.style.left = cx + Math.cos(a) * r + 'px';
      el.style.top = cy + Math.sin(a) * r + 'px';
    });
    this.rafId = requestAnimationFrame(this.tickOrbit);
  };

  private startCountdown(): void {
    const target = new Date('2026-10-25T15:00:00-03:00').getTime();
    const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');
    const tick = () => {
      const now = Date.now();
      let diff = Math.max(0, target - now);
      const days = Math.floor(diff / 86400000); diff -= days * 86400000;
      const hrs = Math.floor(diff / 3600000); diff -= hrs * 3600000;
      const mins = Math.floor(diff / 60000); diff -= mins * 60000;
      const secs = Math.floor(diff / 1000);
      this.days = String(days);
      this.hours = pad(hrs);
      this.mins = pad(mins);
      this.secs = pad(secs);
    };
    tick();
    this.countdownId = setInterval(tick, 1000);
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

  scrollTo(anchor: string): void {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
  }
}
