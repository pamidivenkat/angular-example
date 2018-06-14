import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { DocumentActionType } from '../../../models/document';
import { DistributeModel } from '../../../document-details/models/document-details-model';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { isNullOrUndefined } from 'util';
import { Artifact } from '../../../models/artifact';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, Input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import * as Immutable from 'immutable';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'contract-distribute-action',
  templateUrl: './contract-distribute-action.component.html',
  styleUrls: ['./contract-distribute-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ContractDistributeActionComponent extends BaseComponent implements OnInit, OnDestroy {
  private _documentTitle: string;
  private _employeeGroup: string;
  private _actionOptions: Immutable.List<AeSelectItem<number>>
  private _documentDistributeForm: FormGroup;
  private _defaultDistributeAction: DocumentActionType = DocumentActionType.RequiresRead;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  // End of Private Fields

  // Public properties
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  
  @Input('options')
  get actionOptions(): Immutable.List<AeSelectItem<number>> {
    return this._actionOptions;
  }

  set actionOptions(actions: Immutable.List<AeSelectItem<number>>) {
    this._actionOptions = actions;
  }

  @Input('title')
  get documentTitle(): string {
    return this._documentTitle;
  }

  set documentTitle(docTitle: string) {
    this._documentTitle = docTitle;
  }

  @Input('employeeGroup')
  get employeeGroup(): string {
    return this._employeeGroup;
  }

  set employeeGroup(empGroup: string) {
    this._employeeGroup = empGroup;
  }

  get documentDistributeForm(): FormGroup {
    return this._documentDistributeForm;
  }

  @Output('aeCancel')
  aeCancel: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output('aeDocumentAction')
  aeDocumentAction: EventEmitter<DocumentActionType> = new EventEmitter<DocumentActionType>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder) {
    super(_localeService, _translationService, _cdRef);
  }

  private _initForm() {
    this._documentDistributeForm = this._fb.group({
      Action: [{ value: this._defaultDistributeAction, disabled: false }],
    });
  }

  slideClose($event) {
    this.aeCancel.emit($event);
  }

  distributeActionClick() {
    if (this._documentDistributeForm.valid) {
      let documentAction: DocumentActionType = this._documentDistributeForm.value['Action'];

      this.aeDocumentAction.emit(documentAction);

    }
  }
  
  ngOnInit() {
    this._initForm();
  }

  ngOnDestroy() {

  }

}
