import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentMeasuresComponent } from './student-measures.component';

describe('StudentMeasuresComponent', () => {
  let component: StudentMeasuresComponent;
  let fixture: ComponentFixture<StudentMeasuresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentMeasuresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentMeasuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
