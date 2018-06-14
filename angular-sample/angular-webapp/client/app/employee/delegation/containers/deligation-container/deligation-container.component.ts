import { DelegatedUserDeleteAction } from './../../actions/delegation.actions';
import { Delegation } from './../../models/delegation';
import { Orientation } from '../../../../atlas-elements/common/orientation.enum';
import { AeLabelStyle } from '../../../../atlas-elements/common/ae-label-style.enum';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { TranslationService, LocaleService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { BaseComponent } from './../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers/index';
import { Subject, Subscription } from 'rxjs/Rx';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { DelegationService } from './../../services/delegation.service';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
@Component({
  selector: 'deligation-container',
  templateUrl: './deligation-container.component.html',
  styleUrls: ['./deligation-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DelegationContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private fields 
  private _aelStyle = AeLabelStyle.Medium;
  private _imgOrientation = Orientation.Horizontal;
  private _isAdd: boolean;
  private _isUpdate: boolean;
  private _showRemoveDialog: boolean;
  private _selectedDelegation: Delegation;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  // End of Private fields

  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , protected _store: Store<fromRoot.State>
    , _localeService: LocaleService
    , _translationService: TranslationService
    , private _delegationService: DelegationService,
    protected _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _changeDetector);

  }
  // End of Constructor
  // get methods
  get isAdd(){
    return this._isAdd;
  }

  get selectedDelegation(){
    return this._selectedDelegation;
  }

  get showRemoveDialog(){
    return this._showRemoveDialog;
  }

  get lightClass(){
    return this._lightClass;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Delegation;
}

  //Private Methods
  addNewDelegation() {
    this._isAdd = true;
  }

  showAddOrUpdateSlideOut(): boolean {
    return (this._isAdd === true || this._isUpdate === true);
  }

  getSlideoutState(): string {
    return (this._isAdd || this._isUpdate) ? 'expanded' : 'collapsed';
  }

 
  onDelegationAddOrUpdateCancel($event) {
    this._isAdd = false;
    this._isUpdate = false;
  }
  
  onDeligationitemUpdate($event){
    this._selectedDelegation = $event;
    this._isUpdate = true;
  }

  onDeligationitemDelete($event){
    this._selectedDelegation = $event;
    this._showRemoveDialog = true;
  }
  
  modalClosed(option) {
    if (option == 'yes') {
      this._store.dispatch(new DelegatedUserDeleteAction(this._selectedDelegation));
    }
    this._showRemoveDialog = false;
    this._selectedDelegation = null;
  }

  //End of Private Methods


  // Public Methods
  ngOnInit() {

    let iniParamsArray: AtlasParams[] = [];
    iniParamsArray.push(new AtlasParams("UserId", this._claimsHelper.getUserId()));
    iniParamsArray.push(new AtlasParams("UserName", this._claimsHelper.getUserFullName()));
    let newReq: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, "FirstName", SortDirection.Ascending, iniParamsArray);
    this._delegationService.loadDelegationList(newReq);    
  }
  ngOnDestroy() {
  }
  //End of Public Methods


}
