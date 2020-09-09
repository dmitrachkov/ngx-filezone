import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgPreviewComponent } from './svg-preview.component';

describe('SvgPreviewComponent', () => {
  let component: SvgPreviewComponent;
  let fixture: ComponentFixture<SvgPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SvgPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
