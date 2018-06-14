import { EmployeeGroup } from '../../../shared/models/company.models';
import {
    AddEmployeeGroupsAction,
    DeleteEmployeeGroupsAction,
    EmployeeGroupsLoad,
    UpdateEmployeeGroupsAction
} from '../../employee-group/actions/employee-group.actions';
import { PreviousEmployment } from '../../models/previous-employment';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import { Observable, ReplaySubject } from 'rxjs/Rx';

@Injectable()
export class EmployeeGroupService implements OnInit {
    private _vehicleInfo$: AtlasApiResponse<PreviousEmployment>;

    constructor(private _store: Store<fromRoot.State>) {

    }

    ngOnInit() {

    }


    LoadEmployeeGroups() {
        this._store.dispatch(new EmployeeGroupsLoad(true));
    }

    /**
     * to dispatch event to add new EmployeeGroup
     * 
     * @memberOf EmployeeGroupService
     */
    _createEmployeeGroup(FormObj) {
        this._store.dispatch(new AddEmployeeGroupsAction(FormObj));
    }

     /**
     * to dispatch event to update EmployeeGroup
     * 
     * @memberOf EmployeeGroupService
     */
    _updateEmployeeGroup(FormObj) {
        this._store.dispatch(new UpdateEmployeeGroupsAction(FormObj));
    }
  

    /**
     * to dispatch event to delete EmployeeGroup
     * @param {EmployeeGroup} empGroupModal 
     * 
     * @memberOf EmployeeGroupService
     */
    _onEmployeeGroupDelete(empGroupModal: EmployeeGroup) {
        this._store.dispatch(new DeleteEmployeeGroupsAction(empGroupModal));
    }
    // Public methods
    // End of public methods

  

}