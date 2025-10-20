import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionEspecialidadesComponent } from './gestion-especialidades.component';

describe('GestionEspecialidadesComponent', () => {
  let component: GestionEspecialidadesComponent;
  let fixture: ComponentFixture<GestionEspecialidadesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestionEspecialidadesComponent]
    });
    fixture = TestBed.createComponent(GestionEspecialidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
