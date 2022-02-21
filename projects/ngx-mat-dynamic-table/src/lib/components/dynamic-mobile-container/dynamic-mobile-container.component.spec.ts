import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicMobileContainerComponent } from './dynamic-mobile-container.component';

describe('DynamicMobileContainerComponent', () => {
  let component: DynamicMobileContainerComponent;
  let fixture: ComponentFixture<DynamicMobileContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicMobileContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicMobileContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
