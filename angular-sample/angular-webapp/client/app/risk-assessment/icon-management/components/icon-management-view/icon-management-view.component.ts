import { properEndDateValidator } from '../../../../holiday-absence/common/holiday-absence.validators';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'icon-management-view',
    templateUrl: './icon-management-view.component.html',
    styleUrls: ['./icon-management-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconManagementViewComponent extends BaseComponent implements OnInit {

    /*private variables declaration here*/
    private _iconManagementDetailsVm: any;
    private _lightClass: AeClassStyle = AeClassStyle.Light;
    private _pictureUrl: string;
    /*end of private variables*/
    darkClass: AeClassStyle = AeClassStyle.Dark;

    //constructor
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _changeDetectordRef: ChangeDetectorRef
    ) {
        super(_localeService, _translationService, _changeDetectordRef);
    }

    /*input properties*/
    @Input('iconDetails')
    set iconDetails(value: any) {
        this._iconManagementDetailsVm = value;
    }
    get iconDetails() {
        return this._iconManagementDetailsVm;
    }
    get pictureUrl() {
        return this._pictureUrl;
    }
    get iconManagementDetailsVm() {
        return this._iconManagementDetailsVm;
    }
    /* end of input properties*/

    // Public Output bindings
    @Output('onCancel') _onCancel: EventEmitter<string> = new EventEmitter<string>();

    ngOnInit() {
        if (!isNullOrUndefined(this._iconManagementDetailsVm)) {
            this._pictureUrl = this.getPictureUrl(this._iconManagementDetailsVm.PictureId, this._iconManagementDetailsVm.IsExample);
        }
    }

    getViewname() {
        if (!isNullOrUndefined(this._iconManagementDetailsVm)) {
            if (this._iconManagementDetailsVm.CategoryType == 'hazard') {
                return 'Hazard icon details';
            }
            else {
                return 'Control icon details';
            }
        }
        else {
            return '';
        }
    }

    onDetailCancel() {
        this._onCancel.emit('close');
    }

    previewUrl() {
        return this.getPictureUrl(this._iconManagementDetailsVm.PictureId, this._iconManagementDetailsVm.IsExample)
    }

    public getPictureUrl(pictureId: string, isExample: boolean): string {
        if (!isNullOrUndefined(pictureId)) {
            let baseURL = window.location.protocol + "//" + window.location.host;

            if (isExample) {
                return baseURL + "/filedownload?documentId=" + pictureId + "&isSystem=true";
            }
        }
        else {
            return '/assets/images/hazard-default.png';
        }

    }

    public showModifiedOn() {
        return !isNullOrUndefined(this._iconManagementDetailsVm) && (this._iconManagementDetailsVm.Version != "1.0");
    }
    public showModifiedBy() {
        return this.showModifiedOn();
    }
}
