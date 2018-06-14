import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';

import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeLoaderType } from './../../../../atlas-elements/common/ae-loader-type.enum';
import { IBreadcrumb } from './../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { AeWizardStep } from './../../../../atlas-elements/common/models/ae-wizard-step';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { RiskAssessmentStatus } from './../../../../risk-assessment/common/risk-assessment-status.enum';
import { BaseComponent } from './../../../../shared/base-component';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import { ConstructionPhasePlan, CPPAdditionalInfo, CPPEvent } from './../../../models/construction-phase-plans';
import {
  AddCPPAction,
  AddCPPClientDetailsAction,
  LoadCPPByIdAction,
  LoadCPPClientDetailsByIdAction,
  UpdateCPPAction,
  UpdateCPPClientDetailsAction,
} from './../../actions/manage-cpp.actions';

@Component({
  selector: 'manage-cpp-container',
  templateUrl: './manage-cpp-container.component.html',
  styleUrls: ['./manage-cpp-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageCppContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _cppWizardSteps$: BehaviorSubject<Immutable.List<AeWizardStep>>;
  private _routeParamsSubscription: Subscription;
  private _cppId: string;
  private _isExample: boolean;
  private _cppSubscription: Subscription;
  private _constructionPhasePlan$: Observable<ConstructionPhasePlan>;
  private _cppAdditionalInfo$: Observable<CPPAdditionalInfo>;
  private _constructionPhasePlan: ConstructionPhasePlan;
  private _isGeneralStepShown$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _cppLoadedSub: Subscription;
  private _cppLoaded: boolean;
  private _objectToSave: ConstructionPhasePlan;
  private _loaderBars: AeLoaderType = AeLoaderType.Spinner;
  private _showComplete: boolean = true;
  // End of Private Fields

  // Public properties
  get showComplete(): boolean {
    return this._showComplete;
  }
  get loaderBars(): AeLoaderType {
    return this._loaderBars;
  }
  get constructionPhasePlan$(): Observable<ConstructionPhasePlan> {
    return this._constructionPhasePlan$;
  }
  get constructionPhasePlan(): ConstructionPhasePlan {
    return this._constructionPhasePlan;
  }
  get cppId() {
    return this._cppId;
  }
  get isExample() {
    return this._isExample;
  }
  get isGeneralStepShown$(): BehaviorSubject<boolean> {
    return this._isGeneralStepShown$;
  }
  get cppAdditionalInfo$(): Observable<CPPAdditionalInfo> {
    return this._cppAdditionalInfo$;
  }
  get cppAddtionalInformation(): CPPAdditionalInfo {
    if (this._constructionPhasePlan)
      return this._constructionPhasePlan.CPPAdditionalInfo;
    return null;
  }
  get objectToSave() {
    return this._objectToSave;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.CPP;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectorRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: ActivatedRoute
    , private _route: Router
    , private _breadcrumbService: BreadcrumbService
  ) {
    super(_localeService, _translationService, _changeDetectorRef);
    // let bcItem = new IBreadcrumb('Add', '', BreadcrumbGroup.CPP);
    // this._breadcrumbService.add(bcItem);
  }
  // End of constructor

  // Private methods
  getCPPBannerTitle(): string {
    //TODO: here based on add or update mode appropriate title should be shown
    return this._constructionPhasePlan ? this._constructionPhasePlan.Name : this._translationService.translate('CPP_ADD.ADD_BANNER');
  }

  // End of private methods

  // Public methods
  public canGeneralStepBeShown(): boolean {
    return this._isGeneralStepShown$.value;
  }

  public onClientDetailsStepSave(cppAdditionalInfo: CPPAdditionalInfo) {
    //here we need to despatch the update action     
    if (cppAdditionalInfo.Id) {
      this._store.dispatch(new UpdateCPPClientDetailsAction(cppAdditionalInfo));
      // here i need to despatch the event to load the additional info by id..     
    } else {
      //in add mode we need to assign the method statement id to the object as well as contractors
      cppAdditionalInfo.Id = this._cppId;
      cppAdditionalInfo.Contractors.forEach(obj => {
        obj.CPPAdditionalInfoId = this._cppId;
      });
      this._store.dispatch(new AddCPPClientDetailsAction(cppAdditionalInfo));
    }
  }

  public onGeneralStepSave(objectToSave: ConstructionPhasePlan) {
    let endDate = new Date();
    let validCPPEvents: CPPEvent[] = [];
    if (!isNullOrUndefined(objectToSave.CPPEvents) &&
      objectToSave.CPPEvents.length > 0) {
      validCPPEvents = objectToSave.CPPEvents
        .filter(e => !isNullOrUndefined(e.StepDetail))
        .map(c => {
          c.Date = new Date(c.Date);
          return c;
        });

      let endDates = validCPPEvents.filter(e => e.Date.getDate() >= endDate.getDate()).map(c => c.Date).sort((a, b) => a.getTime() < b.getTime() ? 1 : -1);
      if (!isNullOrUndefined(endDates)) {
        endDate = endDates[0];
      }
    }

    objectToSave.EndDate = endDate;

    objectToSave.IsExample = false;// for now there are no examples
    this._objectToSave = objectToSave;
    if (this._cppId) {
      //here we need to despatch the update action..
      //despatch only when is not pristine to update
      if (!objectToSave.IsPristine)
        this._store.dispatch(new UpdateCPPAction(objectToSave));
      //load cpp additional information should be despatched 
      if (!this._cppLoaded) //only if not loaded previously
        this._store.dispatch(new LoadCPPClientDetailsByIdAction({ Id: objectToSave.Id, IsExample: objectToSave.IsExample }));
    } else {
      //here we need to despatch the add action..
      //here in add mode... StatusId should be set to 1 for non example and 0 for examples
      objectToSave.StatusId = (objectToSave.IsExample ? RiskAssessmentStatus.Example : RiskAssessmentStatus.Pending);
      this._store.dispatch(new AddCPPAction(objectToSave));
    }
  }

  public onSupportingEvidenceStepDone($event) {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    }
    this._route.navigate(['/construction-phase-plan'], navigationExtras);
  }

  ngOnInit() {
    // const breadCrumbItem: IBreadcrumb = { label: 'Construction phase plan', url: '/construction-phase-plan' };
    // this._breadcrumbService.add(breadCrumbItem);
    this._cppWizardSteps$ = new BehaviorSubject<Immutable.List<AeWizardStep>>(Immutable.List([
      new AeWizardStep('General', '', 'generalStep', false),
      new AeWizardStep('Client details', '', 'clientDetailsStep', false),
      new AeWizardStep('Supporting evidence', '', 'supportingEvidenceStep', true, false, false, false, false, false)
    ]));

    this._cppAdditionalInfo$ = this._store.let(fromRoot.getCPPAdditionalInfoData);

    this._cppSubscription = this._store.let(fromRoot.getCPPData).combineLatest(this._router.params, (cpp$, routeParams$) => {
      return { cpp: cpp$, routeParams: routeParams$ };
    }).subscribe((vl) => {
      if (vl.routeParams && !isNullOrUndefined(vl.routeParams['id']) && isNullOrUndefined(vl.cpp)) {
        this._cppId = vl.routeParams['id'];
        //here despatch action to get by id if value is available...
        //subscribe to the store method statement and patch the form so that in edit mode it can be bound with actual values..
        this._store.dispatch(new LoadCPPByIdAction({ Id: this._cppId, IsExample: false })); // as of now sending is example false
      }
      if (isNullOrUndefined(vl.routeParams['id'])) {
        let bcItem = new IBreadcrumb('Add', '/construction-phase-plan/add', BreadcrumbGroup.CPP);
        this._breadcrumbService.add(bcItem);

        // no route params found meaning in add mode , just show the general step
        this._isGeneralStepShown$.next(true);
        this._cdRef.markForCheck();
      }
      //update mode show only after we get the object from the store
      if (vl.cpp) {
        this._constructionPhasePlan = vl.cpp;
        this._cppId = this._constructionPhasePlan.Id;
        this._isExample = this._constructionPhasePlan.IsExample;
        if (!this._isGeneralStepShown$.value) {
          this._isGeneralStepShown$.next(true);
          this._cdRef.markForCheck();
        }

        // let bcItem = new IBreadcrumb(this._constructionPhasePlan.Name, '', BreadcrumbGroup.CPP);
        // this._breadcrumbService.add(bcItem);
      }

    });

    this._cppLoadedSub = this._store.let(fromRoot.getHasCPPAdditionalInfoLoadedData).subscribe((loaded) => {
      this._cppLoaded = loaded;
    });

  }
  ngOnDestroy() {
    if (this._cppSubscription) {
      this._cppSubscription.unsubscribe();
    }
    if (this._routeParamsSubscription) {
      this._routeParamsSubscription.unsubscribe();
    }
    if (this._cppLoadedSub) {
      this._cppLoadedSub.unsubscribe();
    }
  }

  // End of public methods

}
