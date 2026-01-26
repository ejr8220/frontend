import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudCompanyComponent } from './crud_company.component';

describe('CrudCompanyComponent', () => {
  let component: CrudCompanyComponent;
  let fixture: ComponentFixture<CrudCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudCompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrudCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
