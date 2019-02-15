import { AssociateUser } from "./user";
import { Property } from "./property";

export class Inspection {
  inspectionId: number;
  associateUser: AssociateUser;
  createdBy: string;
  createdOn: string;
  property: Property;
  tblInspectionSections: Array<Section>;
  venuePhotoUrl: string;
}

export class Section {
  inspectionSectionID: number;
  rating: number;
  inspectionSectionType: SectionType;
  detailedNotes: string;
  inspectionSectionItems: Array<SectionItem>;
}

export class SectionType {
  sectionTypeID: number;
  sectionName: string;
}

export class SectionItem {
  name: string;
  priceScale: number;
  quality: number;
  rate: number;
  roomSize: number;
  isOnsite: boolean;
  photo1url: string;
  photo2url: string;
  photo3url: string;
  photo4url: string;
  inspectionItemType: itemSectionType;
  notes: string;
}

export class itemSectionType {
  inspectionSectionType: SectionType;
  itemName: string;
  itemTypeID: 2;
}
