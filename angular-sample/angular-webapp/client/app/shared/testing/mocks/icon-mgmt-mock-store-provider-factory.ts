import { Icon } from '../../../risk-assessment/icon-management/models/icon';
import { Hazard } from "../../../risk-assessment/models/hazard";
import * as Immutable from 'immutable';
import { PagingInfo } from "../../../atlas-elements/common/models/ae-paging-info";
import { AtlasApiResponse } from "../../../shared/models/atlas-api-response";


export class IconManagementMockStoreProviderFactory {

    public static GetMockHazardIconsList() {

        let res = JSON.parse('{"Entities":[{"Id":"3ce19d3a-404e-4852-8ccb-9ad762e8c1c2","Name":"2 Display Screen Equipment","PictureId":null,"Description":"null","Category":0,"IsExample":true,"FirstName":"Peter ","LastName":"Doyle","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-19T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"2.0"},{"Id":"3f02ef92-7717-44c6-911f-d5655219effe","Name":"3 Driving (Occupational Road Risk)","PictureId":null,"Description":"","Category":0,"IsExample":true,"FirstName":"Peter ","LastName":"Doyle","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"9fc0bf5a-c003-402a-bac4-8ea61224317f","Name":"6 Physical Agents","PictureId":null,"Description":null,"Category":0,"IsExample":true,"FirstName":"Peter ","LastName":"Doyle","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"ad727251-bdfc-4d3f-ac46-6841f2c94dfe","Name":"Access by emergency services","PictureId":"01a94dd4-48fb-415e-831c-810ba898ebbc","Description":"Need to consider the site plan of where emergency vehicles can access the event area to respond to emergencies. ","Category":0,"IsExample":true,"FirstName":"Louise","LastName":"Shannon"},{"Id":"19c2bc7c-e597-4438-8b89-dd12f228604f","Name":"Access From Rear Of Machine.","PictureId":null,"Description":null,"Category":0,"IsExample":true,"FirstName":"Nathan","LastName":"Ormiston","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"02d90761-3a6d-4945-897d-251a737c0f33","Name":"Access/egress & Personal Competence","PictureId":"01a94dd4-48fb-415e-831c-810ba898ebbc","Description":null,"Category":0,"IsExample":true,"FirstName":"Lee","LastName":"Mockridge","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"9ad661cf-8868-4495-b06c-19c78114663a","Name":"Accident or Sudden Illness","PictureId":"01a94dd4-48fb-415e-831c-810ba898ebbc","Description":"Accident or sudden illness of staff member or pupil.","Category":0,"IsExample":true,"FirstName":"James","LastName":"MacDonald","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"3a92717f-0d6b-4661-a502-a58c9d9cae6b","Name":"Accident or Sudden Illness","PictureId":"01a94dd4-48fb-415e-831c-810ba898ebbc","Description":"Accident or sudden illness of staff member or child","Category":0,"IsExample":true,"FirstName":"James","LastName":"MacDonald","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"d62af9a9-6f53-40dd-911d-841698c30022","Name":"Actions of performers at events ","PictureId":"01a94dd4-48fb-415e-831c-810ba898ebbc","Description":"May include dangerous activities- fire, pyrotechnics, machinery, animals","Category":0,"IsExample":true,"FirstName":"Louise","LastName":"Shannon","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"3ccfc405-6013-482d-b5cd-8faefa4c4340","Name":"Acute skin effects. ","PictureId":"d97278ee-a0e7-45ab-9b84-bd7cc70d27f3","Description":"H314 - Causes severe skin burns.H315 - Causes skin irritation.","Category":0,"IsExample":true,"FirstName":"Louise","LastName":"Shannon","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"}],"PagingInfo":{"PageNumber":1,"Count":10,"TotalCount":694},"OtherInfo":null}');

        let hazardOrControlsList: Hazard[] = new Array();
        let body = res.Entities;
        body.map(hacl => {
            let hazardOrControl = new Hazard();
            hazardOrControl.Id = hacl['Id'];
            hazardOrControl.Name = hacl['Name'];
            hazardOrControl.Description = hacl['Description'];
            hazardOrControl.PictureId = hacl['PictureId'];
            hazardOrControl.Category = hacl['Category'];
            hazardOrControl.IsExample = hacl['IsExample'];
            hazardOrControl.CreatedBy = hacl['FirstName'] + ' ' + hacl['LastName'];
            hazardOrControl.CreatedOn = hacl['CreatedOn'];
            hazardOrControl.ModifiedBy = hacl['modifierFirstName'] + ' ' + hacl['modifierLastName'];
            hazardOrControl.ModifiedOn = hacl['ModifiedOn']
            hazardOrControl.Version = hacl['Version'];
            hazardOrControlsList.push(hazardOrControl);
        });

        let data: any =
            {
                HazardsOrControlsList: Immutable.List<Hazard>(hazardOrControlsList),
                HazardsOrControlsListPagingInfo: res.PagingInfo as PagingInfo
            }
        return data;

    }

