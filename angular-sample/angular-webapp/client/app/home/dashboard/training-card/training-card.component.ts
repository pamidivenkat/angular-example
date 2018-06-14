import { LoadTaskCategories } from '../../../task/actions/task.list.actions';
import { isNullOrUndefined } from 'util';
import { BaseComponent } from '../../../shared/base-component';
import { KeyDocumentsLoadAction } from '../../actions/key-documents-actions';
import { GeneralWorkerService } from '../../../shared/web-workers/general/general-worker.service';
import { AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { subscribeOn } from 'rxjs/operator/subscribeOn';
import { KeyDocuments } from './../../models/key-documents';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';
import { Store, Action } from '@ngrx/store';
import * as fromRoot from './../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { MyTraining } from './../../models/my-training';
import { MyTeamTrainingTasksCountAction, MyTrainingLoadAction } from './../../actions/my-training-actions';
import * as fromConstants from '../../../shared/app.constants';

@Component({
  selector: 'app-trainingcard',
  templateUrl: './training-card.component.html',
  styleUrls: ['./training-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingcardComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _myTeamTraingTasksExists$: Observable<boolean>;
  private _keyDocuments$: Observable<AtlasApiResponse<KeyDocuments>>;
  private _iskeyDocumentsLoading$: Observable<boolean>;
  private _iskeyDocumentsFirstTimeLoad$: Observable<boolean>;
  private _iskeyDocumentsFirstTimeLoadSubscription: Subscription;
  private _iskeyDocumentsFirstTimeLoad: boolean;
  private _keyDocumentsRefreshTimer;
  private _keyDocumentsRefreshSubscription: Subscription;
  private _myTrainings$: Observable<AtlasApiResponse<MyTraining>>;
  _isMyTrainingsLoading$: Observable<boolean>;
  private _isMyTrainingsFirstTimeLoad$: Observable<boolean>;
  private _isMyTrainingsFirstTimeLoadSubscription: Subscription;
  private _isMyTrainingsFirstTimeLoad: boolean;
  private _myTrainingsRefreshTimer;
  private _myTrainingsRefreshSubscription: Subscription;
  private _myTeamTrainingTasksSubscription$: Subscription;
  // End of Private Fields
  // End of Public properties
  get myTeamTraingTasksExists$(): Observable<boolean> {
    return this._myTeamTraingTasksExists$;
  }
  get keyDocuments$(): Observable<AtlasApiResponse<KeyDocuments>> {
    return this._keyDocuments$;
  }
  set keyDocuments$(value: Observable<AtlasApiResponse<KeyDocuments>>) {
    this._keyDocuments$ = value;
  }

  get iskeyDocumentsLoading$(): Observable<boolean> {
    return this._iskeyDocumentsLoading$;
  }
  set iskeyDocumentsLoading$(value: Observable<boolean>) {
    this._iskeyDocumentsLoading$ = value;
  }

  get iskeyDocumentsFirstTimeLoad$(): Observable<boolean> {
    return this._iskeyDocumentsFirstTimeLoad$;
  }
  set iskeyDocumentsFirstTimeLoad$(value: Observable<boolean>) {
    this._iskeyDocumentsFirstTimeLoad$ = value;
  }

  get myTrainings$(): Observable<AtlasApiResponse<MyTraining>> {
    return this._myTrainings$;
  }
  set myTrainings$(value: Observable<AtlasApiResponse<MyTraining>>) {
    this._myTrainings$ = value;
  }

  get isMyTrainingsFirstTimeLoad$(): Observable<boolean> {
    return this._isMyTrainingsFirstTimeLoad$;
  }
  set isMyTrainingsFirstTimeLoad$(value: Observable<boolean>) {
    this._isMyTrainingsFirstTimeLoad$ = value;
  }

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService, protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService, private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _cdRef);

  }
  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  public hasEmployeeRecord(): boolean {
    return !isNullOrUndefined(this._claimsHelper.getEmpId());
  }
  // End of public methods

  ngOnInit() {
    this._keyDocuments$ = this._store.let(fromRoot.getKeyDocumentsData);
    this._iskeyDocumentsLoading$ = this._store.let(fromRoot.getkeyDocumentsLoadingData);
    this._iskeyDocumentsFirstTimeLoad$ = this._store.let(fromRoot.getkeyDocumentsIsFirstTimeLoadData);
    this._myTeamTraingTasksExists$ = this._store.let(fromRoot.checkMyTeamTrainingTasksExists);
    if (this._claimsHelper.isHolidayAuthorizerOrManager()) {
      this._store.dispatch(new MyTeamTrainingTasksCountAction(fromConstants.trainingTaskCategoryId));
    }
    //Below is the code which will despatch the load event only for first time in the store.
    this._iskeyDocumentsFirstTimeLoadSubscription = this._iskeyDocumentsFirstTimeLoad$.subscribe(firstTimeLoad => {
      this._iskeyDocumentsFirstTimeLoad = firstTimeLoad;
      if (this._iskeyDocumentsFirstTimeLoad)
        this._store.dispatch(new KeyDocumentsLoadAction(this._claimsHelper.getEmpIdOrDefault()));
    });
    //To load the key documents again from the server we need to despatch the loading of the key documents on timely manner or 
    //need to desptach thsi event when user performaed any such action which requires the key documents data referesh
    //As of now we do not have any scenario in client login where we need to refresh this data based on user Action  
    //TODO:below code should be moved to web worker 
    this._keyDocumentsRefreshTimer = Observable.timer(300000, 600000);
    this._keyDocumentsRefreshSubscription = this._keyDocumentsRefreshSubscription = this._keyDocumentsRefreshTimer.subscribe(t => {
      if (!this._iskeyDocumentsFirstTimeLoad)
        this._store.dispatch(new KeyDocumentsLoadAction(this._claimsHelper.getEmpIdOrDefault()));
    });

    //Start of section which is dealing with my trainings area.

    this._myTrainings$ = this._store.let(fromRoot.getMyTrainingsData);
    this._isMyTrainingsLoading$ = this._store.let(fromRoot.getMyTrainingsLoadingData);
    this._isMyTrainingsFirstTimeLoad$ = this._store.let(fromRoot.getMyTrainingsIsFirstTimeLoadData);
    //Below is the code which will despatch the load event only for first time in the store.
    this._isMyTrainingsFirstTimeLoadSubscription = this._isMyTrainingsFirstTimeLoad$.subscribe(firstTimeLoad => {
      this._isMyTrainingsFirstTimeLoad = firstTimeLoad;
      if (this._isMyTrainingsFirstTimeLoad)
        this._store.dispatch(new MyTrainingLoadAction(this._claimsHelper.getEmpIdOrDefault()));
    });
    //To load the my trainings again from the server we need to despatch the loading of the my trainings on timely manner or 
    //need to desptach thsi event when user performaed any such action which requires the my trainings data referesh
    //As of now we do not have any scenario in client login where we need to refresh this data based on user Action  
    //TODO:below code should be moved to web worker 
    this._myTrainingsRefreshTimer = Observable.timer(300000, 600000);
    this._myTrainingsRefreshSubscription = this._myTrainingsRefreshTimer.subscribe(t => {
      if (!this._isMyTrainingsFirstTimeLoad)
        this._store.dispatch(new MyTrainingLoadAction(this._claimsHelper.getEmpIdOrDefault()));
    });

  }

  ngOnDestroy() {
    if (this._iskeyDocumentsFirstTimeLoadSubscription)
      this._iskeyDocumentsFirstTimeLoadSubscription.unsubscribe();
    if (this._keyDocumentsRefreshSubscription)
      this._keyDocumentsRefreshSubscription.unsubscribe();

    if (this._isMyTrainingsFirstTimeLoadSubscription)
      this._isMyTrainingsFirstTimeLoadSubscription.unsubscribe();
    if (this._myTrainingsRefreshSubscription)
      this._myTrainingsRefreshSubscription.unsubscribe();
  }
}
