import { Department } from '../../../calendar/model/calendar-models';
import { Document } from '../../../document/models/document';
import { DistributedDocument } from '../../../document/document-details/models/document-details-model';
import { CQCStandards, CQCCategories } from "../../../document/document-details/models/export-to-cqc-model";
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import * as Immutable from 'immutable';
import { extractCQCStandardsData, extractCQCCategoriesData, extractCQCSelectOptionListData } from '../../../document/document-details/common/document-export-to-cqc-helper';
import { Response, ResponseOptions } from '@angular/http';

export class DocumentsMockStoreforCQCandDistribute {
    public static getDepartments(): Department[] {
        let res: any = JSON.parse('{"Entities":[{"Id":"9af61993-59cc-64b1-c2c2-d70fb806f1be","Name":"4yyetrthrtyh"},{"Id":"08e02d2f-46a3-f878-a6fe-797f1c8333b7","Name":"a3"},{"Id":"c5403209-3a4f-5832-1c78-ba88bddd9c4b","Name":"a3 team"},{"Id":"565129ca-a25b-5e69-1928-ba5b6e22cbfc","Name":"a4"},{"Id":"04d5695e-fbb8-960c-0668-59f87a535a6a","Name":"Citation Team"},{"Id":"932da320-003d-f517-99f2-9569137856ab","Name":"HR Departments"},{"Id":"62f788dd-cc39-4f66-9258-1b85879cb3af","Name":"Live Team"},{"Id":"7f65b1f3-a02d-499a-bdac-f2ab5ea9d46d","Name":"Live test"},{"Id":"6c3b4172-a76f-4f95-8649-1412d39878e1","Name":"Live Today 26"},{"Id":"50371495-b7dd-41bb-8245-cf02c697e164","Name":"mahesh123"},{"Id":"82c4185b-452a-3823-3df9-b83280b5b346","Name":"new12"},{"Id":"752e9d58-4984-4753-a1a9-e2e68e3b2af7","Name":"Office"},{"Id":"f54558dd-9163-0b87-2abe-67f15e3acd8e","Name":"real"},{"Id":"9cbd3a43-23a4-703c-975b-87037fb5a897","Name":"Release Department"},{"Id":"37cbfe48-eb17-27d2-dce4-1023cc3371fa","Name":"test"},{"Id":"ee3b81ec-9cf2-bfba-6919-337d6aa09eea","Name":"Test Department"},{"Id":"61e1c066-aac1-59dc-f382-46940e965bdf","Name":"Test Team"},{"Id":"7b83d7e2-49f2-45cb-8a75-73210ccc5fc8","Name":"testteam"},{"Id":"75859a40-7e9e-40fd-9435-ae2b92a226c6","Name":"TTN"},{"Id":"64800b0c-c97f-4a73-8127-142d300abef3","Name":"Warehouse"}],"PagingInfo":{"PageNumber":1,"Count":99999,"TotalCount":20},"OtherInfo":null}');
        return res.Entities;
    }

