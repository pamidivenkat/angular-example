import { AeModalDialogComponent } from '../ae-modal-dialog/ae-modal-dialog.component';
import {
  animate,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  state,
  style,
  transition,
  trigger,
  ViewEncapsulation
} from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ae-slideout',
  templateUrl: './ae-slideout.component.html',
  styleUrls: ['./ae-slideout.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('collapsed', style({
        transform: 'translate3d(100%, 0px, 0px)'
      })),
      state('expanded', style({
        transform: 'translate3d(0px, 0px, 0px)'
      })),
      transition('collapsed => expanded', animate('400ms ease-in-out')),
      transition('expanded => collapsed', animate('400ms ease-in-out'))
    ])
  ],
  encapsulation: ViewEncapsulation.None
})
export class AeSlideOutComponent extends AeModalDialogComponent {
  // Private Fields
  /**
   * Member to close/open slider
   *
   * @private
   *
   * @memberOf AeSlideOutComponent
   */
  private _modelState = 'collapsed';
  private _notification: boolean = false;
  private _sliderBig: boolean = false;
  // End of Private Fields

  // Public properties
  @Input('notification')
  get notification() {
    return this._notification;
  }
  set notification(val: boolean) {
    this._notification = val;
  }

  @Input('modelState')
  get modelState() {
    return this._modelState;
  }
  set modelState(val: string) {
    this._modelState = val;
  }


  @Input('sliderBig')
  get sPanelBig() {
    return this._sliderBig;
  }
  set sPanelBig(val: boolean) {
    this._sliderBig = val;
  }
  // End of Public properties

  // Constructor
  constructor(element: ElementRef) {
    super(element);
    this.draggable = false;
  }
  // End of constructor

  // Private methods

  /**
   * Member to close slider and output the state
   *
   * @private
   *
   * @memberOf AeSlideOutComponent
   */
  closeSlider = (event): void => {
    let tag = document.getElementById('main-container');
    tag.classList.remove('mask-on');
    if (this._notification) {
      this._modelState = 'collapsed';
      this.cancel.emit('closed');
    }
  }

  /**
   * Member to know the slider is opened or not
   *
   * @private
   *
   * @memberOf AeSlideOutComponent
   */
  isExpanded = (): boolean => {
    return this._modelState === 'expanded';
  }
  // End of private methods
}
