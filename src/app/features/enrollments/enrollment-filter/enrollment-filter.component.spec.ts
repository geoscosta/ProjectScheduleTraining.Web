import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollmentFilterComponent } from './enrollment-filter.component';

describe('EnrollmentFilterComponent', () => {
  let component: EnrollmentFilterComponent;
  let fixture: ComponentFixture<EnrollmentFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollmentFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrollmentFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
