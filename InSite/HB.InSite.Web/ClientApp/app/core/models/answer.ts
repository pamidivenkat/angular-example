import { Comment } from "./comment";
import { Post, Attachment } from "./post";
import { AssociateUser } from "./user";

export class Answer {
  answerId: number;
  postId: number;
  answerSummary: string;
  answerDetails: string;
  subscribeQuestion: boolean;
  processTypeId: number;
  associateId: number;
  isAboutVenue: boolean;
  expirationdate: string;
  remindme: boolean;
  insightId: number;
  activeStatus: number;
  viaEmail: number;
  post: Post;
  createdOn: string;
  createdBy: string;
  modifiedOn: string;
  modifiedBy: string;
  associateUser: AssociateUser;
  attachments: Array<Attachment>;
  replies: Array<Reply>;
  answerProperties: Array<any>;
  answerPropertyChains: Array<any>;
  answerLocations: Array<any>;
  active: boolean;
  archive: boolean;
}

export class Reply {
  id: number;
  active: boolean;
  answerid: number;
  archive: boolean;
  associateId: number;
  createdBy: string;
  createdOn: string;
  detail: string;
  associateUser: AssociateUser;
}
