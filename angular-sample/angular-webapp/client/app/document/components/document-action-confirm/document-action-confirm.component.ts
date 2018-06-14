import { RouteParams } from './../../../shared/services/route-params';
import { LoadDocumentInformationBarSpecificStatAction } from './../../actions/information-bar-actions';
import { CompanyDocumentsToReviewConfirmAction, CompanyUsefulDocumentsToReviewConfirmAction } from './../../actions/shared-documents.actions';
import { AeInformationBarItemType } from '../../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { AePosition } from '../../../atlas-elements/common/ae-position.enum';
import { ReturnStatement } from '@angular/compiler/src/output/output_ast';
import { isNullOrUndefined } from 'util';
import { AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { _document } from '@angular/platform-browser/src/browser';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { DocumentActionType, DistributedDocumentsModeOfOperation } from '../../models/document';
import { NavigationExtras, ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AeSortModel } from './../../../atlas-elements/common/models/ae-sort-model';
import { AeDataTableAction } from './../../../atlas-elements/common/models/ae-data-table-action';
import { DistributedDocument, ActionedDocument } from './../../models/DistributedDocument';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import {
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { AeInformationBarItem } from './../../../atlas-elements/common/models/ae-informationbar-item';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import * as fromRoot from './../../../shared/reducers';
import * as Immutable from 'immutable';
import { DatePipe } from '@angular/common';
import * as CompanyDocumentsActions from '../../actions/shared-documents.actions';
import * as InformationBarDocumentsActions from '../../actions/information-bar-actions';
import { processDistributedSharedDocuments } from '../../common/document-extract-helper';
import { AeSignatureComponent } from './../../../atlas-elements/ae-signature/ae-signature.component';
import { AeInputType } from './../../../atlas-elements/common/ae-input-type.enum';


@Component({
  selector: 'document-action-confirm',
  templateUrl: './document-action-confirm.component.html',
  styleUrls: ['./document-action-confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentActionConfirmComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {

  // Private Fields    
  private _actionedDocumentForm: FormGroup;
  private _modeOfOPeration: DistributedDocumentsModeOfOperation = DistributedDocumentsModeOfOperation.Documents;
  private _actionedDocument: DistributedDocument;
  private _showRemoveDocumentActionConfirmModalDialog = true;
  private _validationMessage: string;
  private _showValidationMessage: boolean = false;
  private _actionConfirmTitle: string;
  private _checkBoxConfirmTitle: string;
  private _ctrlType: AeInputType = AeInputType.text;
  private _readConfirmMessage: string;
  private _signConfirmMessage: string;
  private _readActionConfirmMessage: string;
  private _signActionConfirmMessage: string;

  private _readActionConfirmTitle: string;
  private _signActionConfirmTitle: string;
  private _signRequiredMessage: string;

  lightClass: AeClassStyle = AeClassStyle.Light;
  darkClass: AeClassStyle = AeClassStyle.Dark;
  btnLeft: AePosition = AePosition.Left;
  btnRight: AePosition = AePosition.Right;
  private _translationChangeSub: Subscription;

  // End of Public properties
  @Input('modeOfOPeration')
  get ModeOfOPeration(): DistributedDocumentsModeOfOperation {
    return this._modeOfOPeration;
  }
  set ModeOfOPeration(value: DistributedDocumentsModeOfOperation) {
    this._modeOfOPeration = value;
  }

  @Input('actionedDocument')
  get ActionedDocument(): DistributedDocument {
    return this._actionedDocument;
  }
  set ActionedDocument(value: DistributedDocument) {
    this._actionedDocument = value;
  }
  get actionedDocumentForm() {
    return this._actionedDocumentForm;
  }
  get ctrlType() {
    return this._ctrlType;
  }
  get validationMessage() {
    return this._validationMessage;
  }
  // Public Output bindings
  @Output('dialogDisplayStatusChange')
  onDialogDisplayStatusChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  // End of Public Output bindings

  // Public ViewChild bindings
  @ViewChildren(AeSignatureComponent) public sigs: QueryList<AeSignatureComponent>;
  @ViewChildren('sigContainer1') public sigContainer1: QueryList<ElementRef>;

  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _route: ActivatedRoute
    , private _router: Router
    , private _datePipe: DatePipe
    , private _fb: FormBuilder
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);

  }

  // End of constructor

  // Private methods

  private _initForm() {
    if (this._actionedDocument.DocumentAction == DocumentActionType.RequiresRead)
      this._actionedDocumentForm = this._fb.group({
        readActionConfirm: [{ value: null, disabled: false }, [Validators.required]],
      });
    else
      this._actionedDocumentForm = this._fb.group({
        signActionConfirm: [{ value: null, disabled: false }, [Validators.required]],
        employeeSignConfirm: ['']
      });
  }


  private _isDocumentsMode() {
    return this._modeOfOPeration == DistributedDocumentsModeOfOperation.Documents;
  }

  private _onDocumentDownLoad() {
    if (this._actionedDocument.OperationMode == DistributedDocumentsModeOfOperation.Documents) {
      let url = this._routeParamsService.Cid ? `/filedownload?documentId=${this._actionedDocument.Id}&isSystem=false&version=${this._actionedDocument.DocumentVersion}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${this._actionedDocument.Id}&isSystem=false&version=${this._actionedDocument.DocumentVersion}`
      window.open(url);
    }
    if (this._actionedDocument.OperationMode == DistributedDocumentsModeOfOperation.SharedDocuments)
      window.open('/filedownload?sharedDocumentId=' + this._actionedDocument.Id);
  }

  private _getValidationMessage() {
    if (this._actionedDocument.DocumentAction == DocumentActionType.RequiresRead)
      return this._readConfirmMessage;
    if (this._actionedDocument.DocumentAction == DocumentActionType.RequiresSign) {
      if (StringHelper.isNullOrUndefinedOrEmpty((this._actionedDocumentForm.get('employeeSignConfirm').value)))
        return this._signRequiredMessage;
      else
        return this._signConfirmMessage;
    }
  }


  private _isValidForm(): boolean {
    //in non sign mode form is valid if user has checkbox ticked
    if (this.isRequiresRead() && this._actionedDocumentForm.get('readActionConfirm').value == true)
      return true;
    if (this.isRequiresSign()) {
      //in this scenario use either should have given the signature box or signed on the canvas
      return !StringHelper.isNullOrUndefinedOrEmpty(this._actionedDocumentForm.get('employeeSignConfirm').value) && this._actionedDocumentForm.get('signActionConfirm').value;
    }
    return false;
  }


  private _prepareActionedDocumentPayload(): ActionedDocument {
    let actionedDocument: ActionedDocument = new ActionedDocument();
    actionedDocument.EmployeeId = this._claimsHelper.getEmpId();
    actionedDocument.ActionTakenOn = new Date();
    if (this._modeOfOPeration == DistributedDocumentsModeOfOperation.Documents) {
      actionedDocument.DocumentId = this._actionedDocument.Id;
      actionedDocument.DocumentVersion = this._actionedDocument.DocumentVersion;
      actionedDocument.DistributedDocumentId = this._actionedDocument.DistributeDocumentId;
      actionedDocument.Signature = this.isRequiresSign() ? this._actionedDocumentForm.get('employeeSignConfirm').value : null;
      return actionedDocument;
    }
    else if (this._modeOfOPeration == DistributedDocumentsModeOfOperation.SharedDocuments) {
      actionedDocument.SharedDocumentId = this._actionedDocument.Id;
      actionedDocument.SharedDocumentVersion = this._actionedDocument.DocumentVersion;
      actionedDocument.Signature = this.isRequiresSign() ? this._actionedDocumentForm.get('employeeSignConfirm').value : null;
      return actionedDocument;
    }
    return actionedDocument;
  }

  // End of private methods

  // Public methods

  public modalDocumentView() {
    this._onDocumentDownLoad();
  }

  public modalClosed(event: any) {
    if (event == "discard") {
      this.onDialogDisplayStatusChange.emit(false);
    }
    else if (event == "ok") {
      if (this._isValidForm()) {

        let actionedDocument = this._prepareActionedDocumentPayload();
        if (this._modeOfOPeration == DistributedDocumentsModeOfOperation.Documents) {
          this._store.dispatch(new CompanyDocumentsToReviewConfirmAction(actionedDocument));
          //reload the company documents stats
          this._store.dispatch(new LoadDocumentInformationBarSpecificStatAction({ employeeId: this._claimsHelper.getEmpId(), statisticIds: AeInformationBarItemType.DocumentsAwaiting.toString() }));
        }
        else if (this._modeOfOPeration == DistributedDocumentsModeOfOperation.SharedDocuments) {
          this._store.dispatch(new CompanyUsefulDocumentsToReviewConfirmAction(actionedDocument));
        }

        this.onDialogDisplayStatusChange.emit(true);
        //Here we need to save the actioned document and update the selected document or reload the grid
      }
      else {
        //Here show a proper message to the UI so that user will check and accept it
        this._showValidationMessage = true;
        this._validationMessage = this._getValidationMessage();
      }
    }
  }



  public needToShowValidationMessage(): boolean {
    return this._showValidationMessage;
  }

  public onSigned($event) {
    this._actionedDocumentForm.get('signActionConfirm').setValue(true);
  }
  public onClearSignature() {
    this.sigs.first.clear();
    this._actionedDocumentForm.get('signActionConfirm').setValue(false);
  }

  public isRequiresSign() {
    return this._actionedDocument.DocumentAction == 2;
  }
  public setCheckBoxConfirmTitle() {
    if (this._actionedDocument.DocumentAction == DocumentActionType.RequiresRead)
      return this._readActionConfirmMessage;
    if (this._actionedDocument.DocumentAction == DocumentActionType.RequiresSign)
      return this._signActionConfirmMessage;
  }


  public isRequiresRead() {
    return this._actionedDocument.DocumentAction == 1;
  }

  public setActionConfirmTitle() {
    if (this._actionedDocument.DocumentAction == DocumentActionType.RequiresRead)
      return this._actionedDocument.DocumentName + this._readActionConfirmTitle
    if (this._actionedDocument.DocumentAction == DocumentActionType.RequiresSign)
      return this._actionedDocument.DocumentName + this._signActionConfirmTitle;
  }

  private _doAllTranslations() {

    this._readConfirmMessage = this._translationService.translate('Document_Read_Acceptance');
    this._signConfirmMessage = this._translationService.translate('Document_Sign_Acceptance');
    this._signRequiredMessage = this._translationService.translate('Document_Sign_Enter_Valid_Signature');

    this._readActionConfirmMessage = this._translationService.translate('Document_Read_Action_Acceptance');
    this._signActionConfirmMessage = this._translationService.translate('Document_Sign_Action_Acceptance');

    this._readActionConfirmTitle = this._translationService.translate('Read_Confirmation_Action_Title');
    this._signActionConfirmTitle = this._translationService.translate('Sign_Confirmation_Action_Title');
  }

  ngOnInit(): void {
    this._initForm();
    this.setActionConfirmTitle();
    this.setCheckBoxConfirmTitle();
    this._doAllTranslations();
    this._translationChangeSub = this._translationService.translationChanged.subscribe(
      () => {
        this._doAllTranslations();
      }
    );
  }
  ngOnDestroy(): void {
    if (this._translationChangeSub) {
      this._translationChangeSub.unsubscribe();
    }
  }
  public ngAfterViewInit() {
    if (this.isRequiresSign())
      this.beResponsive();

  }

  // set the dimensions of the signature pad canvas
  public beResponsive() {
    this.size(this.sigContainer1.first, this.sigs.first);
    this.setOptions();
  }

  public size(container: ElementRef, sig: AeSignatureComponent) {
    sig.signaturePad.set('canvasWidth', container.nativeElement.clientWidth);
  }

  public setOptions() {
    this.sigs.first.signaturePad.set('penColor', 'rgb(74, 128, 169)');
    this.sigs.last.signaturePad.set('penColor', 'rgb(74, 128, 169)');
  }

  public clear() {
    this.sigs.first.clear();
    this.sigs.last.clear();
  }

  // End of public methods
}
