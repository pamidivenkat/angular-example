import { Post, PostType } from "./post";
import { AssociateUser } from "./user";

export class Notification {
  id: number;
  associateId: number;
  entityId: number;
  postType: PostType;
  active: boolean;
  associateUser: AssociateUser;
  createdBy: string;
  createdOn: Date;
  modifiedBy: string;
  modifiedOn: Date;
  notificationItems: Array<NotificationItem>;
}

export class NotificationItem {
  active: boolean;
  associateId: number;
  associateUser: AssociateUser;
  answerReply: number;
  description: string;
  id: number;
  notification: Notification;
  notificationId: number;
  postType: PostType;
  submitted: Date;
  post: Post;
  age: number;
  property: { propertyId: number; propertyName: string };
  isNew: boolean;
}
