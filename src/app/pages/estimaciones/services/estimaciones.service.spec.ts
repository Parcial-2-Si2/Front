import { TestBed } from '@angular/core/testing';

import { EstimacionesService } from './estimaciones.service';

describe('EstimacionesService', () => {
  let service: EstimacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstimacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
