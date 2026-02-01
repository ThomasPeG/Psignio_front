import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultPreviewPage } from './result-preview.page';

describe('ResultPreviewPage', () => {
  let component: ResultPreviewPage;
  let fixture: ComponentFixture<ResultPreviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultPreviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
