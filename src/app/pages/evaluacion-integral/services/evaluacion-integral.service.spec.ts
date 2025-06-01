import { TestBed } from '@angular/core/testing';

import { EvaluacionIntegralService } from './evaluacion-integral.service';

describe('EvaluacionIntegralService', () => {
  let service: EvaluacionIntegralService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvaluacionIntegralService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
