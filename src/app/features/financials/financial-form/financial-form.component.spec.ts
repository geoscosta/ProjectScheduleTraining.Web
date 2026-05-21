import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialFormComponent } from './financial-form.component';

describe('FinancialFormComponent', () => {
  let component: FinancialFormComponent;
  let fixture: ComponentFixture<FinancialFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
