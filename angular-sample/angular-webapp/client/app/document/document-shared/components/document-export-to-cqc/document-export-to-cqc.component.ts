import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy, Input, ViewEncapsulation } from "@angular/core";
import { ExportToCQC, CQCCategories, CQCStandards } from "../../../document-details/models/export-to-cqc-model";
import { BaseComponent } from "../../../../shared/base-component";
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { FormBuilder, FormGroup, FormArray } from "@angular/forms";
import * as fromRoot from './../../../../shared/reducers';
import { IFormBuilderVM, IFormFieldWrapper } from "../../../../shared/models/iform-builder-vm";
import { Observable, BehaviorSubject } from "rxjs/Rx";
import { DocumentDetails } from "../../../document-details/models/document-details-model";
import { ExportToCQCForm, CQCValidations } from "../../../document-details/models/export-to-cqc.form";
import * as Immutable from 'immutable';
import { AeSelectItem } from "../../../../atlas-elements/common/models/ae-select-item";
import { isNullOrUndefined } from "util";
import { LoadCQCCategoriesBySiteIdAction, LoadCQCStandardsBySiteIdAction, LoadCQCFiletypesBySiteIdAction, LoadCQCUsersBySiteIdAction, CQCPolicyCheckBySiteIdAction } from "../../../document-details/actions/document-export-to-cqc.actions";
import { Subscription } from "rxjs/Subscription";
import { StringHelper } from "../../../../shared/helpers/string-helper";
import { DocumentExporttocqcService } from "../../../document-details/services/document-export-to-cqc.service";
import { CommonValidators } from "../../../../shared/validators/common-validators";

