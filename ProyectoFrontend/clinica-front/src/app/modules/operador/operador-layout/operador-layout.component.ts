import { Component } from '@angular/core';

@Component({
  selector: 'app-operador-layout',
  templateUrl: './operador-layout.component.html',
  styleUrls: ['./operador-layout.component.css']
})
export class OperadorLayoutComponent {
  sidebarAbierto = false;

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 768) {
      this.sidebarAbierto = false;
    }
  }

}
