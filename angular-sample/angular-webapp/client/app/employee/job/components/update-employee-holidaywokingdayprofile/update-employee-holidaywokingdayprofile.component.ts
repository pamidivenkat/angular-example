import {
  Component
  , OnInit
  , ChangeDetectionStrategy
  , OnDestroy
  , ChangeDetectorRef,
  EventEmitter,
  Output,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { Subscription, BehaviorSubject, Observable } from 'rxjs/Rx';
import { HWPShortModel, NonWorkingdaysModel } from './../../../../company/nonworkingdaysandbankholidays/models/nonworkingdays-model';
import { isNullOrUndefined } from 'util';
import { LoadAllNonWorkingDayProfilesAction } from './../../../../shared/actions/company.actions';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import {
  LoadSelectedNonWorkingDaysProfileAction
} from './../../../../company/nonworkingdaysandbankholidays/actions/nonworkingdays-actions';
import { FormControl } from '@angular/forms';
import { AeLoaderType } from './../../../../atlas-elements/common/ae-loader-type.enum';

@Component({
  selector: 'update-employee-holidaywokingdayprofile',
  templateUrl: './update-employee-holidaywokingdayprofile.component.html',
  styleUrls: ['./update-employee-holidaywokingdayprofile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UpdateEmployeeHolidaywokingdayprofileComponent extends BaseComponent implements OnInit, OnDestroy {
  // private field declarations start
  private _sourceHWPList: Array<HWPShortModel> = [];
  private _hwpList: Immutable.List<AeSelectItem<string>>;
  private _hwpListSubscription: Subscription;
  private _nonWorkingdaysEntity: NonWorkingdaysModel;
  private _selectedHWPId: string = '';
  private _onDemandDataLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private _selectedHWPSubscription: Subscription;
  private _valueChangeSubscription: Subscription;
  private _formControl: FormControl;
  private _loading: boolean = true;
  // end of private fields

  @Input('hwpId')
  get selectedHWPId() {
    return this._selectedHWPId;
  }
  set selectedHWPId(val: string) {
    this._selectedHWPId = val;
  }

  public get lightClass() {
    return AeClassStyle.Light;
  }

  public get hwpList() {
    return this._hwpList;
  }

  public get nonWorkingdaysEntity() {
    return this._nonWorkingdaysEntity;
  }

  public get loaderType() {
    return AeLoaderType.Bars;
  }

  public get loading() {
    return this._loading;
  }

  public get profileControl() {
    return this._formControl;
  }

  @Output()
  closePanel: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  saveHWP: EventEmitter<{
    Id: string,
    Name: string
  }> = new EventEmitter<{
    Id: string,
    Name: string
  }>();

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this._formControl = new FormControl('');
  }
  // end of constructor

  // private methods start
  private _prepareAeSelectItems(inputList: Array<HWPShortModel>) {
    let profileList: AeSelectItem<string>[] = [];
    let standardItem = new AeSelectItem('Standard', '', false);
    standardItem.Childrens = inputList.filter(c => c.IsExample === true).map(c => new AeSelectItem(c.Name, c.Id, false));
    profileList.push(standardItem);

    let customItem = new AeSelectItem('Custom', '', false);
    customItem.Childrens = inputList.filter(c => c.IsExample === false).map(c => new AeSelectItem(c.Name, c.Id, false));
    profileList.push(customItem);
    return Immutable.List(profileList);
  }
  // end of private methods

  // public methods start
  ngOnInit() {
    if (!isNullOrUndefined(this._formControl)) {
      this._formControl.setValue(this._selectedHWPId);
    }

    this._hwpListSubscription = this._store.let(fromRoot.getNonWorkingDayProfilesList).subscribe((list) => {
      if (!isNullOrUndefined(list)) {
        this._sourceHWPList = list;
        this._hwpList = this._prepareAeSelectItems(list);
        this._onDemandDataLoader.next(true);
        this._cdRef.markForCheck();
      } else {
        this._store.dispatch(new LoadAllNonWorkingDayProfilesAction(true));
      }
    });

    this._selectedHWPSubscription =
      Observable.combineLatest(this._onDemandDataLoader
        , this._store.let(fromRoot.getHasSelectedProfileFullEntityData)).subscribe((vals) => {
          if (StringHelper.coerceBooleanProperty(vals[0]) &&
            !StringHelper.isNullOrUndefinedOrEmpty(this._selectedHWPId)) {
            let hwpEntity = vals[1];
            if (!isNullOrUndefined(hwpEntity) &&
              hwpEntity.Id.toLowerCase() === this._selectedHWPId.toLowerCase()) {
              this._nonWorkingdaysEntity = hwpEntity;
              this._loading = false;
              this._cdRef.markForCheck();
            } else {
              let item = <NonWorkingdaysModel>this._sourceHWPList.filter(c => c.Id.toLowerCase() === this._selectedHWPId.toLowerCase())[0];
              if (!isNullOrUndefined(item)) {
                this._store.dispatch(new LoadSelectedNonWorkingDaysProfileAction(item));
              } else {
                this._selectedHWPId = '';
                this._loading = false;
                this._nonWorkingdaysEntity = new NonWorkingdaysModel();
              }
            }
          }
        });

    this._valueChangeSubscription = this._formControl.valueChanges.subscribe((val) => {
      if (!StringHelper.isNullOrUndefinedOrEmpty(val)) {
        this._loading = true;
        this._selectedHWPId = val;
        let item = <NonWorkingdaysModel>this._sourceHWPList.filter(c => c.Id.toLowerCase() === val.toLowerCase())[0];
        this._store.dispatch(new LoadSelectedNonWorkingDaysProfileAction(item));
      } else {
        this._selectedHWPId = '';
        this._loading = false;
        this._nonWorkingdaysEntity = new NonWorkingdaysModel();
      }
    });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._hwpListSubscription)) {
      this._hwpListSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._selectedHWPSubscription)) {
      this._selectedHWPSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._valueChangeSubscription)) {
      this._valueChangeSubscription.unsubscribe();
    }
  }

  public closeUpdateHWPPanel() {
    this.closePanel.emit(true);
  }

  public updateEmpHWP() {
    if (!isNullOrUndefined(this._nonWorkingdaysEntity) &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._nonWorkingdaysEntity.Id)) {
      this.saveHWP.emit({
        Id: this._nonWorkingdaysEntity.Id,
        Name: this._nonWorkingdaysEntity.Name
      });
    } else {
      this.saveHWP.emit({
        Id: null,
        Name: ''
      });
    }
  }
  // end of public methods
}
