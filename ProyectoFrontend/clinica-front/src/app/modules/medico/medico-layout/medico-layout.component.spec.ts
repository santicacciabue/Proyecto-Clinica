import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicoLayoutComponent } from './medico-layout.component';

describe('MedicoLayoutComponent', () => {
  let component: MedicoLayoutComponent;
  let fixture: ComponentFixture<MedicoLayoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MedicoLayoutComponent]
    });
    fixture = TestBed.createComponent(MedicoLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
