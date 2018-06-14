import { StringHelper } from '../../shared/helpers/string-helper';
import { BaseElement } from '../common/base-element';
import { AeIconSize } from '../common/ae-icon-size.enum';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';


/**
 * Atlas Icon Component that displays icon based on provided SVG icon class name. We can change the Size of icon by providing size as 
 * 'small','medium','big', we can change the color of icon by applying diff. colors on it.
 * 
 * @export
 * @class AeIconComponent
 * @extends {BaseElement}
 */
@Component({
    selector: 'ae-icon',
    templateUrl: './ae-icon.component.html',
    styleUrls: ['./ae-icon.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeIconComponent extends BaseElement implements OnInit {

    // Private Fields
    private _iconSize: AeIconSize = AeIconSize.none;
    private _hasNotification: boolean = false;
    private _iconName: string;
    private _color: string;
    private _isAlert: boolean = false;
    private _title: string = "";
    private _svgUrl: string;
    // End of Private Fields

    // Public properties

    /**
     * SVG icon class name ex. icon-settings etc.
     * 
     * @type string
     * get/set property
     * 
     * @memberOf AeIconComponent
     */
    @Input('icon')
    get iconName() {
        return this._iconName;
    }
    set iconName(value: string) {
        this._iconName = value;
    }


    /**
     * To represent the size of the icon. Size can be 'small','medium','big'
     * 
     * @type AeIconSize
     * get/set property
     * 
     * @memberOf AeIconComponent
     */
    @Input('size')
    get iconSize() {
        return this._iconSize;
    }
    set iconSize(value: AeIconSize) {
        this._iconSize = value;
    }


    /**
     * To represent icon with notification. 
     * 
     * @type boolean
     * get/set property
     * 
     * @memberOf AeIconComponent
     */
    @Input('notify')
    get hasNotification() {
        return this._hasNotification;
    }
    set hasNotification(value: boolean) {
        this._hasNotification = StringHelper.coerceBooleanProperty(value);
    }
    /**
         * To represent alert icon. 
         * 
         * @type boolean
         * get/set property
         * 
         * @memberOf AeIconComponent
         */
    @Input('isAlert')
    get isAlert() {
        return this._isAlert;
    }
    set isAlert(value: boolean) {
        this._isAlert = value;
    }
    /**
     * The color of the icon. Color can be any valid HTML color name or HEX color code. 
     * 
     * @type string
     * get/set property
     * 
     * @memberOf AeIconComponent
     */
    @Input('color')
    get color() {
        return this._color;
    }
    set color(value: string) {
        this._color = !StringHelper.isNullOrUndefinedOrEmpty(value) ? value : null;
    }
    /**
         * Member to pass title for icon
         * 
         * @type string
         * get/set property
         * 
         * @memberOf AeIconComponent
         */
    @Input('title')
    get title() {
        return this._title;
    }
    set title(value: string) {
        this._title = value;
    }

    @Input('svgUrl')
    get svgUrl() {
        return this._svgUrl;
    }
    set svgUrl(val: string) {
        this._svgUrl = val;
    }

    // End of Public properties

    // Public Output bindings
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bindings

    // Constructor
    // End of constructor

    // Private methods
    getIconSvgUri(): string {
        return StringHelper.isNullOrUndefinedOrEmpty(this._svgUrl) ? this.getAbsoluteUrl(this._iconName) : this._svgUrl;
    }

    isMedium(): boolean {
        return this._iconSize == AeIconSize.medium;
    }

    isSmall(): boolean {
        return this._iconSize == AeIconSize.small;
    }

    isBig(): boolean {
        return this._iconSize == AeIconSize.big;
    }
    isTiny(): boolean {
        return this._iconSize == AeIconSize.tiny;
    }


    // End of private methods

    // Public methods
    ngOnInit(): void {
        this.name = "Name not required";
        super.ngOnInit();
    }
    // End of public methods
}
