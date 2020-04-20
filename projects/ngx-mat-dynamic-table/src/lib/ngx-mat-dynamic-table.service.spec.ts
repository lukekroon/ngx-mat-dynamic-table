import { TestBed } from '@angular/core/testing';

import { NgxMatDynamicTableService } from './ngx-mat-dynamic-table.service';

describe('NgxMatDynamicTableService', () => {
  let service: NgxMatDynamicTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxMatDynamicTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
