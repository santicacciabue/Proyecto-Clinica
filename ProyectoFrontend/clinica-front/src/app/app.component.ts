import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'clinica-front';
  isAdminRoute: boolean = false;
    
    constructor(private router: Router) {}

    ngOnInit(): void {
        // Suscribirse a los eventos de navegación
        this.router.events.subscribe(() => {
            // Verificar si la URL actual comienza con '/admin'
            this.isAdminRoute = this.router.url.startsWith('/admin');
        });
    }
}
