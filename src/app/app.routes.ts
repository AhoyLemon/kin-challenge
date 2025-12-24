import { Routes } from '@angular/router';
import { OcrComponent } from './pages/ocr/ocr';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/ocr',
    pathMatch: 'full',
  },
  {
    path: 'ocr',
    component: OcrComponent,
  },
];
