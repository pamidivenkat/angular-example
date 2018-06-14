import { AeVideoPlayMode } from '../common/ae-videoplay-mode';
import { AtlasError } from '../../shared/error-handling/atlas-error';
import { AeVideoStyleMode } from '../common/ae-videostyle-mode';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AeButtonComponent } from '../ae-button/ae-button.component';
import { AeModalDialogComponent } from '../ae-modal-dialog/ae-modal-dialog.component';
import { AeIconComponent } from '../ae-icon/ae-icon.component';
import { AeIconSize } from '../common/ae-icon-size.enum';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
//import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';

import { AeVideoComponent } from './ae-video.component';

xdescribe('AeVideoComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AeVideoComponent,
        AeIconComponent,
        AeModalDialogComponent,
        AeButtonComponent,
        TestEmptyVideo,
        TestVideoWithOnlyId,
        TestVideoWithoutVideoUrl,
        TestVideoWithoutThumbnail,
        TestVideoWithoutAltText,
        TestVideoWithAltText,
        TestVideoWithLinkText,
        TestVideoWithThumbnail]
    })
      .compileComponents();
  }));

  it('should create video component', () => {
    let fixture = TestBed.createComponent(TestVideoWithoutAltText);
    let component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should not create component when id is not supplied ', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestEmptyVideo);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).toThrowError('Error in ./TestEmptyVideo class TestEmptyVideo - inline template:1:2 caused by: id is mandatory');
  });

  it('should not create component when name is not supplied ', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestVideoWithOnlyId);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).toThrowError('Error in ./TestVideoWithOnlyId class TestVideoWithOnlyId - inline template:1:12 caused by: name is mandatory');
  });

  it('should not create component when video url is not supplied ', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestVideoWithoutVideoUrl);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).toThrowError('Error in ./TestVideoWithoutVideoUrl class TestVideoWithoutVideoUrl - inline template:1:22 caused by: video url is required');
  });

  it('should create video component without throwing any error when id,name,video url are supplied', () => {
    expect(function () {
      let fixture = TestBed.createComponent(TestVideoWithoutAltText);
      let component = fixture.componentInstance;
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('anchor tag should have "video","fancybox.iframe" classes', () => {
    let fixture: ComponentFixture<TestVideoWithoutAltText> = TestBed.createComponent(TestVideoWithoutAltText);
    let component: TestVideoWithoutAltText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    let hasClasses: boolean = anchorEl.classList.contains("video") && anchorEl.classList.contains("fancybox.iframe");
    expect(hasClasses).toBe(true);
  });

  it('image tag should be render when videostyle is thumbnail', () => {
    let fixture: ComponentFixture<TestVideoWithoutAltText> = TestBed.createComponent(TestVideoWithoutAltText);
    let component: TestVideoWithoutAltText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    let imageEl: HTMLElement = anchorEl.querySelectorAll('img')[0];
    expect(imageEl).toBeDefined();

    let spanEl: HTMLElement = <HTMLElement>anchorEl.querySelectorAll('span.link-text')[0];
    expect(spanEl).toBeUndefined(`expected that span element with link text should not be rendered.`);
  });

  it('thumbnail image tag should have class "video__thumbnail"', () => {
    let fixture: ComponentFixture<TestVideoWithoutAltText> = TestBed.createComponent(TestVideoWithoutAltText);
    let component: TestVideoWithoutAltText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    let imageEl: HTMLElement = anchorEl.querySelectorAll('img')[0];
    let hasClass: boolean = imageEl.classList.contains('video__thumbnail');
    expect(hasClass).toEqual(true);
  });

  it('thumbnail image tag should have supplied thumbnail image url as src attribute', () => {
    let fixture: ComponentFixture<TestVideoWithoutAltText> = TestBed.createComponent(TestVideoWithoutAltText);
    let component: TestVideoWithoutAltText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    let imageEl: HTMLElement = anchorEl.querySelectorAll('img')[0];
    let srcValue: string = imageEl.getAttribute('src');
    expect(srcValue).toEqual('https://unsplash.it/640/360');
  });

  it('thumbnail should be retrieved from youtube when thumbnail image is not supplied', () => {
    let fixture: ComponentFixture<TestVideoWithoutThumbnail> = TestBed.createComponent(TestVideoWithoutThumbnail);
    let component: TestVideoWithoutThumbnail = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    let imageEl: HTMLElement = anchorEl.querySelectorAll('img')[0];
    let srcValue: string = imageEl.getAttribute('src');
    expect(srcValue).toEqual('http://img.youtube.com/vi/KhrfbFnfNqs/0.jpg');
  });

  it('play icon container div should be rendered when videostyle is thumbnail', () => {
    let fixture: ComponentFixture<TestVideoWithoutAltText> = TestBed.createComponent(TestVideoWithoutAltText);
    let component: TestVideoWithoutAltText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    let iconContainerEl: HTMLElement = anchorEl.querySelectorAll('div')[0];
    expect(iconContainerEl).toBeDefined();
    let hasClass: boolean = iconContainerEl.classList.contains('video__play');
    expect(hasClass).toEqual(true);
  });

  it('ae-icon component should render', () => {
    let fixture: ComponentFixture<TestVideoWithoutAltText> = TestBed.createComponent(TestVideoWithoutAltText);
    let component: TestVideoWithoutAltText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    let iconEl: HTMLElement = <HTMLElement>anchorEl.querySelectorAll('ae-icon')[0];
    expect(iconEl).toBeDefined();
  });

  it('ae-icon component should have correct id/name relative to video component id', () => {
    let fixture: ComponentFixture<TestVideoWithoutAltText> = TestBed.createComponent(TestVideoWithoutAltText);
    let component: TestVideoWithoutAltText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    let iconEl: HTMLElement = <HTMLElement>anchorEl.querySelectorAll('ae-icon > div')[0];
    expect(iconEl).toBeDefined();
    let idValue: string = iconEl.getAttribute('id');
    let videoIdValue: string = anchorEl.getAttribute('id');
    expect(idValue).toEqual(`${videoIdValue}_playicon`);
    let nameValue: string = iconEl.getAttribute('id');
    expect(nameValue).toEqual(`${videoIdValue}_playicon`);
  });

  it('video play icon size should be icon size of big', () => {
    let fixture: ComponentFixture<TestVideoWithoutAltText> = TestBed.createComponent(TestVideoWithoutAltText);
    let component: TestVideoWithoutAltText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    let iconEl: HTMLElement = <HTMLElement>anchorEl.querySelectorAll('ae-icon > div')[0];
    expect(iconEl).toBeDefined();
    let hasClass: boolean = iconEl.classList.contains("icon") && iconEl.classList.contains("icon--big");
    expect(hasClass).toEqual(true);
    expect(iconEl.classList.length).toEqual(2);
  });

  it('video play icon font name should be "icon-play"', () => {
    let fixture: ComponentFixture<TestVideoWithoutAltText> = TestBed.createComponent(TestVideoWithoutAltText);
    let component: TestVideoWithoutAltText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    let iconSvgEl: HTMLElement = <HTMLElement>anchorEl.querySelectorAll('ae-icon > div > svg > use')[0];
    expect(iconSvgEl).toBeDefined();
    expect(iconSvgEl.getAttribute('xlink:href')).toEqual('#icon-play');
  });

  it('alt text should not be render when "alt" attribute is not supplied ', () => {
    let fixture: ComponentFixture<TestVideoWithoutAltText> = TestBed.createComponent(TestVideoWithoutAltText);
    let component: TestVideoWithoutAltText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    let imgEl: HTMLElement = anchorEl.querySelectorAll('img')[0];
    expect(imgEl.hasAttribute("alt")).not.toBe(true);
  });

  it('alt text should be render when "alt" attribute is supplied ', () => {
    let fixture: ComponentFixture<TestVideoWithAltText> = TestBed.createComponent(TestVideoWithAltText);
    let component: TestVideoWithAltText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    let imgEl: HTMLElement = anchorEl.querySelectorAll('img')[0];
    expect(imgEl.hasAttribute("alt")).toBe(true);
    expect(imgEl.getAttribute("alt")).toEqual("Hello this is atlas welcome video");
  });

  it('link text should be displayed when video style is link', () => {
    let fixture: ComponentFixture<TestVideoWithLinkText> = TestBed.createComponent(TestVideoWithLinkText);
    let component: TestVideoWithLinkText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    component.changeLinkText("This is Test Link");
    fixture.detectChanges();
    let spanEl: HTMLElement = <HTMLElement>anchorEl.querySelectorAll('span.link-text')[0];
    expect(spanEl).toBeDefined();
    expect(spanEl.innerText).toEqual("This is Test Link");
    let imgEl: HTMLElement = anchorEl.querySelectorAll('img')[0];
    expect(imgEl).toBeUndefined();
    let iconContainerEl: HTMLElement = <HTMLElement>anchorEl.querySelectorAll('div.video__play')[0];
    expect(iconContainerEl).toBeUndefined();
  });

  it('link text should be supplied video url when linktext is not supplied', async(() => {
    let fixture: ComponentFixture<TestVideoWithLinkText> = TestBed.createComponent(TestVideoWithLinkText);
    let component: TestVideoWithLinkText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    let spanEl: HTMLElement = <HTMLElement>anchorEl.querySelectorAll('span.link-text')[0];
    expect(spanEl).toBeDefined();
    expect(spanEl.innerText).toEqual("https://youtu.be/KhrfbFnfNqs");
  }));

  it('link text should be supplied video url when linktext is not supplied and autoplay is true', async(() => {
    let fixture: ComponentFixture<TestVideoWithLinkText> = TestBed.createComponent(TestVideoWithLinkText);
    let component: TestVideoWithLinkText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    component.changeAutoplay(true);
    fixture.detectChanges();
    let spanEl: HTMLElement = <HTMLElement>anchorEl.querySelectorAll('span.link-text')[0];
    expect(spanEl).toBeDefined();
    expect(spanEl.innerText).toEqual("https://youtu.be/KhrfbFnfNqs");
  }));

  it('link should open youtube url in new tab', async(() => {
    spyOn(window, 'open').and.callFake(function () {
      return true;
    });
    let fixture: ComponentFixture<TestVideoWithLinkText> = TestBed.createComponent(TestVideoWithLinkText);
    let component: TestVideoWithLinkText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    fixture.detectChanges();
    //dispatchEvent(anchorEl, 'click');

    expect(window.open).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith('https://youtu.be/KhrfbFnfNqs', '_blank');
  }));

  it('link should open youtube url with autoplay in new tab ', async(() => {
    spyOn(window, 'open').and.callFake(function () {
      return true;
    });
    let fixture: ComponentFixture<TestVideoWithLinkText> = TestBed.createComponent(TestVideoWithLinkText);
    let component: TestVideoWithLinkText = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    component.changeAutoplay(true);
    fixture.detectChanges();
    //dispatchEvent(anchorEl, 'click');

    expect(window.open).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith('https://youtu.be/KhrfbFnfNqs?autoplay=1', '_blank');
  }));

  it('click on thumbnail should open popup', async(() => {
    let fixture: ComponentFixture<TestVideoWithThumbnail> = TestBed.createComponent(TestVideoWithThumbnail);
    let component: TestVideoWithThumbnail = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    component.changeAutoplay(true);
    fixture.detectChanges();

    //dispatchEvent(anchorEl, 'click');
    fixture.detectChanges();
    let modalContainerEl = fixture.debugElement.query(By.css('div.popup-container')).nativeElement;
    expect(modalContainerEl).toBeDefined();
  }));

  it('iframe should be render properly with supplied video url with autoplay enabled', async(() => {
    let fixture: ComponentFixture<TestVideoWithThumbnail> = TestBed.createComponent(TestVideoWithThumbnail);
    let component: TestVideoWithThumbnail = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    component.changeAutoplay(true);
    fixture.detectChanges();

    //dispatchEvent(anchorEl, 'click');
    fixture.detectChanges();
    let iframeEl: HTMLElement = fixture.debugElement.query(By.css('div.popup-container > ae-modal-dialog div.dialog > div.modal-dialog-body > iframe')).nativeElement;

    expect(iframeEl.hasAttribute('allowfullscreen')).toBe(true);
    expect(iframeEl.getAttribute('frameborder')).toBe('0');
    expect(iframeEl.getAttribute('width')).toBe('640');
    expect(iframeEl.getAttribute('height')).toBe('390');
    expect(iframeEl.getAttribute('src')).toBe('https://youtu.be/KhrfbFnfNqs?autoplay=1');
  }));

  it('iframe should be render properly with supplied video url without autoplay enabled', async(() => {
    let fixture: ComponentFixture<TestVideoWithThumbnail> = TestBed.createComponent(TestVideoWithThumbnail);
    let component: TestVideoWithThumbnail = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    component.changeAutoplay(false);
    fixture.detectChanges();

    //dispatchEvent(anchorEl, 'click');
    fixture.detectChanges();
    let iframeEl: HTMLElement = fixture.debugElement.query(By.css('div.popup-container > ae-modal-dialog div.dialog > div.modal-dialog-body > iframe')).nativeElement;

    expect(iframeEl.getAttribute('src')).toBe('https://youtu.be/KhrfbFnfNqs');
  }));

  it('modal popup should be closed when we click on close  button', async(() => {
    let fixture: ComponentFixture<TestVideoWithThumbnail> = TestBed.createComponent(TestVideoWithThumbnail);
    let component: TestVideoWithThumbnail = fixture.componentInstance;
    let anchorEl: HTMLElement = fixture.debugElement.query(By.css('a')).nativeElement;
    component.changeAutoplay(false);
    fixture.detectChanges();

    //dispatchEvent(anchorEl, 'click');
    fixture.detectChanges();
    let closeBtnEl: HTMLElement = fixture.debugElement.query(By.css('div.popup-container > ae-modal-dialog > div.dialog')).nativeElement;
    let gg = closeBtnEl.querySelector('.button--close');
    //dispatchEvent(gg, 'click');
    fixture.detectChanges();
    let modalContainerEl = fixture.debugElement.query(By.css('div.popup-container'));
    expect(modalContainerEl).toBeNull();
  }));
});


/**
 * Mock components for testing
 * 
 * @class BaseTestVideo
 */
class BaseTestVideo {
  videoSrc: string = "https://youtu.be/KhrfbFnfNqs";
  id: string = "videotest";
  name: string = "videotest";
  videoSyle: AeVideoStyleMode = AeVideoStyleMode.Thumbnail;
  linkText: string;
}
@Component({
  template: `
  <ae-video></ae-video>`})
class TestEmptyVideo extends BaseTestVideo { }

@Component({
  template: `
  <ae-video [id]="id"></ae-video>`})
class TestVideoWithOnlyId extends BaseTestVideo { }

@Component({
  template: `
  <ae-video [id]="id" [name]="name"></ae-video>`})
class TestVideoWithoutVideoUrl extends BaseTestVideo { }

@Component({
  template: `
  <ae-video [id]="id" [name]="name" 
[src]="videoSrc" 
[thumbnailSrc]="'https://unsplash.it/640/360'"
[videoStyle]="videoSyle"></ae-video>`})
class TestVideoWithoutAltText extends BaseTestVideo { }

@Component({
  template: `
  <ae-video [id]="id" [name]="name" 
[src]="videoSrc" 
[videoStyle]="videoSyle"></ae-video>`})
class TestVideoWithoutThumbnail extends BaseTestVideo { }

@Component({
  template: `
  <ae-video [id]="id" [name]="name" 
[src]="videoSrc" 
[alt]="'Hello this is atlas welcome video'"
[thumbnailSrc]="'https://unsplash.it/640/360'"
[videoStyle]="videoSyle"></ae-video>`})
class TestVideoWithAltText extends BaseTestVideo { }

@Component({
  template: `
  <ae-video [id]="id" [name]="name" 
[src]="videoSrc" [linkText]="linkText" [thumbnailSrc]="thumbnailSrc" [mode]="playMode" [autoplay]="autoplay"
[videoStyle]="videoSyle"></ae-video>`})
class TestVideoWithLinkText extends BaseTestVideo {
  thumbnailSrc: string;
  playMode: AeVideoPlayMode;
  autoplay: boolean = false;
  constructor() {
    super();
    this.videoSyle = AeVideoStyleMode.Link;
    //this.linkText = "This is Test Link";
    this.playMode = AeVideoPlayMode.Fullscreen;
  }

  changeAutoplay(val) {
    this.autoplay = val;
  }

  changeLinkText(val) {
    this.linkText = val;
  }
}

@Component({
  template: `
  <ae-video [id]="id" [name]="name" 
[src]="videoSrc" [thumbnailSrc]="thumbnailSrc" [mode]="playMode" [autoplay]="autoplay"
[videoStyle]="videoSyle"></ae-video>`})
class TestVideoWithThumbnail extends BaseTestVideo {
  thumbnailSrc: string;
  playMode: AeVideoPlayMode;
  autoplay: boolean = false;
  constructor() {
    super();
    this.videoSyle = AeVideoStyleMode.Thumbnail;
    this.playMode = AeVideoPlayMode.Popup;
    this.autoplay = true;
  }

  changeAutoplay(val) {
    this.autoplay = val;
  }
}