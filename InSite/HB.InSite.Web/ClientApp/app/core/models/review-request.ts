import { Property } from "./property";

export class ReviewRequest {
  id: number;
  property: Property;
  propertyId: number;
  active: number;
}
