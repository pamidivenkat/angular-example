import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { Observable } from "rxjs/Observable";
import { PPECategoryGroup } from './../../../../shared/models/lookup.models';
import { LoadPPECategoryGroupsAction } from './../../../../shared/actions/lookup.actions';
import { IFormBuilderVM, IFormFieldWrapper } from './../../../../shared/models/iform-builder-vm';
import { PersonalProtectveEquipmentForm } from './../../../../method-statements/models/personal-protective-equipment.form';
import { Subscription } from "rxjs/Rx";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MethodStatement, MSPPE } from './../../../../method-statements/models/method-statement';
import { isNullOrUndefined } from "util";
import { UpdateMSPPEAction, LoadMSResponsibilitiesPagingSortingAction } from './../../../../method-statements/manage-methodstatements/actions/manage-methodstatement.actions';
import { AtlasParams, AtlasApiRequestWithParams, AtlasApiRequest } from './../../../../shared/models/atlas-api-response';
import { TabSelection } from './../../../../atlas-elements/common/models/ae-tab-model';
import { SafetyPrecautionTabs } from './../../../../method-statements/manage-methodstatements/models/methodstatement-tabs-enum';

@Component({
  selector: 'safety-precautions',
  templateUrl: './safety-precautions.component.html',
  styleUrls: ['./safety-precautions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SafetyPrecautionsComponent extends BaseComponent implements OnInit, OnDestroy {

  private _context: any;
  private _routeParamsSubscription: Subscription;
  private _methodStatementSubscription: Subscription;
  private _methodStatement: MethodStatement;
  private _wizStepContext: any;
  private _pageNumber: number = 1;
  private _pageSize: number = 10;
  private _actionApiRequest: AtlasApiRequest = new AtlasApiRequest(1, 10, '', null);
  private _tempPPEData: MSPPE[] = [];
  private _submitEventSubscription: Subscription;
  private _isMSPPESavedOnTabChange: boolean;
  private _isMSPPEFormNeedToSave: boolean;
  // Private Fields

  @Input('wizStepContext')
  set wizStepContext(val: any) {
    this._wizStepContext = val;
  }
  get wizStepContext() {
    return this._wizStepContext;
  }


  get methodStatement() {
    return this._methodStatement;
  }

  // End of Private Fields

  // Public properties

  // End of Public properties

  // Public Output bindings
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
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Private methods 

  private _saveMSPPE() {
    if (this._isMSPPEFormNeedToSave) {
      if (this._methodStatement && this.methodStatement.MSPPE && this._methodStatement.MSPPE.length > 0) {
        //here we have to merge the temp data with already saved data
        this._tempPPEData.forEach(ppeToSave => {
          let alreadyExistingWithSameCategory = this._methodStatement.MSPPE.find(x => x.PPECategoryId == ppeToSave.PPECategoryId);
          if (!isNullOrUndefined(alreadyExistingWithSameCategory)) {
            ppeToSave.Id = alreadyExistingWithSameCategory.Id;
          }
        });
      }
      this._store.dispatch(new UpdateMSPPEAction({ MethodStatementId: this._methodStatement.Id, MSPPE: this._tempPPEData }));
      this._tempPPEData = [];
      this._isMSPPEFormNeedToSave = false;
    }
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._methodStatementSubscription = this._store.let(fromRoot.getManageMethodStatementData).subscribe((ms) => {
      if (ms) {
        this._methodStatement = ms;
        this.initLoadMSResponsibilityData();
      }
    });


    this._submitEventSubscription = this._wizStepContext.submitEvent.subscribe((value) => {
      if (value) {
        if (!this._isMSPPESavedOnTabChange) {
          //only save when its not saved already with tabChange action
          this._isMSPPESavedOnTabChange = false;
          this._saveMSPPE();
        }
        //this._store.dispatch(new UpdateMSPPEAction({ MethodStatementId: this._methodStatement.Id, MSPPE: e }));        
      }
    });


  }
  ngOnDestroy() {
    if (this._submitEventSubscription) {
      this._submitEventSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._methodStatementSubscription)) {
      this._methodStatementSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._routeParamsSubscription)) {
      this._routeParamsSubscription.unsubscribe();
    }
  }

  onPPESubmit(e: MSPPE[]) {
    this._store.dispatch(new UpdateMSPPEAction({ MethodStatementId: this._methodStatement.Id, MSPPE: e }));
  }

  onPPEChange(e: MSPPE[]) {
    this._isMSPPEFormNeedToSave = true;
    this._tempPPEData = e;
  }
  onMSRespGridPaging($event) {
    this._actionApiRequest.PageNumber = $event.pageNumber;
    this._actionApiRequest.PageSize = $event.noOfRows;
    this._store.dispatch(new LoadMSResponsibilitiesPagingSortingAction(this._actionApiRequest));
  }


  initLoadMSResponsibilityData() {
    if (!isNullOrUndefined(this._methodStatement) && !isNullOrUndefined(this._methodStatement.MSSafetyResponsibilities)) {
      this._store.dispatch(new LoadMSResponsibilitiesPagingSortingAction(this._actionApiRequest));
    }
  }


  tabChanged(tab: TabSelection) {
    if (tab.previousTabIndex == SafetyPrecautionTabs.MSPPE) { // PPE tab      
      this._isMSPPESavedOnTabChange = true;
      this._saveMSPPE();
    } else {
      this._isMSPPESavedOnTabChange = false;
    }
  }

  // End of public methods

}
