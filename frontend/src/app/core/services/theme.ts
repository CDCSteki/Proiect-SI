import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  isDark = signal<boolean>(true);

  toggleTheme(): void {
    this.isDark.update(v => !v);
    document.body.classList.toggle('light-theme', !this.isDark());
  }

  initTheme(): void {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      this.isDark.set(false);
      document.body.classList.add('light-theme');
    }
  }
}