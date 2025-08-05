import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasingtoolComponent } from './purchasingtool.component';

describe('PurchasingtoolComponent', () => {
  let component: PurchasingtoolComponent;
  let fixture: ComponentFixture<PurchasingtoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasingtoolComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PurchasingtoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