    public static getMockOtherDocumentData() {
        let res: Document[] = JSON.parse('{"Author":{"Author":null,"Modifier":null,"Permissions":null,"UserProfiles":null,"FirstName":"SO","LastName":"VLTC","Pin":null,"Email":"so@vltc1.co.uk","PictureId":"00000000-0000-0000-0000-000000000000","CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","SalesforceUserID":null,"FullName":"SO VLTC","Area":0,"AreaDesc":"General","HasEmployee":false,"CreateEmployee":false,"ClientAffiliationId":null,"SalesForceAccountId":null,"UserRole":null,"CompanyIndustrySector":null,"ServiceTypeHealthAndSafety":false,"ServiceTypeEmploymentLaw":false,"IsCitationConsultant":false,"ServiceTypeISOCertification":false,"CompanyOrganisationalSize":0,"PrimaryPermissionName":"","PrimaryPermission":null,"IsClientAccessingDocumentLibrary":false,"CanCreateExampleRA":false,"Name":"SO VLTC","Description":"not menioned","Identity":null,"Telephone":null,"Signature":"d1d6e282-0d03-4694-8241-86abe181be6f","Qualifications":null,"jitbitUserId":7074,"AdviceCards":null,"ACN":"","TenantName":null,"Notes":null,"IsActive":true,"MobileNumber":null,"IsCitationEmployee":false,"HasEmail":true,"Password":null,"ConfirmPassword":null,"UserName":"so@vltc1.co.uk","Claims":null,"Id":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","CreatedOn":"2015-09-13T17:25:00","ModifiedOn":"2017-07-25T09:05:00","CreatedBy":"89504e36-557b-4691-8f1b-7e86f9cf95ea","ModifiedBy":"b325a37f-ad85-4785-b16e-55dc92df83e5","IsDeleted":false,"LCid":1033,"Version":"1.15"},"Country":null,"DocumentDetails":null,"DocumentVaultSubCategory":null,"Modifier":{"Author":null,"Modifier":null,"Permissions":null,"UserProfiles":null,"FirstName":"SO","LastName":"VLTC","Pin":null,"Email":"so@vltc1.co.uk","PictureId":"00000000-0000-0000-0000-000000000000","CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","SalesforceUserID":null,"FullName":"SO VLTC","Area":0,"AreaDesc":"General","HasEmployee":false,"CreateEmployee":false,"ClientAffiliationId":null,"SalesForceAccountId":null,"UserRole":null,"CompanyIndustrySector":null,"ServiceTypeHealthAndSafety":false,"ServiceTypeEmploymentLaw":false,"IsCitationConsultant":false,"ServiceTypeISOCertification":false,"CompanyOrganisationalSize":0,"PrimaryPermissionName":"","PrimaryPermission":null,"IsClientAccessingDocumentLibrary":false,"CanCreateExampleRA":false,"Name":"SO VLTC","Description":"not menioned","Identity":null,"Telephone":null,"Signature":"d1d6e282-0d03-4694-8241-86abe181be6f","Qualifications":null,"jitbitUserId":7074,"AdviceCards":null,"ACN":"","TenantName":null,"Notes":null,"IsActive":true,"MobileNumber":null,"IsCitationEmployee":false,"HasEmail":true,"Password":null,"ConfirmPassword":null,"UserName":"so@vltc1.co.uk","Claims":null,"Id":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","CreatedOn":"2015-09-13T17:25:00","ModifiedOn":"2017-07-25T09:05:00","CreatedBy":"89504e36-557b-4691-8f1b-7e86f9cf95ea","ModifiedBy":"b325a37f-ad85-4785-b16e-55dc92df83e5","IsDeleted":false,"LCid":1033,"Version":"1.15"},"ReviewUser":null,"Sector":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","VirginVersion":"1.0","Size":379314,"LastModifiedDateTime":"2016-12-18T20:56:41","DocumentOrigin":0,"IsDistributable":true,"Sensitivity":null,"Title":"060917 FF File","FileName":"112182016.pdf","Category":0,"Usage":2,"Description":"not menioned","State":4,"Comment":"Document created","ExpiryDate":"2017-09-29T07:59:00","ReminderInDays":null,"IsReminderRequired":false,"CategoryName":"Uploads","CategoryLocalizedName":"File","UsageName":"User","LanguageId":1033,"MIMEType":"application/pdf","BusinessServiceId":"00000000-0000-0000-0000-000000000000","Source":2,"Access":2,"Action":32,"DefaultAction":1,"FileStorageIdentifier":"9cd9b56c-8cf6-445c-98ca-fff65262a00d","IsActive":true,"IconClass":"pdf","FileNameAndTitle":"060917 FF File","TemplateId":"00000000-0000-0000-0000-000000000000","WorkSpaceTypeId":null,"UserRoleId":null,"ReviewerUserId":null,"ReviewerReceiveDate":null,"IsArchived":false,"DocumentVaultSubCategoryId":null,"CountryId":null,"SectorId":null,"NamedDataSetId":null,"EmployeeGroupId":null,"IsHOAddressDisplay":null,"SourceDocumentId":null,"EmployeeGroup":null,"LastChange":0,"RegardingObjectId":null,"RegardingObjectTypeCode":null,"IsAttachable":false,"tag":null,"RegardingObject":null,"EmployeeDetails":null,"Id":"e9f20f0e-8851-4fd9-b8a0-c9998353024f","CreatedOn":"2017-09-06T02:30:59.347","ModifiedOn":"2017-09-06T02:30:59.347","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0"}');
        return res;
    }

