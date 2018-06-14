import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AeListItemComponent } from './ae-list-item.component';
import { AeTemplateLoaderComponent } from '../ae-template-loader/ae-template-loader.component';

describe('AeListItemComponent', () => {
  let component: AeListItemComponent<any>;
  let fixture: ComponentFixture<AeListItemComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeListItemComponent,AeTemplateLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
