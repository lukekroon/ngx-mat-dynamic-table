import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSearchInputComponent } from './table-search-input.component';

describe('TableSearchInputComponent', () => {
  let component: TableSearchInputComponent;
  let fixture: ComponentFixture<TableSearchInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableSearchInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableSearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
