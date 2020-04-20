import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMatDynamicTableComponent } from './ngx-mat-dynamic-table.component';

describe('NgxMatDynamicTableComponent', () => {
  let component: NgxMatDynamicTableComponent;
  let fixture: ComponentFixture<NgxMatDynamicTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxMatDynamicTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxMatDynamicTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
