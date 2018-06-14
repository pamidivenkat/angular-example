import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionTypes } from '../../actions/information-bar.actions';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { AeInformationBarItemType } from '../../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { BaseComponent } from '../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs/Rx';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';

@Component({
  selector: 'app-informationbar',
  templateUrl: './information-bar.component.html',
  styleUrls: ['./information-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformationbarComponent extends BaseComponent implements OnInit {

  // private fields
  private _informationBarItems: AeInformationBarItem[];
  private _isLoaded: boolean = false;
  // end of private fields

  get informationBarItems(): AeInformationBarItem[] {
    return this._informationBarItems;
  }

  get isLoaded(): boolean {
    return this._isLoaded;
  }
  //private methods
  onInformationBarClicked($event) {
    let selectedInformationBarItem: AeInformationBarItem = $event;
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge',
      relativeTo: this._route
    };
    switch (selectedInformationBarItem.Type) {
      case selectedInformationBarItem.Type = AeInformationBarItemType.DocumentsAwaiting:
        this._router.navigate(["/document/shared/distributed"], navigationExtras);
        break;
      case selectedInformationBarItem.Type = AeInformationBarItemType.HolidaysRequested:
        this._router.navigate(["/absence-management/requests"], navigationExtras);
        break;
      case selectedInformationBarItem.Type = AeInformationBarItemType.HolidayCountdown:
        this._router.navigate(["/absence-management/holiday/approved"], navigationExtras);
        break;
      case selectedInformationBarItem.Type = AeInformationBarItemType.TeamHolidays:
        this._router.navigate(["/calendar/teamholidays"], navigationExtras);
        break;
      case selectedInformationBarItem.Type = AeInformationBarItemType.HolidaysAvailable:
        this._router.navigate(["/absence-management/holiday/all"], navigationExtras);
        break;
      case selectedInformationBarItem.Type = AeInformationBarItemType.TasksToComplete:
        navigationExtras.queryParams = { due: '15' };
        this._router.navigate(["/task/view/mine"], navigationExtras);
        break;
      case selectedInformationBarItem.Type = AeInformationBarItemType.TrainingCourses:
        this._router.navigate(["/training/status/outstanding"], navigationExtras);
        break;
      case selectedInformationBarItem.Type = AeInformationBarItemType.ManageTeam:
        this._router.navigate(["/employee/manage"], navigationExtras);
        break;
      case selectedInformationBarItem.Type = AeInformationBarItemType.MyTeamTasks:
        this._router.navigate(["/task/view/myteam"], navigationExtras);
        break;
      case selectedInformationBarItem.Type = AeInformationBarItemType.AssignedChecklists:
        this._router.navigate(["/checklist/scheduled"], navigationExtras);
        break;
      case selectedInformationBarItem.Type = AeInformationBarItemType.EmployeesAbsentToday:
        this._router.navigate(["/absence-management/requests/view/absenttoday"], navigationExtras);
        break;
      case selectedInformationBarItem.Type = AeInformationBarItemType.RiskAssessments:
        this._router.navigate(["/risk-assessment/live"], navigationExtras);
        break;
      case selectedInformationBarItem.Type = AeInformationBarItemType.OutstandingTraining:
        this._router.navigate(["/training/report/outstanding"], navigationExtras);
        break;
      default:
        break;
    }
  }
  //end of private methods
  // constructor
  constructor(private _changeDetector: ChangeDetectorRef
    , private _store: Store<fromRoot.State>, _localeService: LocaleService,
    _translationService: TranslationService
    , private _router: Router
    , private _route: ActivatedRoute
  ) {
    super(_localeService, _translationService, _changeDetector);

  }

  ngOnInit(): void {

    // load information items by dispatching load action
    this._loadInformationBarItems();

    // load information on complete
    this._store.let(fromRoot.getInformationBarData).subscribe(res => {
      this._informationBarItems = res;
    });

    //super.ngOnInit();
    this._store.let(fromRoot.getInfoBarLoadStatus).subscribe(status => {
      this._isLoaded = status; // status is true when informationbar load completed.
      this._cdRef.markForCheck();
    });
  }

  /**
  * This method is used to get list of informationbar items from store using informationbar reducer
  */
  _loadInformationBarItems(): void {
    this._store.dispatch({ type: ActionTypes.LOAD_INFORMATIONBAR, payload: {} });
  }

}
