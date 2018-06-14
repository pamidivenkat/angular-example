import { Injectable, EventEmitter } from '@angular/core';
import { AeDataTransfer } from '../../ae-drag-drop/common/models/data-transfer';

@Injectable()
export class AeOrgChartService {

  // Private Fields
  private _dragStartEvent: EventEmitter<AeDataTransfer<any>>;
  private _dropStartEvent: EventEmitter<AeDataTransfer<any>>;
  private _mouseMoveEvent: EventEmitter<any>;
  private _mouseOutEvent: EventEmitter<any>;
  private _rootToggleEvent: EventEmitter<any>;
  // End of Private Fields

  // Public properties
  get dragStartEvent() {
    return this._dragStartEvent;
  }

  get dropStartEvent() {
    return this._dropStartEvent;
  }

  get mouseMoveEvent() {
    return this._mouseMoveEvent;
  }

  get mouseOutEvent() {
    return this._mouseOutEvent;
  }

  get rootToggleEvent() {
    return this._rootToggleEvent;
  }
  // End of Public properties

  constructor() {
    this._dragStartEvent = new EventEmitter();
    this._dropStartEvent = new EventEmitter();
    this._mouseOutEvent = new EventEmitter();
    this._mouseMoveEvent = new EventEmitter();
    this._rootToggleEvent = new EventEmitter();
  }

}
