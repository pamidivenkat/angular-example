import { state } from '@angular/animations';
import { Site } from '../../../shared/models/site.model';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { Observable } from 'rxjs/Rx';
import { PublicUserInviteForm } from '../../../training/models/public-users-invite-form';
import { AtlasApiResponse } from '../../models/atlas-api-response';
import { Document } from './../../../document/models/document';
import { Department } from '../../../calendar/model/calendar-models';

export class MockStoreHandbookDocuments {

    public static getSiteLists(): AtlasApiResponse<Site> {
        let siteData: AtlasApiResponse<Site> = JSON.parse('{"Entities":[{"Id":"68eb119f-0ab2-42a8-a628-f2d4454a72ce","SiteNameAndPostcode":"Distribution Centre DC1","IsActive":true,"Name":"Distribution Centre DC1"},{"Id":"5f87e7e6-3eeb-3ae9-0303-f882d32aaafb","SiteNameAndPostcode":"hhh","IsActive":true,"Name":"hhh"},{"Id":"0584fa4a-83ba-3084-0a0d-e42c22c0d7d4","SiteNameAndPostcode":"Main Site (AP5 4PS)","IsActive":true,"Name":"Main Site"},{"Id":"b291a09c-e5d7-d1bb-ddfc-96c25d7cec9d","SiteNameAndPostcode":"Other Site","IsActive":true,"Name":"Other Site"},{"Id":"2f6b82eb-42fb-a36a-9888-1cd1a65a500d","SiteNameAndPostcode":"S1","IsActive":true,"Name":"S1"},{"Id":"42bbe9d6-8730-29d2-7cf3-aa526e976bb5","SiteNameAndPostcode":"Site 1","IsActive":true,"Name":"Site 1"},{"Id":"94796d56-27ba-a16b-8c4a-9d3194801715","SiteNameAndPostcode":"Site 6","IsActive":true,"Name":"Site 6"},{"Id":"1969ab90-d7e9-a31b-6fa0-c48699c5b3b0","SiteNameAndPostcode":"Site2","IsActive":true,"Name":"Site2"},{"Id":"e2ff6ab3-095d-9151-9961-95a86862cf48","SiteNameAndPostcode":"test delete q test (SK9 5AR)","IsActive":true,"Name":"test delete q test"},{"Id":"6fa9293e-2d6f-3043-e45d-75e133d013fc","SiteNameAndPostcode":"Testing Subroles","IsActive":true,"Name":"Testing Subroles"}],"PagingInfo":{"PageNumber":1,"Count":99999,"TotalCount":10},"OtherInfo":null}');
        return siteData;
    }
    public static getSiteAeelement(): AeSelectItem<string>[] {
        let siteData = this.getSiteLists();
        return siteData.Entities.map((keyValuePair) => {
            let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
            return aeSelectItem;
        });
        // return Observable.of(Aedataelement);
    }

