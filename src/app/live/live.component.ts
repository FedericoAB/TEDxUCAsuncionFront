import {
  AfterViewInit,
  Component,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-live',
  imports: [CommonModule],
  templateUrl: './live.component.html',
  styleUrl: './live.component.scss',
})
export class LiveComponent implements AfterViewInit, OnDestroy {
  days = '—';
  hours = '—';
  mins = '—';
  secs = '—';

  /**
   * Placeholder del canal de YouTube.
   * Reemplazar el `videoId` de la URL cuando haya stream real.
   * Actual: la charla "TED Talks Daily — Chris Anderson" como marcador visual.
   */
  readonly youtubeEmbed: SafeResourceUrl;
  readonly youtubeChannel = 'https://www.youtube.com/@TED';

  private countdownId: any;

  constructor(private sanitizer: DomSanitizer) {
    this.youtubeEmbed = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/videoseries?list=PLsRNoUx8w3rMl5j2fd5LKV3PwPg6taXnA'
    );
  }

  ngAfterViewInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownId) clearInterval(this.countdownId);
  }

  private startCountdown(): void {
    const target = new Date('2026-08-01T15:00:00-03:00').getTime();
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
}
