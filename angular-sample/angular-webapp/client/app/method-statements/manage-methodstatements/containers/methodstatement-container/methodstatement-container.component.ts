import { LocalizationConfig } from './../../../../shared/localization-config';
import { initLocalizationWithAdditionProviders } from '../../../../shared/localization-config';
import { MethodStatement, MethodStatements } from './../../../models/method-statement';
import { LoadMethodStatementByIdAction, UpdateMethodStatementAction, AddMethodStatementAction } from './../../actions/manage-methodstatement.actions';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs/Subscription';
import { AeWizardStep } from './../../../../atlas-elements/common/models/ae-wizard-step';
import { BehaviorSubject } from 'rxjs/Rx';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from './../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeLoaderType } from './../../../../atlas-elements/common/ae-loader-type.enum';

@Component({
  selector: 'methodstatement-container',
  templateUrl: './methodstatement-container.component.html',
  styleUrls: ['./methodstatement-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MethodstatementContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _methodStatementsWizardSteps$: BehaviorSubject<Immutable.List<AeWizardStep>>;
  private _routeParamsSubscription: Subscription;
  private _routeSubscription: Subscription;
  private _methodStatementId: string;
  private _isExample: boolean = false;
  private _methodStatementSubscription: Subscription;
  private _methodStatement: MethodStatement;
  private _showComplete: boolean = false;
  private _wizardCanBeShown:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
   private _loaderBars: AeLoaderType = AeLoaderType.Spinner;
  // End of Private Fields

  // Public properties
  get loaderBars(): AeLoaderType{
    return this._loaderBars;
  }
   get wizardCanBeShown():BehaviorSubject<boolean> {
     return this._wizardCanBeShown;
   }
  get methodStatementsWizardSteps$(): BehaviorSubject<Immutable.List<AeWizardStep>> {
    return this._methodStatementsWizardSteps$;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.MethodStatements;
  }
  get showComplete(): boolean {
    return this._showComplete;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(private _localizationConfig: LocalizationConfig
    , protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: ActivatedRoute
    , private _route: Router
    , private _breadcrumbService: BreadcrumbService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    initLocalizationWithAdditionProviders(_localizationConfig, ['method-statements'])();
    // let bcItem1: IBreadcrumb = { label: 'Method statements', url: '/method-statement' };
    // this._breadcrumbService.add(bcItem1);
  }
  // End of constructor

  // Private methods
  getMethodStatementBannerTitle(): string {
    //TODO: here based on add or update mode appropirate title should be shown
    if (this._methodStatement) {
      // let bcItem: IBreadcrumb = { label: this._methodStatement.Name, url: '' };
      // this._breadcrumbService.add(bcItem);
      return this._methodStatement.Name;
    } else {
      return "Method statement ";
    }

  }
  public onGeneralStepSave(objectToSave: MethodStatement) {
    if (this._methodStatementId) {
      //here we need to depatch the update action..
      this._store.dispatch(new UpdateMethodStatementAction({ MethodStatement: objectToSave, portionUpdating: 'generalStep' }));
    } else {
      //here we need to despatch the add action..
      this._store.dispatch(new AddMethodStatementAction(objectToSave));
    }
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._methodStatementsWizardSteps$ = new BehaviorSubject<Immutable.List<AeWizardStep>>(Immutable.List([
      new AeWizardStep('General', '', 'generalStep', false),
      new AeWizardStep('Sequence of events', '', 'sequenceOfEventsStep', true),
      new AeWizardStep('Plant & equipment', '', 'plantAndEquipmentStep', true),
      new AeWizardStep('Safety precautions', '', 'safetyPrecautionsStep', true),
      new AeWizardStep('Further information', '', 'furtherInformationStep', true),
      new AeWizardStep('Supporting documentation', '', 'supportingDocumentationStep', true),
      new AeWizardStep('Preview', '', 'preiviewStep', true)
    ]));

    this._routeParamsSubscription = this._router.params.takeUntil(this._destructor$).subscribe(params => {
      if (isNullOrUndefined(params['id'])) {
        this._methodStatementId = '';
        this._wizardCanBeShown.next(true);
      }
      else {
        this._methodStatementId = params['id'];
      }
      if (isNullOrUndefined(params['isExample'])) {
        this._isExample = false;
      }
      else {
        this._isExample = true;
      }


      //here despatch action to get by id if value is available...
      //subscribe to the store methodstatement and patch the form so that in edit mode it can be binded with actual values..
      if (this._methodStatementId)
        this._store.dispatch(new LoadMethodStatementByIdAction({ Id: this._methodStatementId, IsExample: this._isExample })); // as of now sending is example false

      //here despatch action to get by id if value is available...
      //subscribe to the store methodstatement and patch the form so that in edit mode it can be binded with actual values..

    });

    this._methodStatementSubscription = this._store.let(fromRoot.getManageMethodStatementData).takeUntil(this._destructor$).subscribe((ms) => {
      if (ms) {
        this._methodStatement = ms;
        this._methodStatementId = ms.Id;
        this._wizardCanBeShown.next(true);        
      }
    });


  }
  ngOnDestroy() {
    super.ngOnDestroy();
  }

  onFurtherInformationSave(data: MethodStatement) {
    let portionToUpdate: string = 'MSOtherRiskAssessments';
    this._store.dispatch(new UpdateMethodStatementAction({ MethodStatement: data, portionUpdating: portionToUpdate }));
  }

  getMethodStatementObject() {
    return this._methodStatement;
  }

  onPlantAndEquipmentSave(data: MethodStatement) {
    let portionUpdating: string = 'PlantEquipments';
    let msEntity = Object.assign({}, data);
    msEntity.MSProcedures = null;
    msEntity.MSPPE = null;
    msEntity.MSOtherRiskAssessments = null;
    msEntity.MSRiskAssessmentMap = null;
    msEntity.MSSafetyResponsibilities = null;
    msEntity.Site = null;
    this._store.dispatch(new UpdateMethodStatementAction({ MethodStatement: msEntity, portionUpdating: portionUpdating }));
  }

  // End of public methods

}
