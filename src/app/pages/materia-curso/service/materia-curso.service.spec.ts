import { TestBed } from '@angular/core/testing';

import { MateriaCursoService } from './materia-curso.service';

describe('MateriaCursoService', () => {
  let service: MateriaCursoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MateriaCursoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
