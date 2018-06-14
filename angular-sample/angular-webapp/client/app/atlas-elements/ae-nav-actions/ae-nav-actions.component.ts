import { retry } from 'rxjs/operator/retry';
import { isNullOrUndefined } from 'util';
import { AeNavActionsOption } from '../common/models/ae-nav-actions-options';
import { AeClassStyle } from '../common/ae-class-style.enum';
import { BaseElement } from '../common/base-element';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { Tristate } from "../common/tristate.enum";


/**
 * Nav actions component to display list of buttons, it accepts array of objects with display text of buttons, command and disabled options
 * 
 * @export
 * @class AeNavActionsComponent
 * @extends {BaseElement}
 * @implements {OnInit}
 * @template T 
 */
@Component({
    selector: 'ae-nav-actions',
    templateUrl: './ae-nav-actions.component.html',
    styleUrls: ['./ae-nav-actions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AeNavActionsComponent<T> extends BaseElement implements OnInit {

    // Private Fields
    private _classStyle: AeClassStyle;
    private _options: AeNavActionsOption<T>[] = [];
    private _optionsOpen: boolean = false;
    // End of Private Fields

    // Public Properties
    /**
   * Member to add optional class to button
   * @type {AeClassStyle}
   * @memberOf AeNavActionsComponent
   */
    @Input('class')
    get navListPosition() {
        return this._classStyle;
    }
    set navListPosition(value: AeClassStyle) {
        this._classStyle = value;
    }

    /**
  * Returns boolean value to add button--actions--left class to button
  * @returns {boolean} 
  * 
  * @memberOf AeNavActionsComponent
  */
    isLeft(): boolean {
        return this._classStyle === AeClassStyle.TextLeft;
    }

    /**
    * Member to add buttons under nav actions, this will accept array of objects.
    * 
    * @type {AeNavActionsOption<T>[]}
    * @memberOf AeNavActionsComponent
    */
    @Input("options")
    get listOptions() {
        return this._options;
    }
    set listOptions(opts: AeNavActionsOption<T>[]) {
        this._options = opts;
    }

    get defaultOption() {
        return !isNullOrUndefined(this._options) ? this._options[0] : null;
    }

    /**
     * Trigger click event on dots of the nav actions
     * 
     * @type {EventEmitter<any>}
     * @memberOf AeNavActionsComponent
     */
    @Output()
    aeClick: EventEmitter<any> = new EventEmitter<any>();
    // Public Properties

    // Constructor
    /**
     *
     */
    constructor(private _elementRef: ElementRef) {
        super();
    }
    // End of Constructor

    // Private Methods
    _onClick(event: MouseEvent) {
        if (this.isEnabled) {
            this._optionsOpen = !this._optionsOpen;
            this.aeClick.emit(event);
        }

    }

    /**
     * Triggers click events of nav actions whar are all in the options
     * 
     * @private
     * @param {any} event 
     * @param {any} option 
     * 
     * @return
     * @memberOf AeNavActionsComponent
     */
    optionClick(event: MouseEvent, option: AeNavActionsOption<T>) {
        if (option.Command) {
            // single option click emit
            if (!this.isActionsList()) { 
                this.aeClick.emit(event);
            }
            option.Command.next(null);
        }
        if (this.isActionsList()) {
            this._optionsOpen = !this._optionsOpen;
        }

    }

    isEnabled(option: Tristate): boolean {
        return option === Tristate.True;
    }
    isBtnEnabled(): boolean {
        if (!isNullOrUndefined(this._options) && this._options.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    // End of Private Methods

    // Public Methods
    /**
     * 
     * Member to display nav actions
     * @type {boolean}
     * 
     * @return boolean value to display nav actions or not
     * @memberOf AeNavActionsComponent
     */

    viewOptions() {
        return this._optionsOpen;
    }

    isActionsList() {
        return !isNullOrUndefined(this._options) && (this._options.length > 1);
    }

    @HostListener('document:click', ['$event'])
    public onClick(event: MouseEvent) {
        let clickedThis = this._elementRef.nativeElement.contains(event.target);
        if (!clickedThis) {
            this._optionsOpen = false;
        }
    }

    ngOnInit() {
    }
    // End of Public Methods

}
