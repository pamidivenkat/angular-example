import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { extractUserSelectOptionListData } from '../../../employee/common/extract-helpers';
import { extractAvailability, extractUserList } from '../../../company/user/common/extract-helpers';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { User } from '../../../shared/models/user';
import { TrainingCourse } from '../../models/training-course';
import {
    AddTrainingCoursesAction,
    DeleteTrainingCoursesAction,
    InvitePublicUserAction,
    LoadTrainingCoursesOnFilterChange,
    LoadTrainingCoursesOnstatusChange,
    LoadTrainingCourseUserModule,
    LoadTrainingModule,
    LoadTrainingSelectedModule,
    SendInviteForSelectedCourseAction,
    TrainingCoursesLoad,
    UpdateTrainingCoursesAction,
    RemoveOrReInviteAssignedUsersAction
} from '../../training-courses/actions/training-courses.actions';
import { AtlasApiRequestWithParams, AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import { URLSearchParams } from '@angular/http';


@Injectable()
export class TrainingCourseService implements OnInit {
    constructor(private _store: Store<fromRoot.State>
        , private _data: RestClientService
        , private _claims: ClaimsHelperService) {

    }

    ngOnInit() {

    }

    LoadTrainingCourses() {
        this._store.dispatch(new TrainingCoursesLoad(true));
    }
    LoadTrainingCourseModules(companyId: string) {
        this._store.dispatch(new LoadTrainingModule(companyId));
    }
    LoadTrainingCourseSelectedModules(atlasApiRequestWithParams: AtlasApiRequestWithParams) {
        this._store.dispatch(new LoadTrainingSelectedModule(atlasApiRequestWithParams));
    }


    LoadTrainingCoursesOnPageChange($event) {
        this._store.dispatch(new TrainingCoursesLoad({ pageNumber: $event.pageNumber, noOfRows: $event.noOfRows }));
    }

    LoadTrainingCoursesOnSort($event) {
        this._store.dispatch(new TrainingCoursesLoad({ SortField: $event.SortField, Direction: $event.Direction }));
    }

    /**
     * to dispatch event to add new TrainingCourse
     * 
     * @memberOf TrainingCourseService
     */
    _createTrainingCourse(FormObj) {
        this._store.dispatch(new AddTrainingCoursesAction(FormObj));
    }

    /**
    * to dispatch event to update TrainingCourse
    * 
    * @memberOf TrainingCourseService
    */
    _updateTrainingCourse(FormObj) {
        this._store.dispatch(new UpdateTrainingCoursesAction(FormObj));
    }

    /**
    * to dispatch event to update TrainingCourse
    * 
    * @memberOf TrainingCourseService
    */
    _updateStautsTrainingCourse(FormObj) {
        this._store.dispatch(new LoadTrainingCoursesOnstatusChange(FormObj));
    }
    _removeTrainingCourse(FormObj) {
        this._store.dispatch(new DeleteTrainingCoursesAction(FormObj));
    }


    /**
     * to dispatch event to delete TrainingCourse
     * @param {TrainingCourse} empGroupModal 
     * 
     * @memberOf TrainingCourseService
     */
    _onTrainingCourseDelete(empGroupModal: TrainingCourse) {
        this._store.dispatch(new DeleteTrainingCoursesAction(empGroupModal));
    }
    // Public methods
    // End of public methods


    LoadTrainingCourseOnFilterChange(filters) {
        this._store.dispatch(new LoadTrainingCoursesOnFilterChange(filters));
    }
    LoadTrainingCourseUserModule(atlasApiRequestWithParams: AtlasApiRequestWithParams) {
        this._store.dispatch(new LoadTrainingCourseUserModule(atlasApiRequestWithParams));
    }

    SendInviteUserList(atlasApiRequestWithParams: any) {
        this._store.dispatch(new SendInviteForSelectedCourseAction(atlasApiRequestWithParams));
    }
    invitePublicUser(UserObject: any) {
        this._store.dispatch(new InvitePublicUserAction(UserObject));
    }
    checkDuplicateEmail(email: string): Observable<boolean> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('email', email);
        return this._data.get(`user/EmailAvailability/00000000-0000-0000-0000-000000000000`, { search: params })
            .map((res) => {
                let response = extractAvailability(res);
                return response;
            });
    }
    removeOrReInviteAssignedUser(userArray: Array<any>) {
        this._store.dispatch(new RemoveOrReInviteAssignedUsersAction(userArray));
    }

    public getFilteredUserData(query: string, courseId: string, isExample: boolean = false): Observable<any> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('assignTraineeUserFilter', query);
        params.set('companyUserFilter', this._claims.getCompanyIdOrCid() + ',' + courseId + ',' + isExample);
        params.set('userTypeFilter', this._claims.getCompanyIdOrCid() + ',' + '0');
        params.set('fields', 'FirstName,LastName,Id,Email,UserName,HasEmail,CompanyId');
        return this._data.get(`User`, { search: params })
            .map((res) => {
                return res.json();
            });
    }

}
