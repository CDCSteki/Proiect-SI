import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class TabSyncService implements OnDestroy {
  private channel = new BroadcastChannel('autopulse_tab_sync');
  private readonly TAB_ID = Math.random().toString(36).substring(2);

  constructor(private router: Router) {
    // 1. Ascultăm mesajele de la alte tab-uri
    this.channel.onmessage = (event) => this.handleMessage(event.data);

    // 2. Anunțăm IMEDIAT că acest tab a fost deschis (ex: la duplicare)
    // Astfel, tab-ul vechi va ști să iasă.
    this.channel.postMessage({
      type: 'TAB_OPENED',
      tabId: this.TAB_ID,
    });
  }

  // Apelat manual doar când faci un login explicit
  broadcastLogin(): void {
    this.channel.postMessage({ type: 'LOGIN', tabId: this.TAB_ID });
  }

  // Apelat manual când apeși pe butonul de logout
  broadcastLogout(): void {
    this.channel.postMessage({ type: 'LOGOUT', tabId: this.TAB_ID });
  }

  private handleMessage(data: { type: string; tabId: string }): void {
    // Ignorăm mesajele trimise de acest tab
    if (data.tabId === this.TAB_ID) return;

    switch (data.type) {
      case 'TAB_OPENED':
      case 'LOGIN':
        // S-a deschis un tab NOU (prin duplicare) sau alt tab a făcut login.
        // Asta înseamnă că NOI suntem tab-ul VECHI. Ne deconectăm.
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        this.router.navigate(['/login'], {
          queryParams: { reason: 'other_tab_login' },
        });
        break;

      case 'LOGOUT':
        // Alt tab a inițiat deconectarea, deci ne deconectăm și noi.
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        this.router.navigate(['/login']);
        break;
    }
  }

  ngOnDestroy(): void {
    this.channel.close();
  }
}