    public static getEmployeeGroups() {
        let res: any = JSON.parse('{"Entities":[{"Id":"69adf623-06cb-458d-bc58-1b98d716ad66","Name":"CG1","IsContractualGroup":true},{"Id":"48355f74-7c69-4974-871d-9327501c2e24","Name":"CG2","IsContractualGroup":true},{"Id":"e9536f0d-c74a-43c4-8e21-af00af01bf84","Name":"FullTime","IsContractualGroup":true},{"Id":"26669a3a-9e57-4348-9d64-3f10f0961c3b","Name":"G1","IsContractualGroup":true},{"Id":"c4687263-699a-4e1a-a88c-ef902349b4ed","Name":"G2","IsContractualGroup":false},{"Id":"af4afa82-7ace-445d-9f4f-e886d9065dfe","Name":"NC test","IsContractualGroup":false},{"Id":"8a6d056e-83d1-450c-b774-6237060b4d9c","Name":"sample","IsContractualGroup":false},{"Id":"18360fbf-a72e-459f-8596-91e5cbd0b481","Name":"test","IsContractualGroup":true},{"Id":"5b0700c5-147c-409e-8d6a-a1f824710394","Name":"test pp","IsContractualGroup":true},{"Id":"7be56dea-cddc-45bd-b889-43330bc7a3ad","Name":"Test prelive","IsContractualGroup":true},{"Id":"4f94ae55-5c65-4b50-84ae-a9b243a9528c","Name":"test test","IsContractualGroup":false}],"PagingInfo":null,"OtherInfo":null}');
        return res.Entities;
    }

    public static getDistibutedDocumentResponse() {
        let res: DistributedDocument = JSON.parse('{"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Document":null,"DocumentId":"88c70bea-cc85-4ad7-ae40-b13df4526861","DocumentVersion":"1.0","DocumentTitle":"1 jan test copy (2).pdf","RegardingObjectTypecode":1,"Action":0,"IsActive":true,"RegardingObjects":["55d1130c-6b4a-462a-a47f-d8df2f6b8c73"],"Id":"e67abfc4-b654-4b49-b3d2-c08ea7fe12b9","CreatedOn":"2017-12-08T10:15:30.0090341+00:00","ModifiedOn":"2017-12-08T10:15:30.0090341+00:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":null,"Author":null,"Modifier":null}');
        return res;
    }

    public static getCQCCategories() {
        let res: CQCCategories[] = JSON.parse('[{"id":191,"name":"Policy"},{"id":192,"name":"Contracts"},{"id":195,"name":"Test cat"}]');
        return DocumentsMockStoreforCQCandDistribute.getResponse(res);
    }
    public static getCQCStandards() {
        let res: CQCStandards[] = JSON.parse('[{"id":78,"pca_index":5,"title":"By `well-led`, we mean that the leadership, management and governance of the organisation assure the delivery of high-quality person-centred care, supports learning and innovation, and promotes an open and fair culture."},{"id":77,"pca_index":4,"title":"By `responsive`, we mean that services are organised so that they meet peoples needs."},{"id":76,"pca_index":3,"title":"By caring, we mean that staff involve and treat people with compassion, kindness, dignity and respect."},{"id":74,"pca_index":1,"title":"By safe, we mean that people are protected from abuse and avoidable harm."},{"id":75,"pca_index":2,"title":"By effective, we mean that peoples care, treatment and support achieves good outcomes, promotes a good quality of life and is based on the best available evidence."},{"id":85,"pca_index":6,"title":"Provider Information Return"}]');
        return DocumentsMockStoreforCQCandDistribute.getResponse(res);;
    }

    public static getCQCFileTypes() {
        let res = JSON.parse('[{"id":94,"name":"PDF Document"},{"id":95,"name":"Word document"}]');
        return DocumentsMockStoreforCQCandDistribute.getResponse(res);
    }

    public static getCQCPolicyCheckBySiteId() {
        let res = JSON.parse('{"success":true,"error":null}');
        return res;
    }

    public static getCQCUsersBySiteId() {
        let res = JSON.parse('[{"id":38,"name":"Citation 1","position":"Managing Director"},{"id":39,"name":"Citation 22","position":""},{"id":40,"name":"Citation 23","position":""},{"id":41,"name":"Citation 24","position":""},{"id":42,"name":"Citation 25","position":""},{"id":43,"name":"Citation 26","position":"Managing Director"},{"id":44,"name":"Citation 27","position":""},{"id":45,"name":"Citation 28","position":""},{"id":46,"name":"Citation 29","position":""},{"id":47,"name":"Citation 30","position":""},{"id":4,"name":"QuiqSolutions","position":"admin"}]');
        return DocumentsMockStoreforCQCandDistribute.getResponse(res);
    }

    public static getResponse(body): Response {
        const options = new ResponseOptions({
            body: JSON.stringify(body)
        });
        return new Response(options);
    }
}