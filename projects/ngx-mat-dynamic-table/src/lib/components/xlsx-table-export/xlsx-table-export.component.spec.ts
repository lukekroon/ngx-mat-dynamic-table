import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XlsxTableExportComponent } from './xlsx-table-export.component';

describe('XlsxTableExportComponent', () => {
  let component: XlsxTableExportComponent;
  let fixture: ComponentFixture<XlsxTableExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XlsxTableExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XlsxTableExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
