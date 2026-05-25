import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme';
import { TabSyncService } from './core/services/tabsync';
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class App implements OnInit {

  constructor(
    private themeService: ThemeService, 
    private tabSync: TabSyncService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.themeService.initTheme();
    
    if (this.authService.isLoggedIn()) {
      this.authService.startSessionPolling();
    }
  }
}