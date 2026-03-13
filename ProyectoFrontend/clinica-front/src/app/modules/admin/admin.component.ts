import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  showWelcomeModal = true;
  sidebarAbierto = false;

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 768) {
      this.sidebarAbierto = false;
    }
  }

  cerrarBienvenida() {
    this.showWelcomeModal = false;
  }

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
         if (event.url === '/admin' || event.url === '/admin/bienvenida') {
        this.showWelcomeModal = true;
      } else {
        this.showWelcomeModal = false;
      }
      }
    });
  }

}
