import { BaseElement } from '../common/base-element';
import { AeIconSize } from '../common/ae-icon-size.enum';
import { AeImageAvatarSize } from '../common/ae-image-avatar-size.enum';
// import { BaseElementGeneric } from '../common/base-element-generic';

import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Optional,
    Output,
    ViewEncapsulation,
    ChangeDetectionStrategy
} from '@angular/core';

@Component({
    selector: 'app-ae-image-avatar',
    templateUrl: './ae-image-avatar.component.html',
    styleUrls: ['./ae-image-avatar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AeImageAvatarComponent extends BaseElement implements OnInit {

    // Private Fields
    //

    private _isEditable: boolean = false; //default is false
    private _imgSrcUrl: string = "/assets/images/profile-default.png"; //defualt img src
    private _size: AeImageAvatarSize = AeImageAvatarSize.big; //big or small, defualt is big
    private _imageAltText: string;// = "profile image"; //
    private _isBorderCircle: boolean;// = true; //default is true

    /**
   * Member to specify the edit icon size
   * @private
   * @type {AeIconSize}
   * @memberOf AeImageAvatarComponent
   */
    private _editIconSize: AeIconSize = AeIconSize.small;
    //private iconOneSize: AeIconSize = AeIconSize.big;
    //private iconSmall: AeIconSize = AeIconSize.small;
    //private iconMedium: AeIconSize = AeIconSize.medium;


    //
    // End of Private Fields

    // Public Properties
    /**
     * Image preview has a option to edit/change or not
     * @type {boolean}
     * @memberOf AeImageAvatarComponent
     */
    private _maxAvatarImageSize: number;

    @Input('edit')
    get edit() {
        return this._isEditable;
    }
    set edit(value: boolean) {
        this._isEditable = value;
    }

    // Public Properties
    /**
     * Image hover title, alt text for image preview
     * @type {string}
     * @memberOf AeImageAvatarComponent
     */
    @Input('alt')
    get alt() {
        return this._imageAltText;
    }
    set alt(value: string) {
        this._imageAltText = value;
    }

    // Public Properties
    /**
     * Image src url, to be displayed in preview
     * @type {string}
     * @memberOf AeImageAvatarComponent
     */
    @Input('imgSrc')
    get imgSrc() {
        return this._imgSrcUrl;
    }
    set imgSrc(value: string) {
        this._imgSrcUrl = value;
    }

    // Public Properties
    /**
     * Image size big or small, by default it is big
     * @type {string}
     * @memberOf AeImageAvatarComponent
     */
    @Input('size')
    get size() {
        return this._size;
    }
    set size(value: AeImageAvatarSize) {
        this._size = value;
    }

    @Input('maxAvatarImageSize')
    get maxAvatarImageSize() {
        return this._maxAvatarImageSize;
    }
    set maxAvatarImageSize(value: number) {
        this._maxAvatarImageSize = value;
    }

    // Public Properties
    /**
     * Image size big or small, by default it is big
     * @type {string}
     * @memberOf AeImageAvatarComponent
     */
    @Input('editIconSize')
    get editIconSize() {
        return this._editIconSize;
    }
    set editIconSize(value: AeIconSize) {
        this._editIconSize = value;
    }

    // Public Properties
    /**
     * Image preview has a option to edit/change or not
     * @type {boolean}
     * @memberOf AeImageAvatarComponent
     */
    @Input('isBorderCircle')
    get isBorderCircle() {
        return this._isBorderCircle;
    }
    set isBorderCircle(value: boolean) {
        this._isBorderCircle = value;
    }
    //output bindings
    @Output('onAeAvatarChange')
    _onAeAvatarChange: EventEmitter<any> = new EventEmitter<any>();
    //end of output bindings

    ngOnInit() {
    }

    isBigAvatar() {
        return this._size == AeImageAvatarSize.big ? true : false;
    }
    onFilesSelected($event) {
        this._onAeAvatarChange.emit($event);
    }
}
