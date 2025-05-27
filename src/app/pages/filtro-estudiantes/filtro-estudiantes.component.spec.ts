import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroEstudiantesComponent } from './filtro-estudiantes.component';

describe('FiltroEstudiantesComponent', () => {
  let component: FiltroEstudiantesComponent;
  let fixture: ComponentFixture<FiltroEstudiantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroEstudiantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltroEstudiantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
