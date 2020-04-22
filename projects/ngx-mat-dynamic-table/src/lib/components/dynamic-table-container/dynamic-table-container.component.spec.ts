import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicTableContainerComponent } from './dynamic-table-container.component';

describe('DynamicTableContainerComponent', () => {
  let component: DynamicTableContainerComponent;
  let fixture: ComponentFixture<DynamicTableContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicTableContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicTableContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
