import {
  Component
  , OnInit
  , ChangeDetectorRef
  , OnDestroy
  , ChangeDetectionStrategy
  , ViewEncapsulation
  , Input
  , EventEmitter
  , Output
} from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { BaseComponent } from './../../../../shared/base-component';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'yearendprocedure-confirm',
  templateUrl: './yearendprocedure-confirm.component.html',
  styleUrls: ['./yearendprocedure-confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class YearendprocedureConfirmComponent extends BaseComponent implements OnInit, OnDestroy {
  // private field declarations start
  private _employeeList: Array<string> = [];
  // end of private fields

  // getters start
  @Input('employeeList')
  public set employeeList(val: Array<string>) {
    this._employeeList = val;
  }
  public get employeeList() {
    return this._employeeList;
  }
 
  // end of getters

  // output properties start
  @Output()
  confirm: EventEmitter<string> = new EventEmitter<string>();
  // end of output properties

  // constrcutor starts
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _changeDetector);
  }
  // end of constructor

  // public methods
  public onConfirmProcess(status) {
    this.confirm.emit(status);
  }
  ngOnInit() {
  }

  ngOnDestroy() {
  }
  // end of public methods
}
