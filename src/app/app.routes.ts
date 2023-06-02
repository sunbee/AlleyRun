import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'runner-selection',
    pathMatch: 'full',
  },
  {
    path: 'runner-selection',
    loadComponent: () => import('./runner-selection/runner-selection.page').then( m => m.RunnerSelectionPage)
  },
];
