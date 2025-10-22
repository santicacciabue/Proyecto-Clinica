import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleMedicoAgendaComponent } from './detalle-medico-agenda.component';

describe('DetalleMedicoAgendaComponent', () => {
  let component: DetalleMedicoAgendaComponent;
  let fixture: ComponentFixture<DetalleMedicoAgendaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetalleMedicoAgendaComponent]
    });
    fixture = TestBed.createComponent(DetalleMedicoAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
