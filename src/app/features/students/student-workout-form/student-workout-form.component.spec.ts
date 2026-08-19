import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentWorkoutFormComponent } from './student-workout-form.component';

describe('StudentWorkoutFormComponent', () => {
  let component: StudentWorkoutFormComponent;
  let fixture: ComponentFixture<StudentWorkoutFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentWorkoutFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentWorkoutFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
