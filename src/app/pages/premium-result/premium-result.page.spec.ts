import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PremiumResultPage } from './premium-result.page';

describe('PremiumResultPage', () => {
  let component: PremiumResultPage;
  let fixture: ComponentFixture<PremiumResultPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PremiumResultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
