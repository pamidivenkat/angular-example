import { Property } from "./property";

export class Promotion {
  promoId: number;
  propertyId: number;
  promoContact: string;
  promoPhone: string;
  promoEmail: string;
  headline: string;
  details: string;
  startDate: Date;
  endDate: Date;
  dateOffered: Date;
  expirationDate: Date;
  starRating: number;
  webAddress: string;
  bookmarkId: number;
  property: Property;
}
