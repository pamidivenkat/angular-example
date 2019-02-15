import { AssociateUser } from "./user";

export class Comment {
  id: number;
  postId: number;
  associateId: number;
  detail: string;
  expirationDate: Date;
  active: boolean;
  createdBy: string;
  createdOn: Date;
  modifiedBy: string;
  modifiedOn: Date;
  associateUser: AssociateUser;
  archive: boolean;
  commentid: number;
  replies: Array<Comment>;
}
