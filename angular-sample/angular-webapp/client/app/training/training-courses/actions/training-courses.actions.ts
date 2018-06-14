import { User } from '../../../shared/models/user';
import { AtlasApiRequestWithParams, AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import { TrainingCourse } from '../../models/training-course';
import { AeSortModel } from "../../../atlas-elements/common/models/ae-sort-model";
export const ActionTypes = {
    TRAINING_COURSES_LOAD: type('[TRAININGCOURSES] load training course'),
    TRAINING_COURSES_LOAD_COMPLETE: type('[TRAININGCOURSES] load training course complete'),
    TRAINING_COURSES_ADD: type('[TRAININGCOURSES] add training course'),
    TRAINING_COURSES_ADD_COMPLETED: type('[TRAININGCOURSES] add training course completed'),
    TRAINING_COURSES_UPDATE: type('[TRAININGCOURSES] update training course record'),
    TRAINING_COURSES_UPDATE_COMPLETE: type('[TRAININGCOURSES] update training course record complete'),
    TRAINING_COURSES_DELETE: type('[TRAININGCOURSES] delete training course record'),
    TRAINING_COURSES_DELETE_COMPLETE: type('[TRAININGCOURSES] delete training course record complete'),
    TRAINING_COURSE_ON_FILTERS_CHANGE: type('[TRAININGCOURSES] load training course on filter change'),
    TRAINING_COURSE_ON_STATUS_CHANGE: type('[TRAININGCOURSES] load training course on status change'),
    TRAINING_COURSE_ON_STATUS_CHANGE_COMPLETE: type('[TRAININGCOURSES] load training course on status change complete'),
    TRAINING_MODULE_LOAD: type('[TRAININGCOURSES] load training module'),
    TRAINING_MODULE_LOAD_COMPLETE: type('[TRAININGCOURSES] load training module complete'),
    TRAINING_SELECTED_MODULE: type('[TRAININGCOURSES] load training selected module'),
    TRAINING_SELECTED_MODULE_COMPLETE: type('[TRAININGCOURSES] load training selected module complete'),
    LOAD_TRAINING_COURSE_INVITEES: type('[TRAININGCOURSES] load users of selected course'),
    LOAD_TRAINING_COURSE_INVITEES_COMPLETE: type('[TRAININGCOURSES] load users of selected course complete'),
    SEND_INVITE_FOR_SELECTED_COURSE: type('[TRAININGCOURSES] send invitefor selected course'),
    SEND_INVITE_FOR_SELECTED_COURSE_COMPLETE: type('[TRAININGCOURSES] send invitefor selected course complete'),
    INVITE_PUBLIC_USER_FOR_TRAINING_COURSE: type('[TRAININGCOURSES]invite public user'),
    INVITE_PUBLIC_USER_FOR_TRAINING_COURSE_COMPLETE: type('[TRAININGCOURSES]invite public user complete'),
    REMOVE_OR_REINVITE_ASSIGNED_USERS_ACTION: type('[TRAININGCOURSES] remove assigned users'),
    REMOVE_OR_REINVITE_ASSIGNED_USERS_COMPLETE_ACTION: type('[TRAININGCOURSES] remove assigned users complete'),
    SEND_INVITE_FOR_SELECTED_COURSE_REGARDINGOBJECTS: type('[TRAININGCOURSES] send invitefor selected course regarding objects'),
    SEND_INVITE_FOR_SELECTED_COURSE_REGARDINGOBJECTS_COMPLETE: type('[TRAININGCOURSES] send invitefor selected course regarding objects complete'),
   
}

export class SendInviteForSelectedCourseRegardingObjectsAction implements Action {
    type = ActionTypes.SEND_INVITE_FOR_SELECTED_COURSE_REGARDINGOBJECTS;
    constructor(public payload: any) { }
}
export class SendInviteForSelectedCourseRegardingObjectsCompleteAction implements Action {
    type = ActionTypes.SEND_INVITE_FOR_SELECTED_COURSE_REGARDINGOBJECTS_COMPLETE;
    constructor(public payload: any) { }
}

export class TrainingCoursesLoad implements Action {
    type = ActionTypes.TRAINING_COURSES_LOAD;
    constructor(public payload: any) {

    }
}

export class TrainingCoursesLoadComplete implements Action {
    type = ActionTypes.TRAINING_COURSES_LOAD_COMPLETE;
    constructor(public payload: any) {

    }
}

export class AddTrainingCoursesAction implements Action {
    type = ActionTypes.TRAINING_COURSES_ADD;
    constructor(public payload: TrainingCourse) {

    }
}

export class AddTrainingCoursesCompletedAction implements Action {
    type = ActionTypes.TRAINING_COURSES_ADD_COMPLETED;
    constructor(public payload: boolean) {

    }
}

export class UpdateTrainingCoursesAction implements Action {
    type = ActionTypes.TRAINING_COURSES_UPDATE;
    constructor(public payload: TrainingCourse) {

    }
}

export class UpdateTrainingCoursesCompletedAction implements Action {
    type = ActionTypes.TRAINING_COURSES_UPDATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class DeleteTrainingCoursesAction implements Action {
    type = ActionTypes.TRAINING_COURSES_DELETE;
    constructor(public payload: TrainingCourse) {

    }
}

export class DeleteTrainingCoursesCompletedAction implements Action {
    type = ActionTypes.TRAINING_COURSES_DELETE_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class LoadTrainingCoursesOnFilterChange implements Action {
    type = ActionTypes.TRAINING_COURSE_ON_FILTERS_CHANGE;
    constructor(public payload: Map<string, string>) { }
}

export class LoadTrainingCoursesOnstatusChange implements Action {
    type = ActionTypes.TRAINING_COURSE_ON_STATUS_CHANGE;
    constructor(public payload: TrainingCourse) { }
}

export class LoadTrainingCoursesOnstatusChangeComplete implements Action {
    type = ActionTypes.TRAINING_COURSE_ON_STATUS_CHANGE_COMPLETE;
    constructor(public payload: any) { }
}

export class LoadTrainingModule implements Action {
    type = ActionTypes.TRAINING_MODULE_LOAD
    constructor(public payload: any) { }
}

export class LoadTrainingModuleComplete implements Action {
    type = ActionTypes.TRAINING_MODULE_LOAD_COMPLETE;
    constructor(public payload: any) { }
}

export class LoadTrainingSelectedModule implements Action {
    type = ActionTypes.TRAINING_SELECTED_MODULE
    constructor(public payload: AtlasApiRequestWithParams) { }
}

export class LoadTrainingSelectedModuleComplete implements Action {
    type = ActionTypes.TRAINING_SELECTED_MODULE_COMPLETE;
    constructor(public payload: any) { }
}

export class LoadTrainingCourseUserModule implements Action {
    type = ActionTypes.LOAD_TRAINING_COURSE_INVITEES;
    constructor(public payload: AtlasApiRequestWithParams) { }
}
export class LoadTrainingCourseUserModuleComplete implements Action {
    type = ActionTypes.LOAD_TRAINING_COURSE_INVITEES_COMPLETE;
    constructor(public payload: any) { }
}
export class SendInviteForSelectedCourseAction implements Action {
    type = ActionTypes.SEND_INVITE_FOR_SELECTED_COURSE;
    constructor(public payload: Array<User>) { }
}
export class SendInviteForSelectedCourseCompleteAction implements Action {
    type = ActionTypes.SEND_INVITE_FOR_SELECTED_COURSE_COMPLETE;
    constructor(public payload: any) { }
}
export class InvitePublicUserAction implements Action {
    type = ActionTypes.INVITE_PUBLIC_USER_FOR_TRAINING_COURSE;
    constructor(public payload: User) { }
}
export class InvitePublicUserCompleteAction implements Action {
    type = ActionTypes.INVITE_PUBLIC_USER_FOR_TRAINING_COURSE_COMPLETE;
    constructor(public payload: any) { }
}
export class RemoveOrReInviteAssignedUsersAction implements Action {
    type = ActionTypes.REMOVE_OR_REINVITE_ASSIGNED_USERS_ACTION;
    constructor(public payload: Array<any>) { }
}
export class RemoveOrReInviteAssignedUsersCompleteAction implements Action {
    type = ActionTypes.REMOVE_OR_REINVITE_ASSIGNED_USERS_COMPLETE_ACTION;
    constructor(public payload: any) { }
}
