import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { AddUpdateHelpContentFormFieldWrapper, AddUpdateHelpContentForm } from "../../models/add-update-help-content-form";
import { FormBuilder, FormGroup, FormArray } from "@angular/forms";
import { LocaleService, TranslationService } from "angular-l10n";
import { BaseComponent } from "../../../shared/base-component";
import { Subscription } from "rxjs/Subscription";
import { isNullOrUndefined } from "util";
import { MessengerService } from "../../../shared/services/messenger.service";
import { ClaimsHelperService } from "../../../shared/helpers/claims-helper";
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../shared/reducers';
import { ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { IFormBuilderVM } from "../../../shared/models/iform-builder-vm";
import { BehaviorSubject } from "rxjs/Rx";
import * as Immutable from 'immutable';
import { AeSelectItem } from "../../../atlas-elements/common/models/ae-select-item";
import { AeDataActionTypes } from "../../../employee/models/action-types.enum";
import { HelpContent } from "../../models/helpArea";
import { extractHealpAreaToAeSelectItems } from "../../common/help-helper";
import { LoadHelpAreasAction } from "../../../shared/actions/lookup.actions";

@Component({
  selector: 'add-update-help-content',
  templateUrl: './add-update-help-content.component.html',
  styleUrls: ['./add-update-help-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUpdateHelpContentComponent extends BaseComponent implements OnInit, OnDestroy {
  private _fields: Array<AddUpdateHelpContentFormFieldWrapper<any>>;
  private _helpContentForm: FormGroup;
  private _helpContentFormVM: IFormBuilderVM;
  private _formName: string;
  private _helpAreaList$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _helpAreaList: Immutable.List<AeSelectItem<string>[]>;
  private _action: string;
  private _isFormSubmitted: boolean;
  private _selectedHelpContent: HelpContent;
  private _helpAreaSubscription: Subscription;

  @Input('selectedHelpContent')
  set selectedHelpContent(val: HelpContent) {
    this._selectedHelpContent = val;
  }
  get selectedHelpContent() {
    return this._selectedHelpContent;
  }
  

  @Input('action')
  get action() {
    return this._action;
  }
  set action(val: string) {
    this._action = val;
  }
  @Output('addUpdateHelpContentSubmit')
  private _addUpdateHelpContentSubmit: EventEmitter<any> = new EventEmitter<any>();

  @Output('slideOutClose')
  private _slideOutClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _messenger: MessengerService
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder) {
    super(_localeService, _translationService, _cdRef);
  }
  get helpContentsFormVM(): IFormBuilderVM {
    return this._helpContentFormVM;
  }

  ngOnInit() {
    this._formName = 'add-update-help-content-form';
    this._helpContentFormVM = new AddUpdateHelpContentForm(this._formName);
    this._fields = this._helpContentFormVM.init();
    this._bindDropdownData();
  }
  onFormInit(fg: FormGroup) {
    this._helpContentForm = fg;
    if (this._action === AeDataActionTypes.Update) {
      this._helpContentForm.get('Title').setValue(this._selectedHelpContent.Title);
      this._helpContentForm.get('HelpAreaId').setValue(this._selectedHelpContent.HelpAreaId);
      this._helpContentForm.patchValue({ PublishDate: this._selectedHelpContent.PublishDate == null ? null : new Date(this._selectedHelpContent.PublishDate), });
      this._helpContentForm.get('Body').setValue(this._selectedHelpContent.Body);
    }
  }
  onUpdateFormSubmit(e) {
    this._isFormSubmitted = true;
    if (this._helpContentForm.valid) {
      this._addUpdateHelpContentSubmit.emit(e);
    }
  }
  onUpdateFormClosed(e) {
    this._slideOutClose.emit(false);
  }

  private _bindDropdownData() {
    let helpAreaField = this._fields.find(f => f.field.name === 'HelpAreaId');
    if (!isNullOrUndefined(helpAreaField)) {
      this._helpAreaList$ = helpAreaField.context.getContextData().get('options');
      this._helpAreaSubscription = this._store.let(fromRoot.getHelpAreasData).takeUntil(this._destructor$).subscribe((res) => {
        if (!isNullOrUndefined(res)) {
          this._helpAreaList$.next(Immutable.List<AeSelectItem<string>>(extractHealpAreaToAeSelectItems(res)));
        }
        else {
          this._store.dispatch(new LoadHelpAreasAction({ currentPage: 1, direction: 'asc', fields: 'Id,Name', pageNumber: 0, pageSize: 0, sortField: 'Name' }));
        }
      });

    }
  }
  isAddForm() {
    return this._action == AeDataActionTypes.Add;
  }

  isUpdateForm() {
    return this._action == AeDataActionTypes.Update;
  }
  ngOnDestroy() {
    super.ngOnDestroy();
  }

}
