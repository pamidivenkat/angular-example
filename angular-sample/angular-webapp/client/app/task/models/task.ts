import { User } from './task-activity';
import { Task } from 'protractor/built/taskScheduler';
import { Priority } from './task-priority';
import { TaskStatus } from './task-status';


export class TasksView {
    Id: string;
    Priority: Priority;
    Title: string;
    Description: string;
    Status: TaskStatus;
    DueDate: Date;
    AssignedTo: string;
    AssignedUserName: string;
    SiteName: string;
    CreatedByUserName: string;
    AcknowledgeDate: Date;
    TaskCategoryId: string;
    TaskCategoryName: string;
    PercentageCompleted: string;
    CostOfRectification: string;
    CorrectiveActionTaken: string;
    CompanyId: string;
    CreatedBy: string;
    CreatedOn: Date;
    AssignToAll: boolean;
    AssignedUsersList: User[];
    AssignedUsers: User[];
    SendEmailNotification: boolean;
}