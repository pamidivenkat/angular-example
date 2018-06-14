import { Directive, Output, Input, OnInit, EventEmitter } from '@angular/core';
import { AeCkeditorComponent } from './ae-ckeditor/ae-ckeditor.component';

@Directive({
  selector: '[appAeCkbutton]'
})
export class AeCkbuttonDirective implements OnInit {

  @Output() click = new EventEmitter();
  @Input() label: string;
  @Input() command: string;
  @Input() toolbar: string;
  @Input() name: string;
  @Input() icon: string;

  public initialize(editor: AeCkeditorComponent) {

    editor.instance.addCommand(this.command, {
      exec: (evt: any) => {
        this.click.emit(evt);
      }
    });

    editor.instance.ui.addButton(this.name, {
      label: this.label,
      command: this.command,
      toolbar: this.toolbar,
      icon: this.icon
    });

  }

  ngOnInit(): void {
    if (!this.name) throw new Error('Attribute \'name\' is required on <ckbutton>');
    if (!this.command) throw new Error('Attribute \'command\' is required on <ckbutton>');
  }

}
