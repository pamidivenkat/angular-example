import { RouteParams } from './../../../shared/services/route-params';
import { MessageType } from '../../../atlas-elements/common/ae-message.enum';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { MessengerService } from '../../../shared/services/messenger.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { FileResult } from '../../../atlas-elements/common/models/file-result';
import { EventEmitter, Output } from '@angular/core';
import { checklistInstanceItem } from '../../models/checklist-instance-item.model';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CheckListInstance } from '../../models/checklist-instance.model';
import { BehaviorSubject, Subject, Subscription } from 'rxjs/Rx';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef, Input } from '@angular/core';
import { BaseComponent } from '../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { ChecklistService } from '../../services/checklist.service';
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';
import { Document } from '../../../document/models/document';
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
@Component({
    selector: 'checklist-actionItems',
    templateUrl: './action-checklist.component.html',
    styleUrls: ['./action-checklist.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ChecklistActionItemsComponent extends BaseComponent implements OnInit, OnDestroy {

    // Private Fields
    private _checkListInstance: CheckListInstance;
    private _isPending: boolean = false;
    private _selectedFile: FileResult;
    private _objectType: string = "Document";
    private _isFileChange: boolean = false;
    private _lightClass: AeClassStyle = AeClassStyle.Light;
    private _messageTypeSuccess: MessageType = MessageType.Success;
    private _messageTypeInfo: MessageType = MessageType.Info;
    private _messageTypeWarning: MessageType = MessageType.Warning;
    //End of Private Fields
    get buttonLightClass(): AeClassStyle {
        return this._lightClass;
    }

    //Constructor
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>
        , protected _checklistService: ChecklistService
        , private _messenger: MessengerService
        , private _fileUploadService: FileUploadService
        , protected _claimsHelper: ClaimsHelperService
        , private _routeParamsService:RouteParams
    ) {
        super(_localeService, _translationService, _cdRef);
        this._onShowDialog = new EventEmitter<any>();
        this._onCancel = new EventEmitter<string>();
        this._OnSaveComplete = new EventEmitter<string>();
    }
    //End of Constructor

    // Public properties
    @Input('checkListInstance')
    get checkListInstance() {
        return this._checkListInstance;
    }
    set checkListInstance(value: CheckListInstance) {
        this._checkListInstance = value;
        if (!isNullOrUndefined(value)) {
            if (!isNullOrUndefined(value.InstanceItems)) {
                this._SetChecklistActionItemsStatus();
                this._cdRef.markForCheck();
            }
        }
    }
    @Output('onShowDialog') _onShowDialog: EventEmitter<any>;
    @Output('onCancel') _onCancel: EventEmitter<string>;
    @Output('OnSaveComplete') _OnSaveComplete: EventEmitter<string>;
    // End of Public properties


    ngOnInit() {

    }

    //Private Methods
    private _SetChecklistActionItemsStatus() {

        let ViewingOwnChecklist = this._claimsHelper.getUserId() == this._checkListInstance.AssignedToId;
        if (this._checkListInstance && this._checkListInstance.InstanceItems && this._checkListInstance.InstanceItems.length > 0) {
            for (var i = 0; i < this._checkListInstance.InstanceItems.length; i++) {
                if (this._checkListInstance.InstanceItems[i].Answer == 0) {
                    this._isPending = true;
                    break;
                }
            }
        }

        if (!ViewingOwnChecklist || this._checkListInstance.Status == 2) {
            this._isPending = false;
            return;
        }

        var isDueToday = (new Date(this._checkListInstance.ScheduledDate)).getDate() == (new Date()).getDate();
        this._isPending = (this._isPending && (ViewingOwnChecklist) && isDueToday);
    }
    //End of Private Methods
    //Public properties
    get IsPending() {
        return this._isPending;
    }
    get CheckListInstance() {
        return this._checkListInstance;
    }
    get MessageTypeSuccess() {
        return this._messageTypeSuccess;
    }
    get MessageTypeInfo() {
        return this._messageTypeInfo;
    }
    get MessageTypeWarning() {
        return this._messageTypeWarning;
    }
    //End of Public properties

    //Public Methods
    public removeActionItemDocument(attachment: Document, instanceActionItemId: string) {
        this._onShowDialog.emit({ "Attachments": attachment, "InstanceActionItemId": instanceActionItemId });
    }

    public onActionItemClosed(e) {
        this._onCancel.emit('');
    }

    public onActionItemSubmit(e) {
        if (!isNullOrUndefined(this._checkListInstance.InstanceItems)) {
            for (var i = 0; i < this._checkListInstance.InstanceItems.length; i++) {
                if (!isNullOrUndefined(this._checkListInstance.Attachments))
                    if (!isNullOrUndefined(this._checkListInstance.Attachments.get(this._checkListInstance.InstanceItems[i].Id)))
                        this._checkListInstance.InstanceItems[i].Attachments = this._checkListInstance.Attachments.get(this._checkListInstance.InstanceItems[i].Id);
            }
        }
        this._checklistService.updateChecklistActions(this._checkListInstance);
        this._OnSaveComplete.emit('');
    }
    public yourResponse(response: number, instanceIndex: number) {
        this._checkListInstance.InstanceItems[instanceIndex].Answer = response;
    }
    public onFilesSelected($event: FileResult[], checklistActionItemId: string, instanceIndex: number) {
        for (let uploadedDocument of $event) {
            this._selectedFile = uploadedDocument;
            if (!isNullOrUndefined(this._selectedFile) && this._selectedFile.isValid) {
                let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, this._selectedFile.file.name);
                this._messenger.publish('snackbar', vm);
                this._isFileChange = true;
                let _documentToSave: Document = Object.assign({}, new Document());
                _documentToSave.LastModifiedDateTime = this._selectedFile.file.lastModifiedDate;
                _documentToSave.Category = 0;
                _documentToSave.FileName = this._selectedFile.file.name;
                _documentToSave.FileNameAndTitle = this._selectedFile.file.name;
                this._fileUploadService.Upload(_documentToSave, this._selectedFile.file).then((response: any) => {
                    if (!isNullOrUndefined(response)) {
                        let attachment = response as Document;
                        let vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._objectType, attachment.FileName);
                        this._messenger.publish('snackbar', vm);



                        if (!isNullOrUndefined(this._checkListInstance.Attachments) && !isNullOrUndefined(this._checkListInstance.Attachments.get(checklistActionItemId))) {
                            let uploadedAttachments = this._checkListInstance.Attachments.get(checklistActionItemId)
                            uploadedAttachments.push(attachment)
                            this._checkListInstance.Attachments.set(checklistActionItemId, uploadedAttachments);
                        }
                        else {
                            if (!isNullOrUndefined(this._checkListInstance.InstanceItems[instanceIndex].Attachments))
                                this._checkListInstance.InstanceItems[instanceIndex].Attachments.push(attachment);
                            else {
                                this._checkListInstance.InstanceItems[instanceIndex].Attachments = [];
                                this._checkListInstance.InstanceItems[instanceIndex].Attachments.push(attachment);
                            }

                        }

                        this._cdRef.markForCheck();
                    }
                }, (error: string) => {
                    console.log("file upload error is", error);
                    new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Document', this._selectedFile.file.name));
                });
            }
        }
    }
    public getImagePreviewUrl(fileId: string) {
        if (isNullOrUndefined(fileId))
            return null;
        return this._routeParamsService.Cid ? '/filedownload?documentId='+fileId+'&cid='+ this._routeParamsService.Cid :  '/filedownload?documentId='+fileId;
    }
    public downloadActionItemAttachment(fileId: string) {
        if (!isNullOrUndefined(fileId)) {
            window.open(this._routeParamsService.Cid ? '/filedownload?documentId='+fileId+'&cid='+ this._routeParamsService.Cid:  '/filedownload?documentId='+fileId);
        }
    }
    //Public Methods


    ngOnDestroy() {

    }
}