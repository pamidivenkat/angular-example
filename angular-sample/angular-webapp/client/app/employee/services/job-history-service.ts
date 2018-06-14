import { LoadJobTitleOptioAction } from '../../shared/actions/company.actions';
import { LoadPeriodOptionAction } from '../../shared/actions/lookup.actions';
import { Subject } from 'rxjs/Rx';
import {
    AddEmployeeJobHistoryAction,
    EmployeeJobHistoryLoadAction,
    EmployeeJobHistoryLoadCompleteAction,
    GetEmployeeJobHistoryAction,
    UpdateEmployeeJobHistoryAction,
    DeleteEmployeeJobHistoryAction
} from '../actions/employee.actions';

import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';

@Injectable()
export class JobHistoryService implements OnInit {    

    // constructor
    constructor(private _store: Store<fromRoot.State>) {

    }
    // End of constructor

    ngOnInit() {

    }

    // Private methods

    /**
     * to dispatch event to load JobHistory list
     * 
     * @memberOf JobHistoryService
     */
    _loadJobHistory() {
        this._store.dispatch(new EmployeeJobHistoryLoadAction(true));
    }

   
   
    /**
     * to dispatch event to add new JobHistory
     * 
     * @memberOf JobHistoryService
     */
    _createJobHistory(FormObj) {
         this._store.dispatch(new AddEmployeeJobHistoryAction(FormObj));
    }

     /**
     * to dispatch event to update JobHistory
     * 
     * @memberOf JobHistoryService
     */
    _updateJobHistory(FormObj) {
        this._store.dispatch(new UpdateEmployeeJobHistoryAction(FormObj));
    }

    /**
     * to dispatch event to select the JobHistory
     * @param {string} jobId 
     * 
     * @memberOf JobHistoryService
     */
    _onJobHistorySelect(jobId: string) {
         this._store.dispatch(new GetEmployeeJobHistoryAction(jobId));
    }

    /**
     * to dispatch event to delete JobHistory
     * @param {string} jobId 
     * 
     * @memberOf JobHistoryService
     */
    _onJobHistoryDelete(jobId: string) {
        this._store.dispatch(new DeleteEmployeeJobHistoryAction(jobId));
    }
    // Public methods
    // End of public methods

}