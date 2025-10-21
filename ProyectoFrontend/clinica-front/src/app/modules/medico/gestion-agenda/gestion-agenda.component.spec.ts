import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionAgendaComponent } from './gestion-agenda.component';

describe('GestionAgendaComponent', () => {
  let component: GestionAgendaComponent;
  let fixture: ComponentFixture<GestionAgendaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestionAgendaComponent]
    });
    fixture = TestBed.createComponent(GestionAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
