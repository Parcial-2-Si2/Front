import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoEvaluacionComponent } from './tipo-evaluacion.component';

describe('TipoEvaluacionComponent', () => {
  let component: TipoEvaluacionComponent;
  let fixture: ComponentFixture<TipoEvaluacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoEvaluacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoEvaluacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
