import { Validators } from '@angular/forms';
export class TaskActivity {
  CompanyId: string;
  Title: string;
  Description: string;
  Priority: number;
  Status: number;
  DueDate: Date;
  AssignedTo: string;
  PercentageCompleted?: number;
  CostOfRectification?: number;
  AcknowledgeDate?: Date;
  SendNotification: boolean;
  CorrectActionTaken: string;
  AssignedUsers: Array<User>;
  AssignToAll: boolean;
  TaskCategoryId: string;
  Id: string;
  TaskSubAction: TaskSubAction;
  HazardImageURL: string;
  HazardName: string;
  AssignedUser: User;
  IsCancelled: boolean;
  RegardingObjectId: string;
  RegardingObjectTypeCode: string;
  Constants: {};
  SubObjectId: string;
}

export class TaskSubAction {
  Id: string;
  CourseId: string;
  IndividualToTrain: string;
  SubActionType: boolean;
  SubObjectId: string;
}

export class User {
  Id: string;
  FullName: string;
  constructor(id: string, fullName: string) {
    this.Id = id;
    this.FullName = fullName;
  }
}