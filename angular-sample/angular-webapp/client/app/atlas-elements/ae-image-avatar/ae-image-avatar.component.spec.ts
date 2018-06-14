/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { AeImageAvatarSize } from '../common/ae-image-avatar-size.enum';

import { AeImageAvatarComponent } from './ae-image-avatar.component';
import { AeIconComponent } from '../ae-icon/ae-icon.component';

xdescribe('AeImageAvatarComponent', () => {
  let component: AeImageAvatarComponent;
  let fixture: ComponentFixture<AeImageAvatarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeImageAvatarComponent, AeIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeImageAvatarComponent);
    component = fixture.componentInstance;
    component.isBorderCircle=true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a defined component', () => {
        expect(component).toBeDefined();
    });

    it('img scr should be defined', () => {
      expect(fixture.componentInstance['_imgSrcUrl']).toBeDefined();
  });

  it('should have defined edit attribute', () => {
      expect(fixture.componentInstance['_isEditable']).toBeDefined();
  });

  it('should have defined size attribute', () => {
      expect(fixture.componentInstance['_size']).toBeDefined();
  });

  it('size equal matcher for big', () => {
      expect(fixture.componentInstance['_size']).toEqual(AeImageAvatarSize.big);
  });

  it('should have defined isBorderCircle attribute', () => {
      expect(fixture.componentInstance['_isBorderCircle']).toBeDefined();
  });

  it('for big size should return true', () => {
      expect(fixture.componentInstance['_isBigAvatar']()).toEqual(true);
  });

  //negative testing
  // it('for small size should return false', () => {
  //     expect(fixture.componentInstance['_isBigAvatar']()).toEqual(false);
  // });
    
});
