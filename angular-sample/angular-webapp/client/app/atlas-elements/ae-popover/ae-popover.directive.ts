import { createPopoverMessageVm } from '../common/models/popover-message-vm';
import { MessengerService } from '../../shared/services/messenger.service';
import { PopoverVm } from '../common/models/popover-vm';
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[aePopover]'
})
export class AePopoverDirective {

  // Private Fields 
  private _element: ElementRef;
  private _popOverVm: PopoverVm<any>;
  private _messenger: MessengerService;
  private _popOverAction: 'hover' | 'click';
  // End Of Private Fields

  // Public Properties
  @Input('popOverVm')
  set popOverVm(val: PopoverVm<any>) {
    this._popOverVm = val;
  }
  get popOverVm() {
    return this._popOverVm;
  }
  

  @Input('popOverAction')
  set popOverAction(val: 'hover' | 'click') {
    this._popOverAction = val;
  }
  get popOverAction() {
    return this._popOverAction;
  }
  
  // End Of Public Properties

  // Constructors
  constructor(element: ElementRef, messenger: MessengerService) {
    this._element = element;
    this._messenger = messenger;
  }
  // End Of Constructors

  // Public Methods
  @HostListener('mouseenter')
  onMouseEnter() {
    if (this._popOverAction === 'hover' &&  this._popOverVm) {
      this._popOverVm.sourceElement = this._element;
      this._messenger.publish('popOver', createPopoverMessageVm(this._popOverVm));
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this._popOverAction === 'hover'  &&  this._popOverVm) {
      this._messenger.publish('popOver', null);
    }
  }

  @HostListener('click', ['$event'])
  onclick(event: MouseEvent) {
    event.stopPropagation();
    if (this._popOverAction === 'click'  &&  this._popOverVm) {
      this._popOverVm.sourceElement = this._element;
      this._messenger.publish('popOver', createPopoverMessageVm(this._popOverVm));
    }
    return false;
  }


  // End Of Public Methods

}
