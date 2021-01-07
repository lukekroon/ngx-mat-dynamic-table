import { TestBed } from '@angular/core/testing';

import { ColumnStorageService } from './column-storage.service';

describe('ColumnStorageService', () => {
  let service: ColumnStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColumnStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