    public static getHandbookDocuments(): AtlasApiResponse<Document> {
        let handbookData: AtlasApiResponse<Document> = JSON.parse('{"Entities":[{"Id":"ce8f8b6c-53fe-401d-a6d2-d021958f7745","FileNameAndTitle":"1.8.3 EL Handbook int1.pdf","SiteName":"Site 1","CategoryName":"Employee handbook","Version":"1.0","ModifiedOn":"2016-04-29T04:23:30.91","Status":1},{"Id":"f4f730c0-2012-4c79-8f9d-a6c7dbe9b0f4","FileNameAndTitle":"123 EL Handbook Main Site (AP5 4PS) 03-08-16.pdf","SiteName":"Main Site","CategoryName":"Employee handbook","Version":"1.0","ModifiedOn":"2016-08-03T02:11:56.403","Status":1},{"Id":"4328c8af-b885-447f-8d81-a6e007bd10d4","FileNameAndTitle":"17th july Employee handbook Main Site (AP5 4PS) 17-07-17.pdf","SiteName":"Main Site","CategoryName":"Employee handbook","Version":"1.0","ModifiedOn":"2017-07-17T03:28:22.373","Status":1},{"Id":"9334f0b4-1ab0-4b24-85fe-c263e93a0e27","FileNameAndTitle":"Apprd Mul - Employee handbook Distribution Centre DC1  04-10-17.pdf","SiteName":"Distribution Centre DC1","CategoryName":"Employee handbook","Version":"1.0","ModifiedOn":"2017-10-04T01:59:55.817","Status":1},{"Id":"de6e3740-c008-479b-a27c-c63832c9f6a5","FileNameAndTitle":"Copy EL Handbook Main Site 01-02-17.pdf","SiteName":"Main Site","CategoryName":"Employee handbook","Version":"1.0","ModifiedOn":"2017-03-10T08:37:02.617","Status":1},{"Id":"1759e131-5729-4eb4-855d-30922834c16a","FileNameAndTitle":"EL Handbook Distribution Centre DC1  07-04-16.pdf","SiteName":"Distribution Centre DC1","CategoryName":"Employee handbook","Version":"1.0","ModifiedOn":"2016-06-27T04:21:51.437","Status":1},{"Id":"5e93462a-9ffd-4e83-9f96-221a856dfe78","FileNameAndTitle":"EL Handbook Distribution Centre DC1  18-08-16.pdf","SiteName":"Distribution Centre DC1","CategoryName":"Employee handbook","Version":"1.0","ModifiedOn":"2016-08-18T10:55:58.343","Status":1},{"Id":"a8c0a88c-95b9-41aa-b980-c7329360079c","FileNameAndTitle":"EL Handbook Distribution Centre DC1  27-06-16.pdf","SiteName":"Distribution Centre DC1","CategoryName":"Employee handbook","Version":"1.0","ModifiedOn":"2016-06-27T04:21:51.437","Status":1},{"Id":"b5127af6-4074-4267-89f5-7a291cd72be4","FileNameAndTitle":"EL Handbook Main Site (AP5 4PS) 05-10-16.pdf","SiteName":"Main Site","CategoryName":"Employee handbook","Version":"1.0","ModifiedOn":"2016-10-05T02:10:51.39","Status":1},{"Id":"58f096bd-4e3f-479c-859c-7baa16e6323a","FileNameAndTitle":"EL Handbook Main Site (AP5 4PS) 05-10-16.pdf","SiteName":"Main Site","CategoryName":"Employee handbook","Version":"1.0","ModifiedOn":"2016-10-05T01:38:30.237","Status":1}],"PagingInfo":{"PageNumber":1,"Count":10,"TotalCount":31},"OtherInfo":null}');
        return handbookData;
    }
    public static getFilterHandbookDocuments(): AtlasApiResponse<Document> {
        let handbookFilterData: AtlasApiResponse<Document> = JSON.parse('{"Entities":[{"Id":"ce8f8b6c-53fe-401d-a6d2-d021958f7745","FileNameAndTitle":"1.8.3 EL Handbook int1.pdf","SiteName":"Site 1","CategoryName":"Employee handbook","Version":"1.0","ModifiedOn":"2016-04-29T04:23:30.91","Status":1},{"Id":"4f9031f8-fe31-4a13-a5f9-39cd851f44de","FileNameAndTitle":"EL Handbook Site 1  07-03-17.pdf","SiteName":"Site 1","CategoryName":"Employee handbook","Version":"1.2","ModifiedOn":"2017-03-14T14:25:33.053","Status":1},{"Id":"a9832f6c-22c8-4942-9a63-ac9982a22f5d","FileNameAndTitle":"Test EL Handbook Site 1  01-02-17.pdf","SiteName":"Site 1","CategoryName":"Employee handbook","Version":"1.0","ModifiedOn":"2017-02-01T02:43:27.08","Status":1}],"PagingInfo":{"PageNumber":1,"Count":10,"TotalCount":3},"OtherInfo":null}');
        return handbookFilterData;
    } //42bbe9d6-8730-29d2-7cf3-aa526e976bb5 Site 1

    public static getHandbookStats(): AtlasApiResponse<Document> {
        let handbookStats: AtlasApiResponse<Document> = JSON.parse('{"Entities":[{"Id":"ce8f8b6c-53fe-401d-a6d2-d021958f7745","ModifiedOn":"2016-04-29T04:23:30.91"}],"PagingInfo":{"PageNumber":1,"Count":1,"TotalCount":31},"OtherInfo":null}');
        return handbookStats;
    }
    public static getContractStats(): AtlasApiResponse<Document> {
        let contractStats: AtlasApiResponse<Document> = JSON.parse('{"Entities":[{"Id":"8aab0250-8329-4308-b665-e8fda6e7f7ef","Title":"1.8.1 GCT 7/4-1"}],"PagingInfo":{"PageNumber":1,"Count":1,"TotalCount":53},"OtherInfo":null}');
        return contractStats;
    }
    public static getPersonalisedStats(): AtlasApiResponse<Document> {
        let personalisedStats: AtlasApiResponse<Document> = JSON.parse('{"Entities":[{"Id":"d9cb616f-1c64-438c-ab94-b325824b7aad","Title":"Bruce  preemp contract 2017-11-13"}],"PagingInfo":{"PageNumber":1,"Count":1,"TotalCount":20},"OtherInfo":null}');
        return personalisedStats;
    }


}