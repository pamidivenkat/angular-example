import { Directive, ElementRef, Output, EventEmitter, Input, HostListener, Renderer2 } from '@angular/core';
import { AeDragDropService } from "../services/ae-drag-drop.service";
import { AeDropVm } from "../common/models/ae-drop-vm";
import { isNullOrUndefined } from "util";
import { AeDataTransfer } from "../common/models/data-transfer";

@Directive({
  selector: '[aeDroppable]'
})
export class AeDroppableDirective<T> {

  // Private Fields
  private _aeDroppableContext: AeDropVm<T>;
  private _dragCounter: number;
  // End of Private Fields

  // Public Properties
  @Input('aeDroppable')
  set aeDroppableContext(val: AeDropVm<T>) {
    this._aeDroppableContext = val;
  }
  get aeDroppableContext() {
    return this._aeDroppableContext;
  }
 
  // End of Public Properties

  // Output Properties
  @Output() onDragEnter: EventEmitter<any> = new EventEmitter();

  @Output() onDragLeave: EventEmitter<any> = new EventEmitter();

  @Output() onDrop: EventEmitter<AeDataTransfer<any>> = new EventEmitter();

  @Output() onDragOver: EventEmitter<any> = new EventEmitter();
  // End of Output Properties

  // Constructor
  constructor(private _elementRef: ElementRef, private _render: Renderer2, private _dragDropService: AeDragDropService) {
  }
  //End of Constructor

  // Host Listners
  @HostListener('drop', ['$event'])
  drop(event: DragEvent) {
    if (event.stopPropagation) {
      event.stopPropagation(); // stops the browser from redirecting.
    }
    let context: AeDataTransfer<any> = JSON.parse(event.dataTransfer.getData('context'));
    if (this._allowDrop(context) || this._aeDroppableContext.canDrop(context)) {
      this.onDrop.emit(context);
    }
    return false;
  }

  @HostListener('dragenter', ['$event'])
  dragEnter(event) {
    event.stopPropagation();
    if (!isNullOrUndefined(this._aeDroppableContext.dropEffect)) {
      event.dataTransfer.dropEffect = this._aeDroppableContext.dropEffect;
    }
    this.onDragEnter.emit(event);

    return true;
  }

  @HostListener('dragleave', ['$event'])
  dragLeave(event) {
    event.stopPropagation();
    this.onDragLeave.emit(event);
    return true;
  }

  @HostListener('dragover', ['$event'])
  dragOver(event) {
    if (event.preventDefault) {
      event.preventDefault(); // Necessary. Allows us to drop.
    }
    if (event.stopPropagation) {
      event.stopPropagation(); // stops the browser from redirecting.
    }
    this.onDragOver.emit(event);
    return false;
  }
  // End of Host Listners

  // Private Methods
  private _allowDrop(context: AeDataTransfer<any>): boolean {
    if (!isNullOrUndefined(this._aeDroppableContext.identifiers)) {
      let ident = this._aeDroppableContext.identifiers.find((identifier) => identifier === context.identifier);
      if (!isNullOrUndefined(ident)) {
        return true;
      }
    }
    return false;
  }
  // End of Private Methods

}
