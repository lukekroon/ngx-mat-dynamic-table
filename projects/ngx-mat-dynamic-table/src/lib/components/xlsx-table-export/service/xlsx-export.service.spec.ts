import { TestBed } from '@angular/core/testing';

import { XlsxExportService } from './xlsx-export.service';

describe('XlsxExportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: XlsxExportService = TestBed.get(XlsxExportService);
    expect(service).toBeTruthy();
  });
});
