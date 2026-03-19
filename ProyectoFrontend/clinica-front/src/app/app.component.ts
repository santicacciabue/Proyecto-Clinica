import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'clinica-front';
  isSidebarRoute: boolean = false;
    
    constructor(private router: Router) {}

    ngOnInit(): void {
        // Suscribirse a los eventos de navegación
        this.router.events.subscribe((event: any) => {
            if (event && event.urlAfterRedirects) {
                const url = event.urlAfterRedirects;
                this.isSidebarRoute = url.startsWith('/admin') || 
                                      url.startsWith('/medico') || 
                                      url.startsWith('/operador');
            }
        });
    }
}
