import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelEnrollmentDialogComponent } from './cancel-enrollment-dialog.component';

describe('CancelEnrollmentDialogComponent', () => {
  let component: CancelEnrollmentDialogComponent;
  let fixture: ComponentFixture<CancelEnrollmentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelEnrollmentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelEnrollmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
