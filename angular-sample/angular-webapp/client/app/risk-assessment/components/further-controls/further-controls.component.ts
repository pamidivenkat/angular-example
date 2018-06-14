import { resetUsers } from '../../../company/bulk-password-reset/models/bulk-password-reset.model';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { ControlsCategory } from '../../common/controls-category-enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RAAdditionalControl } from '../../models/risk-assessment-additionalcontrols';
import { Observable, Subscription } from 'rxjs/Rx';
import { RiskAssessmentService } from '../../services/risk-assessment-service';
import { isNullOrUndefined } from 'util';
import { ActivatedRoute } from '@angular/router';
import { TranslationService, LocaleService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';
import { AdditionalControlCategoryText } from "../../models/additional-control-category-text";
import { RouteParams } from '../../../shared/services/route-params';
@Component({
  selector: 'further-controls',
  templateUrl: './further-controls.component.html',
  styleUrls: ['./further-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FurtherControlsComponent extends BaseComponent implements OnInit, OnDestroy {
  //ptivate fields
  private _currentRiskAssessmentId: string;
  private _context: any;
  private _storageDisposalANDSpillogeList: Array<RAAdditionalControl>;
  private _fireANDFirstAidList: Array<RAAdditionalControl>;
  private _personalProtectiveEquipmentList: Array<RAAdditionalControl>;
  private _rAAdditionalControls: Array<RAAdditionalControl>;
  private _selectedAdditionalControlsArray: Array<RAAdditionalControl>;
  private _textToSave: Array<AdditionalControlCategoryText>;
  private _additionalControlsForm: FormGroup;
  private _fireAndFirstAidText: string;
  private _personalProtectiveEquipmentText: string;
  private _storageDisposalANDSpillogeText: string;
  private _allFurtherControls: Map<string, Array<RAAdditionalControl>>;
  private _isFirstTimeLoad: boolean = true;
  private _fireAndFirstAidTextId: string;
  private _personalProtectiveEquipmentTextId: string;
  private _storageDisposalANDSpillageTextId: string;
  //private fields ends

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _route: ActivatedRoute
    , private _riskAssessmentService: RiskAssessmentService
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
    , private _claims: ClaimsHelperService
    , private _routeParams: RouteParams) {
    super(_localeService, _translationService, _cdRef);
  }
  //input output bindings
  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
    this._context.submitEvent.subscribe((val) => {
      if (val)
        this._submitData();
    })
  }

  @Input('furtherControls')
  get furtherControls() {
    return this._allFurtherControls;
  }
  set furtherControls(val: Map<string, Array<RAAdditionalControl>>) {
    this._allFurtherControls = val;
  }

  //input output bindings

  get additionalControlsForm(): FormGroup {
    return this._additionalControlsForm;
  }

  get fireANDFirstAidList(): Array<RAAdditionalControl> {
    return this._fireANDFirstAidList;
  }

  get storageDisposalANDSpillogeList(): Array<RAAdditionalControl> {
    return this._storageDisposalANDSpillogeList;
  }

  get personalProtectiveEquipmentList(): Array<RAAdditionalControl> {
    return this._personalProtectiveEquipmentList;
  }

  ngOnInit() {
    if (!isNullOrUndefined(this._allFurtherControls)) {
      this._allFurtherControls.forEach((list, key) => {
        list.map(obj => {
          obj.PrototypeId = obj.Id;
          obj.CompanyId = !isNullOrUndefined(this._routeParams.Cid) ? this._routeParams.Cid : this._claims.getCompanyId();
          obj.IsSharedPrototype = true;
          obj.RiskAssessment = null;
        });
        if (key == "Storage Disposal and Spilloge") {
          this._storageDisposalANDSpillogeList = list;
        }
        if (key == "Fire and First Aid") {
          this._fireANDFirstAidList = list;
        }
        if (key == "Personal Protective Equipment") {
          this._personalProtectiveEquipmentList = list;
        }
      });
    }

    this._store.let(fromRoot.getCurrentRiskAssessmentId).takeUntil(this._destructor$).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._currentRiskAssessmentId = res;
      }
    });

    this._store.let(fromRoot.getRAAdditionalControlsRiskAssessmentsList).takeUntil(this._destructor$).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._selectedAdditionalControlsArray = res;
        if (this._isFirstTimeLoad) {
          // Filtered Migrated RAs custom icons created in citweb to display under Further controls - 3 tabs along with standard items 
          this._fireANDFirstAidList = this._fireANDFirstAidList.concat(res.filter(x => x.PrototypeId == null && x.Category === 2));
          this._storageDisposalANDSpillogeList = this._storageDisposalANDSpillogeList.concat(res.filter(x => x.PrototypeId == null && x.Category === 3));
          this._personalProtectiveEquipmentList = this._personalProtectiveEquipmentList.concat(res.filter(x => x.PrototypeId == null && x.Category === 4));
          this._isFirstTimeLoad = false;
        }
        this._cdRef.markForCheck();
      } else {
        this._riskAssessmentService.loadRAAdditionalControlList(this._currentRiskAssessmentId);
      }
    });

    this._store.let(fromRoot.getAdditionalControlsCategoryText).takeUntil(this._destructor$).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        res.forEach((category) => {
          if (ControlsCategory[category.Category] == "Fire and First Aid") {
            this._fireAndFirstAidText = category.Text
            this._fireAndFirstAidTextId = category.Id;
          }
          if (ControlsCategory[category.Category] == "Personal Protective Equipment") {
            this._personalProtectiveEquipmentText = category.Text
            this._personalProtectiveEquipmentTextId = category.Id;
          }
          if (ControlsCategory[category.Category] == "Storage Disposal and Spilloge") {
            this._storageDisposalANDSpillogeText = category.Text
            this._storageDisposalANDSpillageTextId = category.Id;
          }
        })
        this._initForm();
      } else {
        this._riskAssessmentService.loadAdditionalControlCategoryText(this._currentRiskAssessmentId);
      }
    });

    this._initForm();
  }
  //private methods
  private _submitData() {
    if (!isNullOrUndefined(this._selectedAdditionalControlsArray)) {
      this._selectedAdditionalControlsArray.forEach((control) => {
        if (control.isSelected == true) {
          control.Id = null;
          control.RiskAssessmentId = this._currentRiskAssessmentId;
        }
      });
      this._riskAssessmentService.saveAdditionalControls(this._selectedAdditionalControlsArray);
    }
    this._textToSave = [];
    let saveText: AdditionalControlCategoryText;
    if (!this._additionalControlsForm.get('fireAndFirstAidTextArea').pristine || !isNullOrUndefined(this._additionalControlsForm.get('fireAndFirstAidTextArea').value)) {
      saveText = new AdditionalControlCategoryText();
      saveText.Text = this._additionalControlsForm.value.fireAndFirstAidTextArea;
      saveText.Category = this._fireANDFirstAidList[0].Category;
      saveText.RiskAssessmentId = this._currentRiskAssessmentId;
      saveText.CompanyId = !isNullOrUndefined(this._routeParams.Cid) ? this._routeParams.Cid : this._claims.getCompanyId();
      saveText.Id = !isNullOrUndefined(this._fireAndFirstAidTextId) ? this._fireAndFirstAidTextId : '';
      this._textToSave.push(saveText);
    }
    if (!this._additionalControlsForm.get('storageDisposalANDSpillogeText').pristine || !isNullOrUndefined(this._additionalControlsForm.get('storageDisposalANDSpillogeText').value)) {
      saveText = new AdditionalControlCategoryText();
      saveText.Text = this._additionalControlsForm.value.storageDisposalANDSpillogeText;
      saveText.Category = this._storageDisposalANDSpillogeList[0].Category;
      saveText.RiskAssessmentId = this._currentRiskAssessmentId;
      saveText.CompanyId = !isNullOrUndefined(this._routeParams.Cid) ? this._routeParams.Cid : this._claims.getCompanyId();
      saveText.Id = !isNullOrUndefined(this._storageDisposalANDSpillageTextId) ? this._storageDisposalANDSpillageTextId : '';
      this._textToSave.push(saveText);
    }
    if (!this._additionalControlsForm.get('personalProtectiveEquipmentText').pristine || !isNullOrUndefined(this._additionalControlsForm.get('personalProtectiveEquipmentText').value)) {
      saveText = new AdditionalControlCategoryText();
      saveText.Text = this._additionalControlsForm.value.personalProtectiveEquipmentText;
      saveText.Category = this._personalProtectiveEquipmentList[0].Category;
      saveText.RiskAssessmentId = this._currentRiskAssessmentId;
      saveText.CompanyId = !isNullOrUndefined(this._routeParams.Cid) ? this._routeParams.Cid : this._claims.getCompanyId();
      saveText.Id = !isNullOrUndefined(this._personalProtectiveEquipmentTextId) ? this._personalProtectiveEquipmentTextId : '';
      this._textToSave.push(saveText);
    }
    this._riskAssessmentService.saveAdditionalControlsText(this._textToSave);
  }
  private _initForm() {
    this._additionalControlsForm = this._fb.group({
      fireAndFirstAidTextArea: [{ value: this._fireAndFirstAidText, disabled: false }],
      storageDisposalANDSpillogeText: [{ value: this._storageDisposalANDSpillogeText, disabled: false }],
      personalProtectiveEquipmentText: [{ value: this._personalProtectiveEquipmentText, disabled: false }]
    });
  }

  //private method ends
  //public methods
  getPictureUrl(pictureId: string): string {
    return "/filedownload?documentId=" + pictureId + "&isSystem=true";
  }

  getSelectStatus(item: RAAdditionalControl) {
    if (item.Id) {
      if (!isNullOrUndefined(this._selectedAdditionalControlsArray) && this._selectedAdditionalControlsArray.length > 0) {

        let index = !isNullOrUndefined(item.PrototypeId) ? this._selectedAdditionalControlsArray.findIndex(control => (!isNullOrUndefined(control.PrototypeId) && control.PrototypeId.toLowerCase() === item.Id.toLowerCase()))
          : this._selectedAdditionalControlsArray.findIndex(control => control.Id.toLowerCase() === item.Id.toLowerCase());
        return index !== -1 ? true : false;

      }
    }
    return false;
  }

  onSelectCheckbox(checked: boolean, item: RAAdditionalControl) {
    let _selectedItem = Object.assign({}, item, {});
    _selectedItem.isSelected = checked;
    if (checked) {
      this._selectedAdditionalControlsArray.push(_selectedItem);
    }
    else {
      let index = isNullOrUndefined(item.PrototypeId) ? this._selectedAdditionalControlsArray.findIndex(f => f.Id === item.Id) : this._selectedAdditionalControlsArray.findIndex(f => f.PrototypeId === item.Id);
      if (index !== -1) {
        this._selectedAdditionalControlsArray.splice(index, 1);
      }
    }
  }

  //public methods ends

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
