import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AeCkeditorComponent } from './ae-ckeditor/ae-ckeditor.component';
import { AeCkgroupDirective } from './ae-ckgroup.directive';
import { AeCkbuttonDirective } from './ae-ckbutton.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AeCkeditorComponent
    , AeCkgroupDirective
    , AeCkbuttonDirective
  ],
  exports: [
    AeCkeditorComponent
    , AeCkgroupDirective
    , AeCkbuttonDirective
  ]
})
export class CkEditorModule { }
