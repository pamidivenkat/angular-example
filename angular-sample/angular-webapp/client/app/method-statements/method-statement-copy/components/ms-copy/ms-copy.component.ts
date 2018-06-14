import { CommonValidators } from './../../../../shared/validators/common-validators';
import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy, Output, EventEmitter } from "@angular/core";
import { TranslationService, LocaleService } from "angular-l10n";
import { ClaimsHelperService } from "./../../../../shared/helpers/claims-helper";
import { Store } from "@ngrx/store";
import { MethodStatements, MethodStatement } from "./../../../../method-statements/models/method-statement";
import { BaseComponent } from "./../../../../shared/base-component";
import * as fromRoot from './../../../../shared/reducers';
import { Subscription, BehaviorSubject } from "rxjs/Rx";
import { IFormBuilderVM, IFormFieldWrapper } from "./../../../../shared/models/iform-builder-vm";
import { FormGroup } from "@angular/forms";
import * as Immutable from 'immutable';
import { AeSelectItem } from "./../../../../atlas-elements/common/models/ae-select-item";
import { MethodStatementCopyForm } from "./../../../../method-statements/models/ms-copy.form";
import { isNullOrUndefined } from "util";
import { createSelectOptionFromArrayList } from "./../../../../employee/common/extract-helpers";
import { LoadSitesAction } from "./../../../../shared/actions/company.actions";
import { CopyMethodStatementAction } from "./../../../../method-statements/actions/methodstatements.actions";
import { RouteParams } from "./../../../../shared/services/route-params";
import { LoadCompanyStructureAction } from "./../../../../root-module/actions/company-structure.actions";
import { CompanySiteView } from "./../../../../root-module/models/company-site-view";


