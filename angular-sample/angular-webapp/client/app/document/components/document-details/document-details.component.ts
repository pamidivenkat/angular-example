import { RouteParams } from './../../../shared/services/route-params';
import { OtcEntityDataService } from '../../services/otc-data.service';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { DocumentService } from '../../services/document-service';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { BaseComponent } from '../../../shared/base-component';
import * as url from 'url';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs/Rx';
import { Store } from '@ngrx/store';

import { LocaleService, TranslationService } from 'angular-l10n';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import * as fromRoot from './../../../shared/reducers';
import { Document, EntityReference } from '../../models/document';
@Component({
    selector: 'document-details',
    templateUrl: './document-details.component.html',
    styleUrls: ['./document-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class DocumentDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
    //Private Members
    private _selectedDocument: Document;
    private _selectDocumentSubscription: Subscription;
    private _otcEntityDataStatusSubscription: Subscription;
    private _otcEntityDataSubscription: Subscription;
    private _regardingObjectTypeName: string;
    private _regardingObjectTypeValue: string;
    private _otcEntityData: Array<EntityReference>;
    private _buttonLightClass: AeClassStyle;
    //End of Private Members
    //public properties
    get selectedDocument() {
        return this._selectedDocument;
    }
    get regardingObjectTypeName() {
        return this._regardingObjectTypeName;
    }
    get regardingObjectTypeValue() {
        return this._regardingObjectTypeValue;
    }
    get buttonLightClass() {
        return this._buttonLightClass;
    }
    //end of public properties
    //Output Properties
    @Output('onCancel') _onCancel: EventEmitter<string> = new EventEmitter<string>();
    @Output('onDelete') _onDelete: EventEmitter<string> = new EventEmitter<string>();
    @Output('onUpdate') _onUpdate: EventEmitter<string> = new EventEmitter<string>();

    //End of output properties

    //Constructor
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _documentService: DocumentService
        , private _data: RestClientService
        , private _otcDataService: OtcEntityDataService
        , private _routeParamsService:RouteParams
        ) {
        super(_localeService, _translationService, _cdRef);
        this._buttonLightClass = AeClassStyle.Light;
    }

    //End of constructor
    //ngOnInit
    ngOnInit() {
        this._otcEntityDataStatusSubscription = this._store.let(fromRoot.getOtcEntityDataLoadingState).subscribe(status => {
            if (status === false)
                this._otcDataService.loadOtcEntities();
        });
        this._otcEntityDataSubscription = this._store.let(fromRoot.getOtcEntityData).subscribe(data => {
            this._otcEntityData = data;
        });

        this._selectDocumentSubscription = this._store.let(fromRoot.getCurrentDocument).subscribe(res => {
            this._selectedDocument = res;
            if (!isNullOrUndefined(this._selectedDocument) && !isNullOrUndefined(this._selectedDocument.RegardingObject)) {
                if (!isNullOrUndefined(this._otcEntityData)) {
                    let entity: EntityReference = this._otcEntityData.find(m => m.Otc === this._selectedDocument.RegardingObject.Otc);
                    if (!isNullOrUndefined(entity)) {
                        this._regardingObjectTypeName = entity.Name;
                        let url: string = this._regardingObjectTypeName + '/' + this._selectedDocument.RegardingObject.Id;
                        this._loadTarget(url).subscribe((res) => {
                            if (!isNullOrUndefined(res.json())) {
                                if (this._selectedDocument.RegardingObject.Otc != 17)
                                    this._regardingObjectTypeValue = this._otcDataService.findOutPrimaryName(res.json());
                                else
                                    this._regardingObjectTypeValue = this._otcDataService.findSpecificFieldName('Name', res.json());
                                this._cdRef.markForCheck();
                            }
                        });
                    }
                }
            }

            this._cdRef.markForCheck();
        });
    }
    //End of ngOnInit

    //ngOnDestroy
    ngOnDestroy(): void {
        this._selectDocumentSubscription.unsubscribe();
        this._otcEntityDataStatusSubscription.unsubscribe();
        this._otcEntityDataSubscription.unsubscribe();
    }

    //End of ngOnDestroy

    //Private Methods

    private _getDownloadUrl(docId: string) {
        if (isNullOrUndefined(docId))
            return null;
        return this._routeParamsService.Cid ? `/filedownload?documentId=${docId}&cid=${this._routeParamsService.Cid}`  : `/filedownload?documentId=${docId}`;
    }

    private _loadTarget(url: string) {
        return this._data.get(url);
    }

    //End of Private Methods
    //public methods
    
    public onDocumentEditClick() {
        this._onUpdate.emit('update');
    }

    public onDocumentCancel() {
        this._onCancel.emit('cancel');
    }


    public removeDocumentClick() {
        this._onDelete.emit('remove');
    }

    public downloadDocument(docId: string) {
        window.open(this._getDownloadUrl(docId));
    }

    public showRegardingObjectData() {
        return !isNullOrUndefined(this._regardingObjectTypeValue);
    }

    //end of public methods
}