import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPacienteComponent } from './crear-paciente.component';

describe('CrearPacienteComponent', () => {
  let component: CrearPacienteComponent;
  let fixture: ComponentFixture<CrearPacienteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrearPacienteComponent]
    });
    fixture = TestBed.createComponent(CrearPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
