import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AeBannerComponent } from './ae-banner.component';

describe('AeBannerComponent', () => {
  let component: AeBannerComponent;
  let fixture: ComponentFixture<AeBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeBannerComponent);
    component = fixture.componentInstance;
    component.id="bannerid";
    component.name="bannername";
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
