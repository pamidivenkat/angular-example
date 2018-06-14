import { Directive, Input, Output, EventEmitter, ElementRef, HostListener, ViewContainerRef, Renderer2 } from '@angular/core';
import { AeDragDropService } from "../services/ae-drag-drop.service";
import { AeDragVm } from "../common/models/ae-drag-vm";
import { isNullOrUndefined } from "util";
import { AeDataTransfer } from "../common/models/data-transfer";
import { StringHelper } from "../../../shared/helpers/string-helper";

@Directive({
  selector: '[aeDraggable]',
  host: {
    '[draggable]': 'applyDrag'
  },
})
export class AeDraggableDirective<T> {

  // Private fields
  private _aeDraggableContext: AeDragVm<T>;
  private _handle: any;
  private _applyDrag: boolean = true;
  // End of Private Fields

  // Public Properties
  @Input('applyDrag')
  get applyDrag() {
    return this._applyDrag;
  }
  set applyDrag(val: boolean) {
    this._applyDrag = val;
  }

  @Input('aeDraggable')
  set aeDraggableContext(val: AeDragVm<T>) {
    this._aeDraggableContext = val;
  }
  get aeDraggableContext() {
    return this._aeDraggableContext;
  }

  //End of Public Properties

  // Output Properties
  @Output() onDragStart: EventEmitter<AeDataTransfer<any>> = new EventEmitter();

  @Output() onDragEnd: EventEmitter<any> = new EventEmitter();

  @Output() onDrag: EventEmitter<any> = new EventEmitter();
  // End of Output properties

  // Constructor
  constructor(private _elementRef: ElementRef
    , private _renderer: Renderer2
    , private _viewContainerRef: ViewContainerRef
    , private _dragDropService: AeDragDropService) { }
  // End of constructor

  // Host Listner
  @HostListener('dragstart', ['$event'])
  dragStart(event: DragEvent) {
    event.stopPropagation();
    let context: AeDataTransfer<any> = {
      identifier: this._aeDraggableContext ? this._aeDraggableContext.identifier : null,
      model: this._aeDraggableContext ? this._aeDraggableContext.model : null
    };
    if (this._aeDraggableContext && this._aeDraggableContext.canDrag(context)) {

      if (!StringHelper.isNullOrUndefinedOrEmpty(this._aeDraggableContext.dragHandle)) {
        if (!isNullOrUndefined(this._handle) &&
          this.matches(this._handle, this._aeDraggableContext.dragHandle) &&
          !this._aeDraggableContext.canDragHandleContainer) {
          event.dataTransfer.setData('text/plain', 'handle');
        } else if (!this._aeDraggableContext.canDragHandleContainer) {
          event.preventDefault();
          return;
        }
      }

      this._renderer.addClass(this._elementRef.nativeElement, 'ae-drag-start');
      if (!isNullOrUndefined(this._aeDraggableContext.dragEffect)) {
        event.dataTransfer.effectAllowed = this._aeDraggableContext.dragEffect;
      }
      event.dataTransfer.setData('context', JSON.stringify(context));
      this.onDragStart.emit(context);
    } else {
      return false;
    }
  }

  @HostListener('drag', ['$event'])
  drag(event) {
    this.onDrag.emit(event);
  }

  @HostListener('dragend', ['$event'])
  dragEnd(event) {
    this._renderer.removeClass(this._elementRef.nativeElement, 'ae-drag-enter');
    this._renderer.removeClass(this._elementRef.nativeElement, 'ae-drag-start');
    this.onDragEnd.emit(event);
  }

  @HostListener('mouseover', ['$event'])
  mouseover(event) {
    this._handle = event.target;
  }

  @HostListener('mouseleave', ['$event'])
  mouseleave(event) {
    this._handle = null;
  }
  // End of Host Listner

  // Private Methods
  private _verifyAndUpdateDraggableAttribute(val: AeDragVm<T>) {
    if (val.canChildrenDraggableIndependently) {
    }
  }

  private _allowDrag(): boolean {
    if (this._aeDraggableContext && !StringHelper.isNullOrUndefinedOrEmpty(this._aeDraggableContext.dragHandle) &&
      !isNullOrUndefined(this._handle)) {
      return this.matches(this._handle, this._aeDraggableContext.dragHandle);
    } else {
      return true;
    }
  }
  // End of Private Methods

  public matches(element, selector: string): boolean {
    let p = Element.prototype;
    let f = p['matches'] || p.webkitMatchesSelector || p['mozMatchesSelector'] || p.msMatchesSelector || function (s) {
      return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
    };
    return f.call(element, selector);
  }
}
