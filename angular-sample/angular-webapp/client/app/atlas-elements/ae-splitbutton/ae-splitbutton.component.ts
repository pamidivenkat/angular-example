import { AeClassStyle } from '../common/ae-class-style.enum';
import { AeSplitButtonOption } from '../common/models/ae-split-button-options';
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


/**
 * Split-Button component to display group of buttons, it accepts array of objects with display text of button, command and disabled options
 * 
 * @export
 * @class AeSplitbuttonComponent
 * @extends {BaseElement}
 * @implements {OnInit}
 * @template T 
 */
@Component({
    selector: 'ae-splitbutton',
    templateUrl: './ae-splitbutton.component.html',
    styleUrls: ['./ae-splitbutton.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AeSplitbuttonComponent extends BaseElement implements OnInit {

    // Private Fields
    private _labelText: string = "";
    private _options: AeSplitButtonOption<any>[] = [];
    private _optionsOpen: boolean = false;
    private _class: AeClassStyle = AeClassStyle.Default;
    // End of Private Fields


/**
   * Member to add dark or light class to button
   * 
   * @type {AeClassStyle}
   * @memberOf AeButtonComponent
   */
  @Input("class")
  get buttonClass() { return this._class; }
  set buttonClass(value: AeClassStyle) { this._class = value; }

    isLight(): boolean {
        return this._class == AeClassStyle.Light;
      }
        // Public Properties

    /**
     * Member to display text on split button (name of the split button)
     * 
     * @type {string}
     * @memberOf AeSplitbuttonComponent
     */
    @Input("text")
    get labelText() {
        return this._labelText;
    }
    set labelText(val: string) {
        this._labelText = val;
    }


    /**
     * Member to add buttons under split button, this will accept array of objects.
     * 
     * @type {AeSplitButtonOption<T>[]}
     * @memberOf AeSplitbuttonComponent
     */
    @Input("options")
    get splitOptions() {
        return this._options;
    }
    set splitOptions(opts: AeSplitButtonOption<any>[]) {
        this._options = opts;
    }

    /**
     * Trigger click event on name of the split button, or down arrow icon of button
     * 
     * @type {EventEmitter<any>}
     * @memberOf AeSplitbuttonComponent
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
        this._optionsOpen = !this._optionsOpen;
        this.aeClick.emit(event);
    }

    /**
     * Triggers click events of split buttons whar are all in the options
     * 
     * @private
     * @param {any} event 
     * @param {any} option 
     * 
     * @return
     * @memberOf AeSplitbuttonComponent
     */
    optionClick(event: MouseEvent, option: AeSplitButtonOption<any>, index: number) {
        if (option.Command) {
            option.Command.next({ Index: index, Text: option.Text });
        }
        this._optionsOpen = !this._optionsOpen;
    }
    // End of Private Methods

    // Public Methods
    /**
     * 
     * Member to display Split buttons
     * @type {boolean}
     * 
     * @return boolean value to display split buttons or not
     * @memberOf AeSplitbuttonComponent
     */

    viewOptions() {
        return this._optionsOpen;
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
