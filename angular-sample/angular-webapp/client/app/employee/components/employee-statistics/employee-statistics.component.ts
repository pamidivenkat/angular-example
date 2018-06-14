import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { EmployeeStatisticsLoadAction } from '../../actions/employee.actions';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { BaseComponent } from '../../../shared/base-component';
import { EmployeeStatistics } from '../../models/employee-statistics';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Observable, Subject, Subscription, BehaviorSubject } from 'rxjs/Rx';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import * as employeeActions from '../../actions/employee.actions';
import { isNullOrUndefined } from "util";

@Component({
  selector: 'app-employeeStatistics',
  templateUrl: './employee-statistics.component.html',
  styleUrls: ['./employee-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeStatisticsComponent extends BaseComponent implements OnInit, OnDestroy {
  // private fields
  private _employeeAeInformationBarItems: AeInformationBarItem[];
  private _iconSize: AeIconSize = AeIconSize.medium;
  private _employeeStatisticsSubscription: Subscription;
  private _employeeInfoSubscription: Subscription;
  // end of private fields
  //public properties
  get employeeAeInformationBarItems(): AeInformationBarItem[] {
    return this._employeeAeInformationBarItems;
  }
  get iconSize(): AeIconSize {
    return this._iconSize;
  }
  //end of public properties
  // constructor start
  constructor(private _changeDetector: ChangeDetectorRef
    , private _store: Store<fromRoot.State>, _localeService: LocaleService, _translationService: TranslationService, private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _changeDetector);
  }
  // end of constructor

  // private method declarations start
  // end of private method declarations 

  // public metthod declarations start  
  getStatisticCountId(index) {
    return `employee-Statistic-count-${index}`;
  }
  getStatisticNameId(index) {
    return `employee-Statistic-Name-${index}`;
  }
  getToolTip(tooltip: string): string {
    return this.translation.translate('INFORMATIONBAR.' + tooltip, null, this.lang);
  }
  ngOnInit(): void {
    super.ngOnInit();

    this._employeeInfoSubscription = this._store.let(fromRoot.getEmployeeInformationData).subscribe(employee => {
      if(employee)
        this._store.dispatch(new EmployeeStatisticsLoadAction({ EmployeeId: employee.Id }));
    });

    
    this._employeeStatisticsSubscription = this._store.let(fromRoot.getEmployeeStatisticsData).subscribe(data => {
      if (data) {
        this._employeeAeInformationBarItems = data;
        this._changeDetector.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this._employeeStatisticsSubscription)) {
      this._employeeStatisticsSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._employeeInfoSubscription)) {
      this._employeeInfoSubscription.unsubscribe();
    }
  }
  // end of public method declarations
}
