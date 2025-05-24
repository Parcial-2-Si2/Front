import { TestBed } from '@angular/core/testing';

import { DocenteMateriaService } from './docente-materia.service';

describe('DocenteMateriaService', () => {
  let service: DocenteMateriaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocenteMateriaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
