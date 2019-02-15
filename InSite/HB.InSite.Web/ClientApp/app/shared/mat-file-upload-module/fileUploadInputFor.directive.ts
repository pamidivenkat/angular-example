import {
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
//import { NativeScriptInterfaceService } from '../services/native-script-interface.service';

/**
 * A material design file upload queue component.
 */
@Directive({
    selector: 'input[fileUploadInputFor], div[fileUploadInputFor]',
  })
  export class FileUploadInputFor  {


    public _queue: any = null;
    private _queueFiles: Array<any>;
    private _element: HTMLElement;
    @Output() public onFileSelected: EventEmitter<File[]> = new EventEmitter<File[]>();

    constructor(public element: ElementRef
        //private nsInterfaceService: NativeScriptInterfaceService
    ) {
        this._element = this.element.nativeElement;
        /*
        this.nsInterfaceService.nsEventLister({ type: 'selectedFile', object: this }, function (that, file) {
            that.onFileSelected.emit([file]);
            that._queue.add(file);
            console.log('selectedFile', JSON.stringify(file));
        },
            function (error) { console.log('error:' + error) }
        );
        */
    }

    @Input('files')
    set files(value: Array<any>) {
        this._queueFiles = value;
    }

    @Input('fileUploadInputFor')
    set fileUploadQueue(value: any) {
        this._queue = value;
        this._queue.files = this._queueFiles;
    }

    @HostListener('change', [ '$event' ])
    public onChange(event: any): any {
        let files, nativeElement;
        if(event.target.files) {
            nativeElement = event.target;
        }
        else {
            nativeElement = this.element.nativeElement;
        }
        files = nativeElement.files;
        this.onFileSelected.emit(files);

        for (var i = 0; i < files.length; i++) {
            this._queue.add(files[i]);
        }
        nativeElement.value = '';
    }

    @HostListener('drop', [ '$event' ])
    public onDrop(event: any): any {
      let files = event.dataTransfer.files;
      this.onFileSelected.emit(files);

      for (var i = 0; i < files.length; i++) {
        this._queue.add(files[i]);
      }
      event.preventDefault();
      event.stopPropagation();
      this.element.nativeElement.value = '';
    }

    @HostListener('dragover', [ '$event' ])
    public onDropOver(event: any): any {
        event.preventDefault();
    }

  }