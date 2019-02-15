import { Answer } from "./answer";
import { Comment } from "./comment";
import { Location } from "./location";
import { Property } from "./property";
import { PropertyChain } from "./propertyChain";
import { AssociateUser } from "./user";

export class Post {
  active: boolean;
  archive: boolean;
  answered: boolean;
  answers: Array<Answer>;
  attachments: Array<any>;
  categoryId: number;
  createdBy: string;
  createdOn: Date;
  detail: string;
  entityId: number;
  expirationDate: Date;
  id: number;
  modifiedBy: string;
  modifiedOn: Date;
  numberOfComments: number;
  numberofAnswers: number;
  postLocations: Array<PostLocation>;
  postProperties: Array<PostProperty>;
  postPropertyChains: Array<PostPropertyChain>;
  title: string;
  type: number;
  expirationReminder: boolean;
  comments: Array<Comment>;
  associateUser: AssociateUser;
  bookmarkId: number;
  notificationId: number;
  renewedCount: number;
}

export enum PostType {
  Insight = 1,
  Question = 2,
  Review = 4,
  Promotion = 8,
  Inspection = 16,
  Venue = 32,
  CVB = 64
}

export class PostProperty {
  postId: number;
  propertyId: number;
  property: Property;
}

export class PostPropertyChain {
  postId: number;
  propertyChainID: number;
  propertyChain: PropertyChain;
}

export class PostLocation {
  postId: number;
  locationId: number;
  location: Location;
}

export class Attachment {
  fileIdentifier: string;
  fileName: string;
  fileSize: number;
  id: number;
  postId: number;
  active: boolean;
  createdOn: string;
  createdBy: string;
  modifiedOn: string;
  modifiedBy: string;
  isImage: boolean;
}

export class Advertisement {
  advertisementId: number;
  imageURL: string;
  navigateURL: string;
  toolTipText: string;
  active: boolean;
}
