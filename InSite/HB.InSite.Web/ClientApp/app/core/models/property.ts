export class Property {
  propertyId: number;
  propertyName: string;
  locationId: number;
  location: string;
  propertyChainId: number;
  propertyChainName: string;
  postProperties: Array<any>;
  inspections: Array<any>;
  promotions: Array<any>;
  reviews: Array<any>;
  propertyAddress: string;
  cityName: string;
  cityId: number;
  stateName: string;
  propertyZip: string;
  countryName: string;
  propertyAdvanceEligible: boolean;
  propertyManagementCoId: number;
  propertyCode: string;
  active: boolean;
  dateAdded: Date;
  updateDate: Date;
  webAddress: string;
  type: number;
  isInternalOnly: boolean;
  bookmarkId: number;
  notificationId: number;
  imageUrl: string;
  partnerType: string;
}

export class Contact {
  Id: number;
  FirstName: string;
  LastName: string;
  Mobile: string;
  Email: string;
}

export class Content {
  createdOn: Date;
  detail: string;
  entityId: number;
  type: number;
  id: number;
  recordCount: number;
  title: string;
}

export class ProgramStartDate {
  id: number;
  propertyId: number;
  year: number;
  totalPrograms: number;
  convertedRevenue: number;
  roomNights: number;
  convertedADR: number;
  convertedMCR: number;
}

export class Summary {
  propertyId: number;
  bookingid: number;
  programStartDate: string;
  bookingDate: string;
  rooms: number;
  adr: number;
  mcr: number;
  mcrType: string;
  currencyCode: string;
}

export enum ReportType {
  "summary" = "Booking History Summary",
  "adr" = "ADR",
  "mcr" = "MCR",
  "programDate" = "Program Date",
  "bookingDate" = "Booking Date"
}
