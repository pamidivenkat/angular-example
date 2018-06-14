/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { asNativeElements, CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { AeFileComponent } from './ae-file.component';

describe('AeFileComponent', () => {
  let component: AeFileComponent;
  let fixture: ComponentFixture<AeFileComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AeFileComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
          //providers: [{provide: FileUploadService, useValue: MockFileUploadService }],
           })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AeFileComponent);
    component = fixture.componentInstance;
    component.name = 'testupload';
    component.id = 'testupload';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

   it('should id attribute has provided value', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.getAttribute('id')).toEqual('testupload');
  });

  it('should name attribute has provided value', () => {
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.getAttribute('name')).toEqual('testupload');
  });

 xit('should be able to upload multiple files  if [multiple] = true', () => {
    component.multiple = true;
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('.input')).nativeElement;
   expect(inputEl.getAttribute('multiple')).toEqual('multiple');
  });

 xit('should be able to capture photos if  [cameraMode] = true', () => {
    component.cameraMode = true;
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('.input')).nativeElement;
   expect(inputEl.hasAttribute('capture')).toEqual(true);
  });

 xit('should be able to drag and drop files if  [droppable] = true', () => {
    component.droppable = true;
    fixture.detectChanges();
    let inputEl: HTMLElement = fixture.debugElement.query(By.css('label.drag-drop')).nativeElement;
   expect(inputEl).toBeTruthy();
  });
});


class MockFileUploadService {

}
