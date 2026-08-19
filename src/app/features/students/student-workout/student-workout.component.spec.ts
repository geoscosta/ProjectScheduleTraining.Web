import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentWorkoutComponent } from './student-workout.component';

describe('StudentWorkoutComponent', () => {
  let component: StudentWorkoutComponent;
  let fixture: ComponentFixture<StudentWorkoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentWorkoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentWorkoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
