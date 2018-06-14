import { Directive, AfterContentInit, QueryList, ContentChildren, Input } from '@angular/core';
import { AeCkbuttonDirective } from './ae-ckbutton.directive';
import { AeCkeditorComponent } from './ae-ckeditor/ae-ckeditor.component';

@Directive({
  selector: '[appAeCkgroup]'
})
export class AeCkgroupDirective implements AfterContentInit {

  @Input() name: string;
  @Input() previous:any;
  @Input() subgroupOf:string;
  @ContentChildren(AeCkbuttonDirective) toolbarButtons: QueryList<AeCkbuttonDirective>;

  ngAfterContentInit() {
    // Reconfigure each button's toolbar property within ckgroup to hold its parent's name
    this.toolbarButtons.forEach((button) => button.toolbar = this.name);
  }

  public initialize(editor:AeCkeditorComponent) {
    editor.instance.ui.addToolbarGroup(this.name, this.previous, this.subgroupOf);
    // Initialize each button within ckgroup
    this.toolbarButtons.forEach((button) => {
      button.initialize(editor);
    });
  }

}
