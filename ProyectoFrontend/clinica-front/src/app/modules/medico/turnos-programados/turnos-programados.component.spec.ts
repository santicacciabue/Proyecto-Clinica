import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosProgramadosComponent } from './turnos-programados.component';

describe('TurnosProgramadosComponent', () => {
  let component: TurnosProgramadosComponent;
  let fixture: ComponentFixture<TurnosProgramadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TurnosProgramadosComponent]
    });
    fixture = TestBed.createComponent(TurnosProgramadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
