import { isNullOrUndefined } from 'util';
import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import { User } from './../../email-shared/models/email.model';
import { TrainingReports } from '../models/training-reports';
import { MyTraining } from '../../home/models/my-training';
import { Response } from '@angular/http';
import * as Immutable from 'immutable';
import { PagingInfo } from "../../atlas-elements/common/models/ae-paging-info";
import { TrainingCourse, TrainingModule } from "../../training/models/training-course";
import { TrainingReportProgress } from '../../training/common/training-report-view';

export function extractTrainingsList(response: Response): Immutable.List<MyTraining> {
    let trainngsList = response.json().Entities as MyTraining[];
    return Immutable.List(trainngsList);
}

export function extractTrainingCoursePagingInfo(response: Response): PagingInfo {
    let employeeGroupsPagingInfo = response.json().PagingInfo as PagingInfo;
    return employeeGroupsPagingInfo;
}

export function extractTrainingCourseList(response: Response): Immutable.List<TrainingCourse> {
    let trainingCourseList = response.json().Entities as TrainingCourse[];
    return Immutable.List<TrainingCourse>(trainingCourseList);

}
export function extractTrainingCourseModulesList(response: Response): TrainingModule[] {
    return response.json().Entities as TrainingCourse[];

}

export function extractTrainingCourseSelectedModulesList(response: Response): TrainingCourse {
    return response.json() as TrainingCourse;

}
export function extractTrainingReportsList(response: Response): Immutable.List<TrainingReports> {
    let trainingReportsList = response.json().Entities as TrainingReports;
    return Immutable.List<TrainingReports>(trainingReportsList);
}

export function mapUsersListToAeSelect(users: User[]): AeSelectItem<string>[] {
    return (users.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.FirstName + ' ' + keyValuePair.LastName, keyValuePair.Id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    }));
}

export function getStatusText(status: TrainingReportProgress): string {
    switch (status) {
        case TrainingReportProgress.All:
            return 'All';
        case TrainingReportProgress.Passed:
            return 'Passed';
        case TrainingReportProgress.Pending:
            return 'Pending';
        case TrainingReportProgress.Failed:
            return 'Failed';
        case TrainingReportProgress.Complete:
            return 'Complete';
        case TrainingReportProgress.Incomplete:
            return 'Incomplete';
    }
    return '';
}

export function getStatusValues(data) {
    let finalValue: string = ''
    if (!isNullOrUndefined(data.status) && data.status.length > 0) {
        if (!isNullOrUndefined((<any>data.status[0]).Value)) {
            <any>data.status.forEach(st => {
                finalValue = finalValue + st.Value + ",";
            });
            return finalValue.substring(0, finalValue.length - 1);
        }
        else
            return data.status.join(',');
    } else {
        return data.status.Value ? data.status.Value : data.status;
    }
}

export function removeUpdatedTrainingsFromLocalStorage(trainingIds) {
    if (!isNullOrUndefined(trainingIds) && trainingIds.length > 0) {
        trainingIds.map((id, key) => {
            let item = id + 'cmi.core.lesson_status'; //63f0c647-a7c2-4bfe-8788-f834b7247a8acmi.core.lesson_status
            if (!isNullOrUndefined(window.localStorage.getItem(item))) {
                window.localStorage.removeItem(item);
            }
        });
    }
}

export function removePassedTrainingsFromLocalStorage(trainingUserCourseId: string) {
    let item = trainingUserCourseId + 'cmi.core.lesson_status';
    if (!isNullOrUndefined(window.localStorage.getItem(item))) {
        window.localStorage.removeItem(item);
    }
}