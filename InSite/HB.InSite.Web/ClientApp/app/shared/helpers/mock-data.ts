import { Property } from "../../core/models/property";
import { AssociateUser } from "../../core/models/user";
import { Inspection, SectionItem, Section } from "./../../core/models/inspection";

export class MockData {
  static getMockInspection(): Inspection {
    let inspection = new Inspection();
    let user = new AssociateUser();
    user.firstName = "David";
    user.lastName = "Winters";
    user.fullname = "David Winters";
    user.photoUrl = "https://randomuser.me/api/portraits/men/97.jpg";
    inspection.createdBy = "b73fb713-0991-44c9-8ef9-95554dbc78a4";
    inspection.associateUser = user;
    inspection.createdOn = new Date().toString();

    let property = new Property();
    property.propertyName = "Hyat Regency";
    property.cityName = "Savannah";
    property.stateName = "Georgia";
    property.propertyId = 277;
    inspection.property = property;

    // inspection.overallRating = 4;
    // inspection.notes = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus in magna et nisi facilisis condimentum et quis lacus. Aenean volutpat felis odio. Nunc blandit turpis a lobortis venenatis. Sed pharetra erat sed diam elementum, id sollicitudin lectus tempor. Nullam dapibus odio sed gravida condimentum. Proin convallis, justo ac tincidunt aliquam, dolor sem porta tellus, at pulvinar nisi risus vitae leo. Ut vel lobortis eros. Ut enim nisi, tincidunt eu facilisis sit amet, luctus non tortor. Maecenas scelerisque, lectus ut sagittis consequat, diam nunc dignissim tortor, in feugiat elit justo ac tellus. Duis iaculis sed justo non luctus. Pellentesque commodo dui ex, at rhoncus risus porta ac. Donec sed ligula lectus. Phasellus posuere enim egestas, maximus neque ut, congue ligula. Quisque quis justo eu felis porta accumsan vitae eget risus. Cras hendrerit ante nec metus sagittis hendrerit.`;

    inspection.tblInspectionSections = [];
    inspection.tblInspectionSections[0] = new Section();
    inspection.tblInspectionSections[0].detailedNotes = `Vestibulum eu dui in lacus dignissim tristique vel vitae tellus. Duis felis lacus, viverra sed arcu eget, faucibus hendrerit mauris. Vivamus dapibus mi eget tellus laoreet, quis volutpat nisl varius. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec pharetra ipsum enim, eget suscipit tellus fermentum condimentum. Quisque at ante iaculis, semper diam quis, ornare leo. Donec viverra egestas ligula, non commodo tellus elementum at. Praesent aliquam felis vitae est ullamcorper, ut imperdiet nisl interdum. Vivamus vel vehicula libero, at blandit massa. Proin viverra cursus massa, eu viverra quam. Ut non placerat dolor, et consectetur purus.`;
    inspection.tblInspectionSections[0].rating = 3;
    // inspection.sections[0].name = "Public Space";
    inspection.tblInspectionSections[0].inspectionSectionItems = [];
    inspection.tblInspectionSections[0].inspectionSectionItems[0] = new SectionItem();
    inspection.tblInspectionSections[0].inspectionSectionItems[0].name = "Loby";
    inspection.tblInspectionSections[0].inspectionSectionItems[0].quality = 4;
    inspection.tblInspectionSections[0].inspectionSectionItems[0].rate = null;
    inspection.tblInspectionSections[0].inspectionSectionItems[0].roomSize = 1000;
    inspection.tblInspectionSections[0].inspectionSectionItems[0].isOnsite = true;
    inspection.tblInspectionSections[0].inspectionSectionItems[0].photo1url =
      "https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260";
    inspection.tblInspectionSections[0].inspectionSectionItems[0].photo2url =
      "https://images.pexels.com/photos/277572/pexels-photo-277572.jpeg?auto=compress&cs=tinysrgb&h=350";
    inspection.tblInspectionSections[0].inspectionSectionItems[0].photo3url =
      "https://images.pexels.com/photos/260931/pexels-photo-260931.jpeg?auto=compress&cs=tinysrgb&h=350";
    inspection.tblInspectionSections[0].inspectionSectionItems[0].photo4url =
      "https://images.pexels.com/photos/635041/pexels-photo-635041.jpeg?auto=compress&cs=tinysrgb&h=350";

    inspection.tblInspectionSections[1] = new Section();
    inspection.tblInspectionSections[1].detailedNotes = `Nam lobortis sed est et pretium. In id condimentum nunc, ut porttitor diam. Mauris sed ante et ex consectetur pulvinar quis sed elit. Pellentesque leo orci, scelerisque consectetur est ut, eleifend gravida nisl. Curabitur congue porta purus, et congue lorem finibus sit amet. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam a ultricies velit. Vestibulum eu pulvinar leo. Aliquam rhoncus purus nibh, nec ultricies libero finibus sed. `;
    inspection.tblInspectionSections[1].rating = 4;
    // inspection.sections[1].name = "Guest Rooms";
    inspection.tblInspectionSections[1].inspectionSectionItems = [];
    inspection.tblInspectionSections[1].inspectionSectionItems[0] = new SectionItem();
    inspection.tblInspectionSections[1].inspectionSectionItems[0].name = "Delux Room - Double";
    inspection.tblInspectionSections[1].inspectionSectionItems[0].quality = 3;
    inspection.tblInspectionSections[1].inspectionSectionItems[0].rate = 275;
    inspection.tblInspectionSections[1].inspectionSectionItems[0].roomSize = 280;
    inspection.tblInspectionSections[1].inspectionSectionItems[0].isOnsite = true;
    inspection.tblInspectionSections[0].inspectionSectionItems[0].photo1url =
      "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&h=350";
    inspection.tblInspectionSections[0].inspectionSectionItems[0].photo2url =
      "https://images.pexels.com/photos/210265/pexels-photo-210265.jpeg?auto=compress&cs=tinysrgb&h=350";
    inspection.tblInspectionSections[0].inspectionSectionItems[0].photo3url =
      "https://images.pexels.com/photos/189333/pexels-photo-189333.jpeg?auto=compress&cs=tinysrgb&h=350";

    return inspection;
  }
}
