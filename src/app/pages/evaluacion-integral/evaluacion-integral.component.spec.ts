import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionIntegralComponent } from './evaluacion-integral.component';

describe('EvaluacionIntegralComponent', () => {
  let component: EvaluacionIntegralComponent;
  let fixture: ComponentFixture<EvaluacionIntegralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionIntegralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluacionIntegralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
