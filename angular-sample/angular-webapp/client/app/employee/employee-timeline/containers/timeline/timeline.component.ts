import { LoadCompanyDocumentsStatAction } from './../../../../document/company-documents/actions/company-documents.actions';
import { LoadEmployeeEventComplete } from './../../../actions/employee.actions';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { ObjectHelper } from "../../../../shared/helpers/object-helper";
import { EventType, Timeline } from "../../../../employee/models/timeline";
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";
import { LocaleService, TranslationService } from "angular-l10n";
import { BaseComponent } from "../../../../shared/base-component";
import { ClaimsHelperService } from "../../../../shared/helpers/claims-helper";
import { MessengerService } from "../../../../shared/services/messenger.service";
import * as fromRoot from '../../../../shared/reducers';
import { Store } from "@ngrx/store";
import { FileUploadService } from "../../../../shared/services/file-upload.service";
import { EmployeeLoadTimelineLoadAction, EmployeeTimeLineUpdateDocument, RemoveEmployeeDocument, RemoveEmployeeEvent, UpdateEmployeeEvent, AddEmployeevent, LoadEmployeeEvent } from "../../../actions/employee.actions";
import { isNullOrUndefined } from "util";
import { EmployeeEvent } from "../../models/emloyee-event";
import { DatePipe } from "@angular/common";
import { Document } from '../../../../document/models/document';
import { DocumentService } from "../../../../document/services/document-service";
import { Observable, Subscription } from 'rxjs/Rx';
import { DocumentCategory } from "../../../../document/models/document-category";
import { DocumentCategoryService } from "../../../../document/services/document-category-service";
import { DocumentArea } from "../../../../document/models/document-area";
import { DocumentCategoryEnum } from "../../../../document/models/document-category-enum";

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TimelineComponent extends BaseComponent implements OnInit, OnDestroy {
  private _selectedEvent: EventType;
  private _action: string;
  private _selectedEmployeeEvent: Timeline;
  private _showRemoveConfirmationDialog: boolean;
  private _loggedInUserId: string;
  private _showEventDetails: boolean;
  private _showDocumentDetails: boolean;
  private _removeTextTitle: string;
  private lightClass: AeClassStyle = AeClassStyle.Light;
  private _showAddOrUpdateSlideout: boolean;
  private _isAdd: boolean;
  private _isUpdate: boolean;
  private _employeeId: string;
  private _employeeIdToFetch$: Observable<string>;
  private _routeParamsScription: Subscription;
  private _documentCategories: Array<DocumentCategory>;
  private _documentCategorySubscription: Subscription;
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _messenger: MessengerService
    , private _fileUpload: FileUploadService
    , private _datePipe: DatePipe
    , private _documentService: DocumentService
    , private _documentCategoryService: DocumentCategoryService
  ) {
    super(_localeService, _translationService, _cdRef);
    this._showAddOrUpdateSlideout = false;
    this._isAdd = false;
    this._isUpdate = false;
    this._loggedInUserId = this._claimsHelper.getUserId();
  }
  get selectedEvent(): EventType {
    return this._selectedEvent;
  }
  get action(): string {
    return this._action;
  }
  get isAdd(): boolean {
    return this._isAdd;
  }
  get showRemoveConfirmationDialog(): boolean {
    return this._showRemoveConfirmationDialog;
  }
  get selectedEmployeeEvent(): Timeline {
    return this._selectedEmployeeEvent;
  }




  onDocumentAddOrUpdateCancel($event) {
    this._isAdd = false;
    this._isUpdate = false;
  }
  onDocumentAddOrUpdateSubmit(document) {
    if (this._isAdd) {
      this._isAdd = false;
      this._isUpdate = false;
      let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Document', document._documentsToSubmit._documentToSave.FileName);
      this._messenger.publish('snackbar', vm);
      this._fileUpload.Upload(document._documentsToSubmit._documentToSave, document._documentsToSubmit.file).then((response: any) => {
        this._store.dispatch(new EmployeeLoadTimelineLoadAction(true));
        this._store.dispatch(new LoadCompanyDocumentsStatAction());
        vm = ObjectHelper.createInsertCompleteSnackbarMessage('Document', document._documentsToSubmit._documentToSave.FileName);
        this._messenger.publish('snackbar', vm);
      })

    }

    else {
      this._store.dispatch(new EmployeeTimeLineUpdateDocument(document._documentsToSubmit._documentToSave));
      this._store.dispatch(new LoadCompanyDocumentsStatAction());
      this._isAdd = false;
      this._isUpdate = false;

    }
  }

  onSubmit(data: EmployeeEvent) {
    if (!isNullOrUndefined(data)) {
      if (!isNullOrUndefined(data.Attachment)) {
        if (!isNullOrUndefined(data.Attachment.File)) {
          this._uploadDocument(data);
        }
        else {
          let document = data.Documents[0];
          document.ExpiryDate = data.Attachment.ExpriryDate;
          document.ReminderInDays = data.Attachment.ReminderInDays;
          this._store.dispatch(new EmployeeTimeLineUpdateDocument(document));
          this._addOrUpdateEvent(data);
        }

      }
      else {
        this._addOrUpdateEvent(data);
      }
    }

    this._showAddOrUpdateSlideout = false;
  }

  private _addOrUpdateEvent(data: EmployeeEvent) {
    if (this._action === 'Add') {
      this._store.dispatch(new AddEmployeevent(data));
    } else {
      this._store.dispatch(new UpdateEmployeeEvent(data));
    }
  }


  private _uploadDocument(data: EmployeeEvent) {
    this._fileUpload.Upload(this._prepareDocumentModel(data), data.Attachment.File.file).then((response: any) => {
      if (isNullOrUndefined(data.Documents)) {
        data.Documents = new Array<Document>();
      }
      data.Documents.push(<Document>response);
      if (this._action === 'Add') {
        this._store.dispatch(new AddEmployeevent(data));
        this._store.dispatch(new LoadCompanyDocumentsStatAction());
      }
      else {
        this._store.dispatch(new UpdateEmployeeEvent(data));  
        this._store.dispatch(new LoadCompanyDocumentsStatAction());      
      }
    }, (error: string) => { console.log(error); });
  }

  private _prepareDocumentModel(data: EmployeeEvent) {
    let document: Document = new Document();
    let category = DocumentCategoryEnum.Other;
    if (!isNullOrUndefined(this._documentCategories) && !isNullOrUndefined(this._selectedEvent)) {
      let docCategory = this._documentCategories.find(d => d.Name.toLowerCase() === this._selectedEvent.Title.toLowerCase());
      if (!isNullOrUndefined(docCategory)) {
        category = docCategory.Code;
      }
    }
    document.Category = category;
    document.Comment = data.Attachment.Comment;
    document.Description = data.Attachment.Description;
    document.Usage = 2;
    document.LastModifiedDateTime = this._datePipe.transform(data.Attachment.File.file.lastModifiedDate, 'medium');
    document.FileName = data.Attachment.File.file.name;
    document.CompanyId = this._claimsHelper.getCompanyId();
    document.RegardingObjectId = this._employeeId;
    document.RegardingObjectTypeCode = 17;
    document.Sensitivity = data.Sensitivity;
    document.ExpiryDate = this._datePipe.transform(data.Attachment.ExpriryDate, 'medium');
    document.ReminderInDays = data.Attachment.ReminderInDays;
    return document;
  }

  oncancel($event: any) {
    this._showAddOrUpdateSlideout = false;
  }

  getSlideoutState(): string {
    return this._showAddOrUpdateSlideout === true || this._showEventDetails === true || this._showDocumentDetails === true || this._isAdd || this._isUpdate ? 'expanded' : 'collapsed';
  }

  getSlideoutAnimateState(): boolean {
    return this._showAddOrUpdateSlideout === true || this._showEventDetails === true || this._showDocumentDetails === true || this._isAdd || this._isUpdate;

  }

  showAddOrUpdateEventSlideOut(): boolean {
    return this._showAddOrUpdateSlideout === true;
  }
  showDocumentUpdateSlideOut(): boolean {
    return this._isUpdate;
  }

  showDocumentAddSlideOut(): boolean {
    return this._isAdd;
  }

  getConfirmationTitle(): string {
    if (!isNullOrUndefined(this._selectedEmployeeEvent)) {
      return this._selectedEmployeeEvent.ItemType === 1 ? 'EMPLOYEE_TIMELINE.Dialog.Remove_Document' : 'EMPLOYEE_TIMELINE.Dialog.Remove_Event';
    }
    return '';
  }

  getConfirmationMessage(): string {
    if (!isNullOrUndefined(this._selectedEmployeeEvent)) {
      return this._selectedEmployeeEvent.ItemType === 1 ? 'EMPLOYEE_TIMELINE.Dialog.Info_Document' : 'EMPLOYEE_TIMELINE.Dialog.Info_Event';
    }
    return '';
  }

  getConfirmYesButtonText(): string {
    if (!isNullOrUndefined(this._selectedEmployeeEvent)) {
      return this._selectedEmployeeEvent.ItemType === 1 ? 'EMPLOYEE_TIMELINE.Dialog.Btn_Yes_Document' : 'EMPLOYEE_TIMELINE.Dialog.Btn_Yes_Event';
    }
    return '';
  }

  getConfirmNoButtonText(): string {
    if (!isNullOrUndefined(this._selectedEmployeeEvent)) {
      return this._selectedEmployeeEvent.ItemType === 1 ? 'EMPLOYEE_TIMELINE.Dialog.Btn_No_Document' : 'EMPLOYEE_TIMELINE.Dialog.Btn_No_Event';
    }
    return '';
  }

  modalClosed(confirm: string) {
    this._showRemoveConfirmationDialog = false;
    if (confirm === 'yes') {
      if (this._selectedEmployeeEvent.ItemType === 1) {
        this._store.dispatch(new RemoveEmployeeDocument(this._selectedEmployeeEvent));
      } else {
        this._store.dispatch(new RemoveEmployeeEvent(this._selectedEmployeeEvent));
      }
    }
  }

  showEventDetailsSlideOut(): boolean {
    return this._showEventDetails === true;
  }
  showDocumentDetailsSlideOut(): boolean {
    return this._showDocumentDetails === true;
  }

  onDetailsCancel($event: string) {
    this._showEventDetails = false;
    this._showDocumentDetails = false;
  }

  onAddNew(event: any) {
    if (!isNullOrUndefined(event)) {
      if (event.type !== 'document') {
        this._selectedEvent = event.selectedEvent;
        this._showAddOrUpdateSlideout = true;
        this._action = 'Add';
      } else {
        this._isAdd = true;
      }
    }
  }
  onUpdate(event: any) {
    if (!isNullOrUndefined(event)) {
      let selectedItem = event.selectedItem;
      if (selectedItem.ItemType !== 1) {
        this._store.dispatch(new LoadEmployeeEventComplete(null));
        this._action = 'Update';
        this._selectedEvent = event.selectedEvent;
        this._showAddOrUpdateSlideout = true;
        this._store.dispatch(new LoadEmployeeEvent(selectedItem.Id));
      } else {
        this._isUpdate = true;
        this._documentService.loadSelectedDocument(selectedItem.Id);
      }
    }
  }

  onRemove(event: any) {
    if (!isNullOrUndefined(event)) {
      let selectedItem = event.selectedItem;
      this._selectedEmployeeEvent = selectedItem;
      this._removeTextTitle = this.getTitle(selectedItem.Title, selectedItem.FileName);
      this._showRemoveConfirmationDialog = true;
    }
  }
  onDetailsClick(event: any) {
    if (!isNullOrUndefined(event)) {
      let selectedItem = event.selectedItem;
      this._selectedEmployeeEvent = selectedItem;
      if (selectedItem.ItemType === 2) {
        this._showEventDetails = true;
        this._selectedEvent = event.selectedEvent;
        this._store.dispatch(new LoadEmployeeEvent(selectedItem.Id));
      }
      else {
        this._documentService.loadSelectedDocument(selectedItem.Id);
        this._showDocumentDetails = true;
      }
    }

  }
  getTitle(title: string, fileName: string): string {
    if (!isNullOrUndefined(title))
      return title;
    if (!isNullOrUndefined(fileName))
      return fileName.split('.')[0];

    return '';
  }

  ngOnInit() {
    this._employeeIdToFetch$ = this._store.let(fromRoot.getEmployeeId);
    this._routeParamsScription = this._employeeIdToFetch$.subscribe((val) => {
      this._employeeId = val;
    });
    this._documentCategorySubscription = this._store.let(fromRoot.getDocumentCategoriesData).skipWhile(val => isNullOrUndefined(val)).subscribe(docCategories => {
      if (!isNullOrUndefined(docCategories)) {
        this._documentCategories = this._documentCategoryService.getDocumentCategoriesByArea(<Array<DocumentCategory>>docCategories, DocumentArea.EmployeeDocuments);
      }
    });

  }
  ngOnDestroy(): void {
    if (this._routeParamsScription) {
      this._routeParamsScription.unsubscribe();
    }
    if (this._documentCategorySubscription) {
      this._documentCategorySubscription.unsubscribe()
    }
  }
}
