import { TestBed } from '@angular/core/testing';

import { FiltroEstudiantesService } from './filtro-estudiantes.service';

describe('FiltroEstudiantesService', () => {
  let service: FiltroEstudiantesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiltroEstudiantesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
