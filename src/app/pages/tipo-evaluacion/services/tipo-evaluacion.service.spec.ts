import { TestBed } from '@angular/core/testing';

import { TipoEvaluacionService } from './tipo-evaluacion.service';

describe('TipoEvaluacionService', () => {
  let service: TipoEvaluacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoEvaluacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