@Component({
  selector: "document-export-to-cqc",
  templateUrl: "./document-export-to-cqc.component.html",
  styleUrls: ["./document-export-to-cqc.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class DocumentExporttocqcComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private fields
  private _addUpdateExportToCQCProForm: FormGroup;
  private _submitted: boolean = true;
  private _standardsSubmitted: boolean = true;
  private _formName: string;
  private _addUpdateExportToCQCProFormVM: IFormBuilderVM;
  private _ExportToCQCProToSave: ExportToCQC = new ExportToCQC();
  private _fields: Array<IFormFieldWrapper<any>>;
  private _formFields: IFormFieldWrapper<any>[];
  private _documentDetails: DocumentDetails;
  private _cqcSites: Immutable.List<AeSelectItem<string>>;
  private _cqcUsers$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _cqcFileTypes$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _cqcStandards$: Observable<CQCStandards[]>;
  private _cqcCategories$: Observable<CQCCategories[]>;
  private _cqcStandards: CQCStandards[];
  private _cqcCategories: CQCCategories[];
  private _cqcSitesSubscription: Subscription;
  private _cqcStandardsSubscription: Subscription;
  private _cqcCategoriesSubscription: Subscription;
  private _commonForm: FormGroup;
  private _requiredStandards: boolean = false;
  private _checkReferenceExist: boolean = false;
  private _selectedSiteId: string;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _cqcProFormValueChangeSubscription: Subscription;
  private _siteIdValueChangeSubscription: Subscription;
  private _referenceValueChangeSubscription: Subscription;
  // End of Private Fields

  // Public properties

  // End of Public properties
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , protected _store: Store<fromRoot.State>
    , private _fb: FormBuilder
    , private _cqcProService: DocumentExporttocqcService

  ) {
    super(_localeService, _translationService, _cdRef);

  }

  // Public Output bindings
  @Output('onCQCCancel')
  _onCQCCancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('onCQCSubmit')
  _onCQCSubmit: EventEmitter<any> = new EventEmitter<any>();
  // End of Public Output bindings


  @Input('documentDetails')
  set DocumentDetails(val: DocumentDetails) {
    this._documentDetails = val;
  }
  get DocumentDetails() {
    return this._documentDetails;
  }

  private _initCQCStd(standards: CQCStandards) {
    return this._fb.group({
      Id: [{ value: standards.Id, disabled: false }],
      Title: [{ value: standards.Title, disabled: false }],
      IsSelected: [{ value: standards.IsSelected, disabled: false }],
    });
  }

  private _initCQCCat(categories: CQCCategories) {
    return this._fb.group({
      CatId: [{ value: categories.CatId, disabled: false }],
      CatName: [{ value: categories.CatName, disabled: false }],
      CatIsSelected: [{ value: categories.CatIsSelected, disabled: false }],
    });
  }

  private _bindLookUpData(siteId) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(siteId)) {
      this._store.dispatch(new CQCPolicyCheckBySiteIdAction(siteId));
      this._store.dispatch(new LoadCQCStandardsBySiteIdAction(siteId));
      this._store.dispatch(new LoadCQCCategoriesBySiteIdAction(siteId));
      this._store.dispatch(new LoadCQCUsersBySiteIdAction(siteId));
      this._store.dispatch(new LoadCQCFiletypesBySiteIdAction(siteId));
    }
  }

  get checkReferenceExist() {
    return this._checkReferenceExist;
  }

  get formButtonNames() {
    return { Submit: 'Attach' };
  }

  get title() {
    return "CQC_PRO_TITLE";
  }

  get requiredStandards() {
    return this._requiredStandards;
  }

  get addUpdateExportToCQCProFormVM(): IFormBuilderVM {
    return this._addUpdateExportToCQCProFormVM;
  }

  get commonForm(): FormGroup {
    return this._commonForm;
  }

  get cqcStandards(): CQCStandards[] {
    return this._cqcStandards;
  }

  get cqcCategories(): CQCCategories[] {
    return this._cqcCategories;
  }

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  get submitted() {
    return this._submitted;
  }

  get standardsSubmitted() {
    return this._standardsSubmitted;
  }

  get fields() {
    return this._fields;
  }

  get cqcUsers$() {
    return this._cqcUsers$;
  }

  get cqcFileTypes$() {
    return this._cqcFileTypes$;
  }

  get addUpdateExportToCQCProForm() {
    return this._addUpdateExportToCQCProForm;
  }
  ngOnInit() {

    this._commonForm = this._fb.group({
      Standards: this._fb.array([]),
      Categories: this._fb.array([])
    });

    this._cqcSitesSubscription = this._store.let(fromRoot.getCQCSites).subscribe(sites => {
      if (!isNullOrUndefined(sites)) {
        this._cqcSites = sites;
      }
    });

    this._cqcFileTypes$ = this._store.let(fromRoot.getCQCFileTypesBySiteId);
    this._cqcUsers$ = this._store.let(fromRoot.getCQCUsersBySiteId);

    this._cqcStandardsSubscription = this._store.let(fromRoot.getCQCStandardsBySiteId).subscribe(std => {
      if (!isNullOrUndefined(std) && !isNullOrUndefined(this._selectedSiteId)) {
        this._cqcStandards = std;

        this._commonForm.controls['Standards'] = this._fb.array([]);
        let formArray = <FormArray>this._commonForm.controls['Standards'];
        this._cqcStandards.forEach(stnd => {
          formArray.push(this._initCQCStd(stnd));
        });
        for (let formGroupIndex in formArray.controls) {
          let formGroup = <FormGroup>formArray.controls[formGroupIndex];
          for (let name in formGroup.controls) {
            let element = formGroup.controls[name];
            element.valueChanges.subscribe((value) => {
              this._cqcStandards[formGroupIndex][name] = value;
              this._commonForm.updateValueAndValidity();
            });
          }
        }
      }
    });

    this._cqcCategoriesSubscription = this._store.let(fromRoot.getCQCCategoriesBySiteId).subscribe(cat => {
      if (!isNullOrUndefined(cat) && !isNullOrUndefined(this._selectedSiteId)) {
        this._cqcCategories = cat;

        this._commonForm.controls['Categories'] = this._fb.array([]);
        let formArray = <FormArray>this._commonForm.controls['Categories'];
        this._cqcCategories.forEach(cat => {
          formArray.push(this._initCQCCat(cat));
        });
        for (let formGroupIndex in formArray.controls) {
          let formGroup = <FormGroup>formArray.controls[formGroupIndex];
          for (let name in formGroup.controls) {
            let element = formGroup.controls[name];
            element.valueChanges.subscribe((value) => {
              this._cqcCategories[formGroupIndex][name] = value;
              this._commonForm.updateValueAndValidity();
            });
          }
        }
      }
    });

    this._formName = 'addForm';
    this._ExportToCQCProToSave.SiteId = this._cqcSites.filter(x => x.Value == this._documentDetails.SiteId).count() > 0 ? this._documentDetails.SiteId : "";
    this._ExportToCQCProToSave.PolicyFile = this._documentDetails.FileName;
    this._ExportToCQCProToSave.FileStorageIdentifier = this._documentDetails.FileStorageIdentifier;
    this._selectedSiteId = this._ExportToCQCProToSave.SiteId;
    this._bindLookUpData(this._ExportToCQCProToSave.SiteId);
    this._addUpdateExportToCQCProFormVM = new ExportToCQCForm(this._formName, this._ExportToCQCProToSave, this._cqcProService);
    this._fields = this._addUpdateExportToCQCProFormVM.init();
    let siteField = this._fields.find(f => f.field.name === 'SiteId');
    <BehaviorSubject<Immutable.List<AeSelectItem<string>>>>siteField.context.getContextData().get('options').next(this._cqcSites);

    let fileTypeField = this._fields.find(f => f.field.name === 'FileTypeId');
    this._cqcFileTypes$.subscribe(<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>fileTypeField.context.getContextData().get('options'));
    let userField = this._fields.find(f => f.field.name === 'OwnerId');
    this._cqcUsers$.subscribe(<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>userField.context.getContextData().get('options'));
    let PolicyFileField = this._fields.find(f => f.field.name === 'PolicyFile');
    PolicyFileField.context.getContextData().get('displayValue').next(this._ExportToCQCProToSave.PolicyFile);

  }

  submitStatus() {
    if (!this._submitted) {
      if (this._submitted == this._standardsSubmitted) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
  onChangeStandards(event) {
    if (this._cqcStandards.filter(x => x.IsSelected == true).length > 0) {
      this._standardsSubmitted = false;
    } else {
      this._standardsSubmitted = true;
    }
  }

  onFormInit(fg: FormGroup) {
    this._addUpdateExportToCQCProForm = fg;
    let todayDate = new Date();

    this._addUpdateExportToCQCProForm.get('ExpiryDate').setValidators(CQCValidations.expiryDateValidations(new Date(), (base, target) => {
      if (target >= base) {
        return false;
      } else {
        return true;
      }

    }));
    this._addUpdateExportToCQCProForm.updateValueAndValidity();

    this._cqcProFormValueChangeSubscription = this._addUpdateExportToCQCProForm.valueChanges.takeUntil(this._destructor$).subscribe((val) => {
      if (this._addUpdateExportToCQCProForm.valid) {
        this._submitted = false;
      }
    });

    this._siteIdValueChangeSubscription = this._addUpdateExportToCQCProForm.get('SiteId').valueChanges.takeUntil(this._destructor$).subscribe((val) => {
      if (!StringHelper.isNullOrUndefinedOrEmpty(val)) {
        this._selectedSiteId = val;
        this._bindLookUpData(val);
      }
    });

    this._referenceValueChangeSubscription = this._addUpdateExportToCQCProForm.get('Reference').valueChanges.takeUntil(this._destructor$).subscribe((val) => {
      if (!StringHelper.isNullOrUndefinedOrEmpty(val)) {
        if (val.length >= 5) {
          this._addUpdateExportToCQCProForm.get('Reference').setValidators(CQCValidations.checkReference(this._addUpdateExportToCQCProForm.get('SiteId'), this._cqcProService));
        }
      }
    });

  }

  onCancel(e) {
    this._addUpdateExportToCQCProForm.reset(); //clear form.
    this._commonForm.reset();
    this._onCQCCancel.emit(true);
  }

  onSubmit($event) {
    var selcategories = this._cqcCategories.filter(x => x.CatIsSelected == true).map(function (item) { return item.CatId; }).join();
    var selStandards = this._cqcStandards.filter(x => x.IsSelected == true).map(function (item) { return item.Id; }).join();

    if (!StringHelper.isNullOrUndefinedOrEmpty(selStandards)) {
      this._requiredStandards = false;
    }
    else {
      this._requiredStandards = true;
    }

    if (this._addUpdateExportToCQCProForm.valid && !this._requiredStandards && !this._checkReferenceExist) {
      let formData: ExportToCQC = Object.assign({}, this._ExportToCQCProToSave, <ExportToCQC>this._addUpdateExportToCQCProForm.value);
      let exportToCQCProToSave: any = new Object();
      exportToCQCProToSave.FileStorageIdentifier = formData.FileStorageIdentifier;
      exportToCQCProToSave.SiteId = formData.SiteId;
      exportToCQCProToSave.category_id = selcategories;
      exportToCQCProToSave.expiry_date = formData.ExpiryDate;
      exportToCQCProToSave.outcome_id = selStandards;
      exportToCQCProToSave.owner_id = formData.OwnerId;
      exportToCQCProToSave.policy_file = formData.PolicyFile;
      exportToCQCProToSave.reference = formData.Reference;
      exportToCQCProToSave.title = formData.Title;
      exportToCQCProToSave.file_type_id = formData.FileTypeId;
      this._onCQCSubmit.emit(exportToCQCProToSave);
      this._addUpdateExportToCQCProForm.reset(); //clear form.
      this._commonForm.reset();
    }
  }

stringToHTML(text) : any {
    return StringHelper.stringToHTML(text);
}

  ngOnDestroy() {
    if (!isNullOrUndefined(this._cqcStandardsSubscription)) {
      this._cqcStandardsSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._cqcSitesSubscription)) {
      this._cqcSitesSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._cqcCategoriesSubscription)) {
      this._cqcCategoriesSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._cqcProFormValueChangeSubscription)) {
      this._cqcProFormValueChangeSubscription.unsubscribe();
    }

    super.ngOnDestroy();

  }

}
