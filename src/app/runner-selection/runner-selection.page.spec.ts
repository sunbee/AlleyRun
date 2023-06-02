import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RunnerSelectionPage } from './runner-selection.page';

describe('RunnerSelectionPage', () => {
  let component: RunnerSelectionPage;
  let fixture: ComponentFixture<RunnerSelectionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RunnerSelectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
