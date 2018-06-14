import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers';
import { CountyLoadAction } from './../../../../shared/actions/lookup.actions';
import { Observable, Subscription, BehaviorSubject, Subject } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { IncidentCompanyAddressDetailsGetAction } from './../../actions/incident.actions';
import { Site } from './../../../../shared/models/site.model';
import { EmployeeFullEntity } from './../../../../employee/models/employee-full.model';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { IncidentReportedBy } from './../../models/incident-reported-by.model';
import { Incident } from './../../models/incident.model';
import { AeWizardStep } from './../../../../atlas-elements/common/models/ae-wizard-step';
import { isNullOrUndefined } from 'util';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { RouteParams } from './../../../../shared/services/route-params';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbGroup } from './../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from './../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { AeWizardComponent } from "./../../../../atlas-elements/ae-wizard/ae-wizard.component";
import { IncidentFormField } from "../../models/incident-form-field";

@Component({
  selector: 'incident-container',
  templateUrl: './incident-container.component.html',
  styleUrls: ['./incident-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IncidentContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private variables - start
  private _counties$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _countySubscription: Subscription;
  private _companyAddress$: Observable<Site>;
  private _companyAddressSubscription: Subscription;
  private _incidentWizardSteps$: BehaviorSubject<Immutable.List<AeWizardStep>>;
  private _showDoneButtonStatus: boolean = false;
  private _onCompleteSubject: Subject<boolean>;
  private _routeParamsSubscription: Subscription;
  // Private variables - end

  public get incidentWizardSteps$() {
    return this._incidentWizardSteps$;
  }

  public get counties$() {
    return this._counties$;
  }

  public get companyAddress$() {
    return this._companyAddress$;
  }

  get onCompleteSubject() {
    return this._onCompleteSubject;
  }

  @ViewChild(AeWizardComponent)
  wizardComponent: AeWizardComponent;
  // constructor - start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _router: ActivatedRoute
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);
    this._onCompleteSubject = new Subject<boolean>();
  }
  // constructor - end

  // Public methods - start
  onComplete(data) {
    this._onCompleteSubject.next(data);
  }

  ngOnInit() {
    this._incidentWizardSteps$ = new BehaviorSubject<Immutable.List<AeWizardStep>>(Immutable.List([
      new AeWizardStep('Person reporting', '', 'step1', true, false, false, true, false),
      new AeWizardStep('About the incident', '', 'step2', true, false, false, true, true),
      new AeWizardStep('About the affected party', '', 'step3', true, false, false, true, true),
      new AeWizardStep('RIDDOR', '', 'step4', true, false, false, true, true),
      new AeWizardStep('Formal investigation', '', 'step5', true, false, false, true, true),

      new AeWizardStep('Preview', '', 'step6', true)
    ]));

    this._counties$ = this._store.let(fromRoot.getCountyImmutableData);
    this._countySubscription = this._counties$.subscribe(counties => {
      if (isNullOrUndefined(counties))
        this._store.dispatch(new CountyLoadAction(true));
    });

    this._companyAddress$ = this._store.let(fromRoot.getIncidentCompanyAddress);
    this._companyAddressSubscription = this._companyAddress$.subscribe(headOfficeSite => {
      if (headOfficeSite === undefined)
        this._store.dispatch(new IncidentCompanyAddressDetailsGetAction());
    });

    this._routeParamsSubscription = this._router.params.subscribe(params => {
      if (!isNullOrUndefined(params['id'])) {
        let bcItem = new IBreadcrumb('Edit', '/incident/edit/' + params['id'], BreadcrumbGroup.IncidentLog);
        this._breadcrumbService.add(bcItem);
      }
    });
  }

  ngOnDestroy() {
    if (this._countySubscription)
      this._countySubscription.unsubscribe();
    if (this._companyAddressSubscription)
      this._companyAddressSubscription.unsubscribe();
  }

  public getShowDoneButtonStatus() {
    return (this._claimsHelper.canApproveIncident() || this._claimsHelper.canManageIncidents()) && this._showDoneButtonStatus;
  }
  // Public methods - end

}
