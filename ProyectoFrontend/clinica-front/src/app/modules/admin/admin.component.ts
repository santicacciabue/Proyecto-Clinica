import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  showWelcomeModal = true;

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
