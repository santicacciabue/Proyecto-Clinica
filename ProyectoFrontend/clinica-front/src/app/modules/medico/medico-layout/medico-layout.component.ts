import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-medico-layout',
  templateUrl: './medico-layout.component.html',
  styleUrls: ['./medico-layout.component.css']
})
export class MedicoLayoutComponent implements OnInit, OnDestroy {
  isMobile: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router, 
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Handset, '(max-width: 767px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.cerrarSesion(); 
    this.router.navigate(['']); 
  }
}