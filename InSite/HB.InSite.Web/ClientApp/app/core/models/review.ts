import { Property } from "./property";
import { AssociateUser, User } from "./user";
import { Attachment } from "./post";

export class Review {
  reviewId: number;
  propertyId: number;
  property: Property;
  associateId: number;
  associateUser: AssociateUser;
  reviewType: number;
  reviewSummary: string;
  detailedReview: string;
  venueCondition: number;
  serviceQuality: number;
  fbQuality: number;
  overallExperience: number;
  isRecommended: boolean;
  isApproved: boolean;
  reviewDate: Date;
  expirationDate: Date;
  activeStatus: number;
  bVenueCondition: boolean;
  bServiceQuality: boolean;
  bFbQuality: boolean;
  bOverallExperience: boolean;
  fullName: string;
  organizationName: string;
  programName: string;
  programStartDate: string;
  postType: string;
  mobileReview: boolean;
  hbAssociateFeedBack: string;
  expirationReminder: boolean;
  numberOfAttendees: number;
  testimonial: string;
  associates: string;
  responseTimeliness: number;
  bResponseTimeliness: boolean;
  hbFriendliness: number;
  bHbFriendliness: boolean;
  destinationKnowledge: number;
  bDestinationKnowledge: boolean;
  createdBy: string;
  createdOn: string;
  attachments: Array<Attachment>;
  showOnInsite: boolean;
}

export class AssociateReview {
  reviewId: number;
  propertyId: number;
  property: Property;
  associateId: number;
  associateUser: AssociateUser;
  reviewType: number;
  reviewSummary: string;
  detailedReview: string;
  venueCondition: number;
  bVenueCondition: boolean;
  serviceQuality: number;
  bServiceQuality: boolean;
  fbQuality: number;
  bFbQuality: boolean;
  overallExperience: number;
  bOverallExperience: boolean;
  responseTimeliness: number;
  bResponseTimeliness: boolean;
  hbFriendliness: number;
  bHbFriendliness: boolean;
  destinationKnowledge: number;
  bDestinationKnowledge: boolean;
  isRecommended: boolean;
  hbAssociateFeedBack: string;
  testimonial: string;
  reviewDate: Date;
  expirationDate: Date;
  activeStatus: number;
  isApproved: boolean;
  postType: string;
  mobileReview: boolean;
  expirationReminder: boolean;
  attachments: Array<Attachment>;
  createdBy: any;
  createdOn: any;
}

export enum ReviewType {
  Venue = 0,
  Cvb = 1
}
