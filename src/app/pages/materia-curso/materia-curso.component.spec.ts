import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaCursoComponent } from './materia-curso.component';

describe('MateriaCursoComponent', () => {
  let component: MateriaCursoComponent;
  let fixture: ComponentFixture<MateriaCursoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriaCursoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MateriaCursoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
