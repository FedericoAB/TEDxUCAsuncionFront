import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { AboutComponent } from './about/about.component';
import { SpeakersComponent } from './speakers/speakers.component';
import { LiveComponent } from './live/live.component';
import { SponsorsComponent } from './sponsors/sponsors.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'oradores', component: SpeakersComponent },
  { path: 'ver-en-vivo', component: LiveComponent },
  { path: 'sponsors', component: SponsorsComponent },
  { path: '**', redirectTo: '' },
];
