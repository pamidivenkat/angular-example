import { LoadJobTitleOptioAction } from '../../shared/actions/company.actions';
import { LoadPeriodOptionAction } from '../../shared/actions/lookup.actions';



import { Subject } from 'rxjs/Rx';
import { SalaryHistory } from '../models/salary-history';
import {
  EmployeeSalaryHistoryLoadAction,
  EmployeeSalaryHistoryLoadCompleteAction,
  AddEmployeeSalaryHistoryAction,
  AddEmployeeSalaryHistoryCompletedAction,
  GetEmployeeSalaryHistoryAction,
  DeleteEmployeeSalaryHistoryAction
} from '../actions/employee.actions';

import * as addAction from '../actions/employee.actions';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';

@Injectable()
export class SalaryHistoryService implements OnInit {
    // Private Fields
    // End of Private Fields

    // Public properties
    // End of Public properties

    // constructor
    constructor(private _store: Store<fromRoot.State>) {

    }
    // End of constructor

    ngOnInit() {

    }

    // Private methods

    /**
     * to dispatch event to load SalaryHistory list
     * 
     * @memberOf SalaryHistoryService
     */
    _loadSalaryHistory() {
        this._store.dispatch(new EmployeeSalaryHistoryLoadAction(true));
    }

   
   
    /**
     * to dispatch event to add new SalaryHistory
     * 
     * @memberOf SalaryHistoryService
     */
    _createSalaryHistory(FormObj) {
        this._store.dispatch(new addAction.AddEmployeeSalaryHistoryAction(FormObj));
    }

     /**
     * to dispatch event to update SalaryHistory
     * 
     * @memberOf SalaryHistoryService
     */
    _updateSalaryHistory(FormObj) {
        this._store.dispatch(new addAction.UpdateEmployeeSalaryHistoryAction(FormObj));
    }

    /**
     * to dispatch event to select the SalaryHistory
     * @param {string} salaryId 
     * 
     * @memberOf SalaryHistoryService
     */
    _onSalaryHistorySelect(salaryId: string) {
        this._store.dispatch(new GetEmployeeSalaryHistoryAction(salaryId));
    }

    /**
     * to dispatch event to delete SalaryHistory
     * @param {string} salaryId 
     * 
     * @memberOf SalaryHistoryService
     */
    _onSalaryHistoryDelete(salaryId: string) {
        this._store.dispatch(new DeleteEmployeeSalaryHistoryAction(salaryId));
    }
    // Public methods
    // End of public methods

}