    public static GetMockControlIconsList() {

        let res = JSON.parse('{"Entities":[{"Id":"20a95e36-526e-4b8b-b357-eb28cd6f9ec4","Name":"110 v equipment used on site","PictureId":"27af0fef-eefb-466c-a1e9-39ced54b486a","Description":"test","Category":0,"IsExample":true,"FirstName":"System","LastName":"User","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-19T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"2.0"},{"Id":"d12fc709-b4ec-4733-af75-66a4da1678c1","Name":"4.Cylinder connection hoses armour sleeved to prevent damage.","PictureId":"00000000-0000-0000-0000-000000000000","Description":"test","Category":0,"IsExample":true,"FirstName":"Nathan","LastName":"Ormiston","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"53504453-c2d7-4051-b223-0cd75d3d5905","Name":"5MPH on site","PictureId":"f5445a5e-c28b-427a-a598-b9d144e3e915","Description":null,"Category":0,"IsExample":true,"FirstName":"Georgia","LastName":"Rolls","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"138772d1-0b2d-4609-a91c-509a54066d1c","Name":"5mph speed limit on site","PictureId":"084b205d-ae6b-4565-a30b-dec6dc7cf448","Description":"","Category":0,"IsExample":true,"FirstName":"System","LastName":"User"},{"Id":"82aad452-c560-42cb-9e76-6f5f3bb2a8f2","Name":"A Manual Handling Assessment has been carried out ","PictureId":"ae38d472-9b77-42cf-b127-b1825af4edf0","Description":"","Category":0,"IsExample":true,"FirstName":"System","LastName":"User","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"9c6a7494-485d-4773-a750-017d0fcc1ea6","Name":"A system of regular inspections and assessments is instituted ","PictureId":"a82418c5-eb4a-4c46-bdfe-f32ea5b86e81","Description":"","Category":0,"IsExample":true,"FirstName":"System","LastName":"User","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"270d799e-03cd-4246-a25a-94cd1301371f","Name":"A transport assessment has been carried out","PictureId":"d5745243-3945-4474-a7d3-2ecbce9ad81a","Description":"","Category":0,"IsExample":true,"FirstName":"System","LastName":"User","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"ad3593ee-8264-465d-9114-4e10815ae9f1","Name":"A written assessment of work is made to enable control measures to be taken.","PictureId":"a82418c5-eb4a-4c46-bdfe-f32ea5b86e81","Description":"","Category":0,"IsExample":true,"FirstName":"System","LastName":"User","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"6774417f-ff6e-4c3c-a1a0-29d8b5cbb150","Name":"Abrasive wheels training","PictureId":"52df5554-50cb-4662-b33d-81b58238d10e","Description":"All operators of abrasive grinding wheels have received Abrasive Wheel Awareness Training and refreshment training Equipment is visually inspected prior to use, maintained in a fit and suitable condition Wheels are stored in a dry location All grinders are fitted with half guards, must be maintained and secured in place Safe working practices to be adhered to i.e. Angle grinder moved away from the body when not in use.","Category":0,"IsExample":true,"FirstName":"System","LastName":"User","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"334027e5-4d04-4c2d-8808-1e841382a9c7","Name":"Absorption mat or granular material on site","PictureId":"f5445a5e-c28b-427a-a598-b9d144e3e915","Description":null,"Category":0,"IsExample":true,"FirstName":"Brice","LastName":"Higgins","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"}],"PagingInfo":{"PageNumber":1,"Count":10,"TotalCount":1876},"OtherInfo":null}');

        let hazardOrControlsList: Hazard[] = new Array();
        let body = res.Entities;
        body.map(hacl => {
            let hazardOrControl = new Hazard();
            hazardOrControl.Id = hacl['Id'];
            hazardOrControl.Name = hacl['Name'];
            hazardOrControl.Description = hacl['Description'];
            hazardOrControl.PictureId = hacl['PictureId'];
            hazardOrControl.Category = hacl['Category'];
            hazardOrControl.IsExample = hacl['IsExample'];
            hazardOrControl.CreatedBy = hacl['FirstName'] + ' ' + hacl['LastName'];
            hazardOrControl.CreatedOn = hacl['CreatedOn'];
            hazardOrControl.ModifiedBy = hacl['modifierFirstName'] + ' ' + hacl['modifierLastName'];
            hazardOrControl.ModifiedOn = hacl['ModifiedOn'];
            hazardOrControl.Version = hacl['Version'];
            hazardOrControlsList.push(hazardOrControl);
        });

        let data: any =
            {
                HazardsOrControlsList: Immutable.List<Hazard>(hazardOrControlsList),
                HazardsOrControlsListPagingInfo: res.PagingInfo as PagingInfo
            }
        return data;

    }

