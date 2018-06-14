import { PermissionWithArea } from '../../common/permissionarea-map';
import { LocaleService, TranslationService } from 'angular-l10n';
import { consulantModel } from '../../models/consulant-info';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../shared/reducers/index';
import { Store } from "@ngrx/store";
import { Component, ChangeDetectionStrategy, ViewEncapsulation, OnInit, Input, ChangeDetectorRef, Output, EventEmitter } from "@angular/core"
import { BehaviorSubject } from "rxjs/Rx";

@Component(
    {
        selector: 'menu-bottom',
        templateUrl: './menu-bottom.component.html',
        styleUrls: ['./menu-bottom.component.scss'],
        changeDetection: ChangeDetectionStrategy.OnPush,
        encapsulation: ViewEncapsulation.None
    }
)
export class MenuBottomComponent extends BaseComponent implements OnInit {
    // Private Fields
    /**
     * @private
     * variable to hold consultantsInfo stream
     * @memberOf MenuBottomComponent
     */
    private _consultantsInfo = new BehaviorSubject<consulantModel[]>([]);

    /**
     * variable to hold advice card number
     * @private
     * @type {string}
     * @memberOf MenuBottomComponent
     */
    private _adviceCard: string;
    // End of Private Fields

    // Public properties

    /**
     * property to hold consultantsInfo stream
     * @memberOf MenuBottomComponent
     */
    @Input('consultantsInfo')
    set ConsultantsInfo(value: BehaviorSubject<consulantModel[]>) {
        this._consultantsInfo = value;
    };

    get ConsultantsInfo() {
        return this._consultantsInfo;
    }

    /**
     * property to hold advice card number stream
     * @readonly
     * @memberOf MenuBottomComponent
     */
    @Input('adviceCardNumber')
    get AdviceCardNumber() {
        return this._adviceCard;
    }
    set AdviceCardNumber(adviceCardNumber: string) {
        this._adviceCard = adviceCardNumber;
    }
    // End of Public properties

    // Public Output bindings
    @Output('onHelpClick') onHelpClick: EventEmitter<boolean> = new EventEmitter<boolean>();
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // constructor
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _claimsHelper: ClaimsHelperService) {
        super(_localeService, _translationService, _cdRef);
    }
    // End of constructor

    // Private methods
    // End of private methods

    // Public methods

    canShowHelpline(): boolean {
        return this._claimsHelper.isHSServiceOwnerOrCoordinator() || this._claimsHelper.isHRManagerOrServiceOwner();
    }

    /**
     *  method to return consultant service type
     * @param {PermissionWithArea} permissionArea 
     * @returns {string} 
     * 
     * @memberOf MenuBottomComponent
     */
    consultantServiceType(permissionArea: PermissionWithArea): string {
        switch (permissionArea) {
            case PermissionWithArea.ComboEL:
            case PermissionWithArea.ConsultantEL:
                return "HR consultant";
            case PermissionWithArea.ComboHS:
            case PermissionWithArea.ConsultantHS:
                return "H&S consultant";
            default:
                break;
        }
    }

    helpNavigationClick() {
        this.onHelpClick.emit(true);
    }

    ngOnInit() {
    }

    // End of public methods
}