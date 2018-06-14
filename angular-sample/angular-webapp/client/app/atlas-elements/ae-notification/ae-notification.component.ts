import { StringHelper } from '../../shared/helpers/string-helper';
import { BaseElement } from '../common/base-element';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AeIconSize } from '../../atlas-elements/common/ae-icon-size.enum';
@Component({
    selector: 'ae-notification',
    templateUrl: './ae-notification.component.html',
    styleUrls: ['./ae-notification.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AeNotificationComponent extends BaseElement implements OnInit {
    // Private Fields
    private _textInfo: string;
    private _icon: string;
    private _isAlert: boolean = false;
    private _svgUrl: string;
    // End of Private Fields
    // Public properties
    /**
     * Displays the information text.
     * 
     * @type: string
     * get/set property
     * 
     * @memberOf AeNotificationComponent
     */
    @Input('textInfo')
    get text() {
        return this._textInfo;
    }
    set text(val: string) {
        this._textInfo = val;
    }
    /**
     * Memeber to pass icon name.
     * 
     * @type: string
     * get/set property
     * 
     * @memberOf AeNotificationComponent
     */
    @Input('iconName')
    get icon() {
        return this._icon;
    }
    set icon(val: string) {
        this._icon = val;
    }

    /**
            * To represent alert icon. 
            * 
            * @type boolean
            * get/set property
            * 
            * @memberOf AeNotificationComponent
            */
    @Input('isAlert')
    get isAlert() {
        return this._isAlert;
    }
    set isAlert(value: boolean) {
        this._isAlert = value;
    }

    @Input('svgUrl')
    get svgUrl() {
        return this._svgUrl;
    }
    set svgUrl(val: string) {
        this._svgUrl = val;
    }
    /**
     * Member to assign icon size
     * 
     * @type {AeIconSize}
     * @memberOf AeNotificationComponent
     */
    private _iconMedium: AeIconSize = AeIconSize.medium;
    // End of Private Fields

    // Private methods
    isIcon(): boolean {
        return this._icon != null && this._icon != undefined;
    }
    get iconMedium(): AeIconSize {
        return this._iconMedium;
    }
    // Private methods end 

}