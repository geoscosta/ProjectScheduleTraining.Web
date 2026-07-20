import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentParqComponent } from './student-parq.component';

describe('StudentParqComponent', () => {
  let component: StudentParqComponent;
  let fixture: ComponentFixture<StudentParqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentParqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentParqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