    public static getTestHazardIconsResponse() {
        let res: AtlasApiResponse<any> = JSON.parse('{"Entities":[{"Id":"3ce19d3a-404e-4852-8ccb-9ad762e8c1c2","Name":"2 Display Screen Equipment","PictureId":null,"Description":"null","Category":0,"IsExample":true,"FirstName":"Peter ","LastName":"Doyle","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-19T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"2.0"},{"Id":"3f02ef92-7717-44c6-911f-d5655219effe","Name":"3 Driving (Occupational Road Risk)","PictureId":null,"Description":"","Category":0,"IsExample":true,"FirstName":"Peter ","LastName":"Doyle","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"9fc0bf5a-c003-402a-bac4-8ea61224317f","Name":"6 Physical Agents","PictureId":null,"Description":null,"Category":0,"IsExample":true,"FirstName":"Peter ","LastName":"Doyle","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"ad727251-bdfc-4d3f-ac46-6841f2c94dfe","Name":"Access by emergency services","PictureId":"01a94dd4-48fb-415e-831c-810ba898ebbc","Description":"Need to consider the site plan of where emergency vehicles can access the event area to respond to emergencies. ","Category":0,"IsExample":true,"FirstName":"Louise","LastName":"Shannon"},{"Id":"19c2bc7c-e597-4438-8b89-dd12f228604f","Name":"Access From Rear Of Machine.","PictureId":null,"Description":null,"Category":0,"IsExample":true,"FirstName":"Nathan","LastName":"Ormiston","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"02d90761-3a6d-4945-897d-251a737c0f33","Name":"Access/egress & Personal Competence","PictureId":"01a94dd4-48fb-415e-831c-810ba898ebbc","Description":null,"Category":0,"IsExample":true,"FirstName":"Lee","LastName":"Mockridge","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"9ad661cf-8868-4495-b06c-19c78114663a","Name":"Accident or Sudden Illness","PictureId":"01a94dd4-48fb-415e-831c-810ba898ebbc","Description":"Accident or sudden illness of staff member or pupil.","Category":0,"IsExample":true,"FirstName":"James","LastName":"MacDonald","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"3a92717f-0d6b-4661-a502-a58c9d9cae6b","Name":"Accident or Sudden Illness","PictureId":"01a94dd4-48fb-415e-831c-810ba898ebbc","Description":"Accident or sudden illness of staff member or child","Category":0,"IsExample":true,"FirstName":"James","LastName":"MacDonald","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"d62af9a9-6f53-40dd-911d-841698c30022","Name":"Actions of performers at events ","PictureId":"01a94dd4-48fb-415e-831c-810ba898ebbc","Description":"May include dangerous activities- fire, pyrotechnics, machinery, animals","Category":0,"IsExample":true,"FirstName":"Louise","LastName":"Shannon","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"},{"Id":"3ccfc405-6013-482d-b5cd-8faefa4c4340","Name":"Acute skin effects. ","PictureId":"d97278ee-a0e7-45ab-9b84-bd7cc70d27f3","Description":"H314 - Causes severe skin burns.H315 - Causes skin irritation.","Category":0,"IsExample":true,"FirstName":"Louise","LastName":"Shannon","CreatedOn":"2016-03-18T09:12:16.627","ModifiedOn":"2016-03-18T09:12:16.627","modifierFirstName":"James","modifierLastName":"MacDonald","Version":"1.0"}],"PagingInfo":{"PageNumber":1,"Count":10,"TotalCount":694},"OtherInfo":null}');
        return res;
    }
    public static getIcon(): Icon {
        return <Icon>JSON.parse('{"CompanyId": "89504e36-557b-4691-8f1b-7e86f9cf95ea","Name": "1 hazard","Description": "1 hazard", "PictureId": "83146e46-ecf2-46a7-88c6-f2715690ab8d", "IsExample": true,  "Category": 0,"Id": "84bb087f-d6bd-4058-ac48-b9966e4b3f94","CreatedOn": "2017-11-21T13:17:43.743","ModifiedOn": "2017-11-21T13:17:43.747","CreatedBy": "b8cec84e-b03d-4ea6-823c-37e9b8caf347","ModifiedBy": "b8cec84e-b03d-4ea6-823c-37e9b8caf347","IsDeleted": false,"LCid": 2057,"Version": "1.0"}');
    }
    public static getIconAsJson() {
        let json = { "CompanyId": "89504e36-557b-4691-8f1b-7e86f9cf95ea", "Name": "1 hazard", "Description": "1 hazard", "PictureId": "83146e46-ecf2-46a7-88c6-f2715690ab8d", "IsExample": true, "Category": 0, "Id": "84bb087f-d6bd-4058-ac48-b9966e4b3f94", "CreatedOn": "2017-11-21T13:17:43.743", "ModifiedOn": "2017-11-21T13:17:43.747", "CreatedBy": "b8cec84e-b03d-4ea6-823c-37e9b8caf347", "ModifiedBy": "b8cec84e-b03d-4ea6-823c-37e9b8caf347", "IsDeleted": false, "LCid": 2057, "Version": "1.0" };
        return json;
    }
}