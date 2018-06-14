import { Client } from '_debugger';
import { AeIconSize } from '../common/ae-icon-size.enum';
import { BaseElement } from '../common/base-element';
import { ModalDialogSize } from '../common/modal-dialog-size.enum';
import { AeClassStyle } from '../common/ae-class-style.enum';
import {
  animate,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  Renderer,
  style,
  transition,
  trigger,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'ae-modal-dialog',
  templateUrl: './ae-modal-dialog.component.html',
  styleUrls: ['./ae-modal-dialog.component.scss'], animations: [
    trigger('dialog', [
      transition('void => *', [
        style({ transform: 'scale3d(.3, .3, .3)' }),
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(.0, .0, .0)' }))
      ])
    ])
  ],
  encapsulation: ViewEncapsulation.None
})
export class AeModalDialogComponent extends BaseElement {
  // Private Fields
  /**
   * member to show/hide the modal dialog
   *
   * @private
   * @type {boolean}
   * @memberOf AeModalDialogComponent
   */
  private _visible: boolean;


  /**
   * member to show/hide the modal dialog close button
   *
   * @private
   * @type {boolean}
   * @memberOf AeModalDialogComponent
   */
  private _closable: boolean;


  /**
   * Member to enable/disable dragging
   *
   * @private
   * @type {boolean}
   * @memberOf AeModalDialogComponent
   */
  private _draggable: boolean;


  /**
   * member to specify the size of the dialog
   *
   * @private
   * @type {ModalDialogSize}
   * @memberOf AeModalDialogComponent
   */
  private _moadlSize: ModalDialogSize;


  /**
   * member to initialize top start position of dialog
   *
   * @private
   * @type {number}
   * @memberOf AeModalDialogComponent
   */
  private _topStartPosition: number;


  /**
   * member to initialize left start position of dialog
   *
   * @private
   * @type {number}
   * @memberOf AeModalDialogComponent
   */
  private _leftStartPosition: number;


  /**
   * member to enable/disable dragging of dialog
   *
   * @private
   * @type {boolean}
   * @memberOf AeModalDialogComponent
   */
  private _allowDrag: boolean;

  /**
   * member to style the close button
   *
   * @private
   * @type {AeClassStyle}
   * @memberOf AeModalDialogComponent
   */
  private _modalClose: AeClassStyle = AeClassStyle.ModalClose;



  /**
   * Member to specify size thr class
   *
   * @private
   * @type {string}
   * @memberOf AeModalDialogComponent
   */
  private _class: string;

  // End of Private Fields

  // Public properties

  /**
   * Input field to specify the value to show/hide dialog
   *
   * @readonly
   *
   * @memberOf AeModalDialogComponent
   */
  @Input('visible')
  get visible() { return this._visible; }
  set visible(val: boolean) { this._visible = val; }


  /**
   * Input field to specify to show/hide close button in the dialog
   *
   * @readonly
   *
   * @memberOf AeModalDialogComponent
   */
  @Input('closable')
  get closable() { return this._closable; }
  set closable(val: boolean) { this._closable = val; }

  @Input('class')
  get modalClass() { return this._class; }
  set modalClass(val: string) { this._class = val; }

  /**
   * Input field to enable/disable dragging
   *
   * @readonly
   *
   * @memberOf AeModalDialogComponent
   */
  @Input('draggable')
  get draggable() { return this._draggable; }
  set draggable(val: boolean) {
    this._draggable = val;
  }

  /**
   * Input field to specify the size of the dialog
   *
   * @readonly
   *
   * @memberOf AeModalDialogComponent
   */
  @Input('size')
  get size() { return this._moadlSize; }
  set size(val: ModalDialogSize) { this._moadlSize = val; }

  // End of Public properties

  // Public Output bindings
  @Output() cancel: EventEmitter<string> = new EventEmitter<string>();
  // End of Public Output bindings

  // Constructor
  constructor(public element: ElementRef) {
    super();
    this._visible = false;
    this._closable = true;
    this._draggable = true;
    this._moadlSize = ModalDialogSize.default;
    this._topStartPosition = 0;
    this._leftStartPosition = 0;
    this.element.nativeElement.style.top = this._topStartPosition + 'px';
  }
  // End of constructor

  // Private methods
  /**
   * methiod to return size class based on the size provided through size input
   * returns css class;
   * @returns {string}   *
   * @memberOf AeModalDialogComponent
   */
  getSizeClass(): string {
    let _class = '';
    switch (this._moadlSize) {
      case ModalDialogSize.small:
        _class = 'modal-sm';
        break;

      case ModalDialogSize.large:
        _class = 'modal-lg';
        break;

    }
    return _class;
  }


  /**
   * Method to determine whether to show/hide dialog based on input specified through 'visible'
   *
   * @returns {boolean}
   *
   * @memberOf AeModalDialogComponent
   */
  isVisible(): boolean {
    return this._visible;
  }

  /**
   * Method to determine whether to show/hide close botton based on input specified through 'closable'
   *
   * @returns {boolean}
   *
   * @memberOf AeModalDialogComponent
   */
  isClosable(): boolean {
    return this._closable;
  }


  /**
   * Event called when  dialog closed
   * Notify the dialog close event
   *
   * @memberOf AeModalDialogComponent
   */
  cancelEvent() {
    this._visible = false;
    this.cancel.emit('close');
  }

  /**
   * Member to determine modal is draggable or not
   * returns {boolean}
   * @private
   *
   * @memberOf AeModalDialogComponent
   */
  isDraggableModal = (): boolean => {
    return this._draggable;
  }

  @HostListener('dragstart', ['$event'])
  private _onDragStart(event: DragEvent) {
    if (this.isDraggableModal()) {
      this._allowDrag = true;
      this._topStartPosition = event.clientY - this.element.nativeElement.style.top.replace('px', '');
      this._leftStartPosition = event.clientX - this.element.nativeElement.style.left.replace('px', '');
    }
  }


  @HostListener('dragover', ['$event'])
  private _onDragOver = (event: DragEvent): boolean => {
    return false;
  }


  @HostListener('drop', ['$event'])
  private _onDrop = (event: DragEvent): boolean => {
    if (this.draggable && this._allowDrag) {
      this.element.nativeElement.style.top = (event.clientY - this._topStartPosition) + 'px';
      this.element.nativeElement.style.left = (event.clientX - this._leftStartPosition) + 'px';
    }
    this._allowDrag = false;
    return false;
  }
  iconSmall: AeIconSize = AeIconSize.small;
  /*
  End of dragging modal dialog.
  */
  // End of private methods
}