@Component({
  selector: "ms-copy",
  templateUrl: "./ms-copy.component.html",
  styleUrls: ["./ms-copy.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MsCopyComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _methodStatement: MethodStatements = new MethodStatements();
  private _methodStatementCopied: MethodStatement = new MethodStatement();
  private _showCompanyDropDown: boolean = false;
  private _isSingleCompany: boolean;
  private _context: any;
  private _isExample: any;
  private _sitesSubscription: Subscription;
  private _methodStatementCopyFormVM: IFormBuilderVM;
  private _formName: string;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _msCopyForm: FormGroup;
  private _msSubscription: Subscription;
  private _siteOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _sitesList: Immutable.List<AeSelectItem<string>>;
  private _isAdmin: boolean;
  private _companyOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _isCopyToSameCompany: boolean = true;
  private _allSites: CompanySiteView[];
  private _currentCompanyId: string;
  private _siteLocationVisibility: BehaviorSubject<boolean>;
  private _companyIdValueChangesSubscription: Subscription;
  private _siteidValueChangesSubscription: Subscription;

  // End of Private Fields

  // Public properties
  get msCopyForm(){
    return this._msCopyForm;
  }
  get methodStatementCopyFormVM(): IFormBuilderVM {
    return this._methodStatementCopyFormVM;
  }

  @Input('methodStatement')
  get vm() {
    return this._methodStatement;
  }
  set vm(value: MethodStatements) {
    this._methodStatement = value;
  }

  // End of Public properties

  // Public Output bindings

  // Public Output bindings
  @Output('cancel') onCopyCancel: EventEmitter<string>;
  @Output('copyMs') onCopy: EventEmitter<MethodStatement> = new EventEmitter<MethodStatement>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _routeParams: RouteParams
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this.onCopyCancel = new EventEmitter<string>();
  }
  // End of constructor


  ngOnInit() {
    this._isAdmin = (this._claimsHelper.canCreateExampleMS() || this._claimsHelper.isAdministrator()) && (isNullOrUndefined(this._routeParams.Cid));
    this._showCompanyDropDown = this._claimsHelper.canCopyMethodStatementToCompany();
    this._methodStatementCopied.Id = this._methodStatement.Id;
    this._methodStatementCopied.Name = this._methodStatement.Name;
    this._methodStatementCopied.StartDate = this._methodStatement.StartDate;
    this._methodStatementCopied.EndDate = this._methodStatement.EndDate;
    this._methodStatementCopied.SiteId = this._methodStatement.SiteId;
    this._methodStatementCopied.IsExample = this._methodStatement.IsExample;
    this._methodStatementCopied.CompanyId = this._methodStatement.CompanyId;
    this._methodStatementCopied.NewLocationOfWork = this._methodStatement.NewLocationOfWork;
    this._formName = 'msCopyForm';
    this._methodStatementCopyFormVM = new MethodStatementCopyForm(this._formName, this._methodStatementCopied, this._isAdmin, this._showCompanyDropDown);
    this._formFields = this._methodStatementCopyFormVM.init();
    this._currentCompanyId = this._claimsHelper.getCompanyId();

    let siteField = this._formFields.find(f => f.field.name === 'SiteId');
    if (!isNullOrUndefined(siteField)) {
      this._siteOptions$ = siteField.context.getContextData().get('options');
      //Subscription to get Site Location Option Data, using existing effect
      this._sitesSubscription = this._store.let(fromRoot.getSiteStructureData).takeUntil(this._destructor$).subscribe((sites) => {
        if (!isNullOrUndefined(sites)) {
          this._allSites = sites.sort((a, b) => a.Name.localeCompare(b.Name));
          let sitesList = createSelectOptionFromArrayList(sites, "Id", "Name");
          sitesList.push(new AeSelectItem<string>('New Location of Work', '9999'));
          this._sitesList = Immutable.List<AeSelectItem<string>>(sitesList);
          this._siteOptions$.next(this._sitesList);
        } else {
          this._store.dispatch(new LoadCompanyStructureAction(true));
        }
      });
    }
    if (this._showCompanyDropDown) {
      let companyField = this._formFields.find(f => f.field.name === 'CompanyId');
      if (!isNullOrUndefined(companyField)) {
        this._companyOptions$ = companyField.context.getContextData().get('options');
        this._store.let(fromRoot.getCompanyStructureData).takeUntil(this._destructor$).subscribe((companies) => {
          if (!isNullOrUndefined(companies)) {
            let allCompanies = companies.sort((a, b) => a.Name.localeCompare(b.Name));
            this._isSingleCompany = allCompanies.length < 2 ? true : false;
            let companiesList = createSelectOptionFromArrayList(allCompanies, "Id", "Name");
            this._companyOptions$.next(Immutable.List<AeSelectItem<string>>(companiesList));
            if (!this._isAdmin) {
              this._getCompanySites(this._currentCompanyId);
            }
          } else {
            this._store.dispatch(new LoadCompanyStructureAction(true));
          }
        });
      }
    }
  }

  private _getCompanySites(_siteId) {
    let selectedCompanySites = this._allSites.filter(obj => obj.ParentId.toLocaleLowerCase() === _siteId.toLowerCase());
    let sitesList = createSelectOptionFromArrayList(selectedCompanySites, "Id", "Name");
    sitesList.push(new AeSelectItem<string>('New Location of Work', '9999'));
    this._siteOptions$.next(Immutable.List<AeSelectItem<string>>(sitesList));
  }

  onFormInit(fg: FormGroup) {
    this._msCopyForm = fg;
    
    if (!this._isAdmin) {
      this._msCopyForm.get('EndDate').setValidators(CommonValidators.dateCompare(this._msCopyForm.get('StartDate'), (base, target) => {
        if (target > base) {
          return false;
        } else {
          return true;
        }

      }));
    }

    if (!isNullOrUndefined(this._msCopyForm.get('CompanyId'))) {
      this._companyIdValueChangesSubscription = this._msCopyForm.get('CompanyId').valueChanges.subscribe((newVal) => {
        if (newVal) {
          this._isCopyToSameCompany = (newVal == this._methodStatement.CompanyId) ? true : false;
          this._getCompanySites(newVal);
          this._msCopyForm.get('SiteId').setValue('');
        }
      });
    }
    let siteLocationField = this._formFields.find(f => f.field.name === 'NewLocationOfWork');
    if (!isNullOrUndefined(siteLocationField)) {
      this._siteLocationVisibility = <BehaviorSubject<boolean>>siteLocationField.context.getContextData().get('propertyValue');
      this._siteLocationVisibility.next(false);
    }
    if (!isNullOrUndefined(this._msCopyForm.get('SiteId'))) {
      if (this._methodStatementCopied.SiteId === null && !isNullOrUndefined(this._methodStatementCopied)) {
        this._msCopyForm.get('SiteId').setValue(9999);
        this._siteLocationVisibility.next(true);
        this._msCopyForm.get('NewLocationOfWork').setValue(this._methodStatementCopied.NewLocationOfWork);
      }
      this._siteidValueChangesSubscription = this._msCopyForm.get('SiteId').valueChanges.subscribe((newVal) => {
        if (newVal === '9999') {
          this._siteLocationVisibility.next(true);
        }
        else {
          this._siteLocationVisibility.next(false);
        }
      });
    }
  }

  onSubmit($event) {
    if (this._msCopyForm.valid) {
      let msToCopy: any = Object.assign({}, this._methodStatementCopied, <MethodStatement>this._msCopyForm.value);
      msToCopy.IsExample = this._isAdmin;
      msToCopy.copyToDifferentCompany = (this._isCopyToSameCompany || this._isSingleCompany) ? false : true;
      if (!isNullOrUndefined(this._msCopyForm.get('CompanyId'))) {
        msToCopy.CompanyId = this._msCopyForm.get('CompanyId').value || this._currentCompanyId;
      } else {
        msToCopy.CompanyId = this._currentCompanyId;
      }

         this.onCopy.emit(msToCopy);
         this._msCopyForm.reset(); //clear form.
    }
  }

  onCancel(e) {
    //below is to avoid the null exception getting because of this subscription newsitelocation field getting visible false
    if (this._siteidValueChangesSubscription) {
      this._siteidValueChangesSubscription.unsubscribe();
    }
    this.onCopyCancel.emit('Cancel');
    this._msCopyForm.reset(); //clear form.
  }

  formButtonNames() {
    return { Submit: 'Copy' };
  }

  // Public methods
  onFormValidityChange(status: boolean) {
    this._context.isValidEvent.emit(status);
  }


  ngOnDestroy() {
    super.ngOnDestroy();
    if (this._siteidValueChangesSubscription) {
      this._siteidValueChangesSubscription.unsubscribe();
    }
    if (this._companyIdValueChangesSubscription) {
      this._companyIdValueChangesSubscription.unsubscribe();
    }
    if (this._sitesSubscription)
      this._sitesSubscription.unsubscribe();
  }
}