import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentVacationsComponent } from './student-vacations.component';

describe('StudentVacationsComponent', () => {
  let component: StudentVacationsComponent;
  let fixture: ComponentFixture<StudentVacationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentVacationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentVacationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
