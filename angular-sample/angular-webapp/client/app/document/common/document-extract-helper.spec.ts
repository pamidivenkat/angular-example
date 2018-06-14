import { ResponseOptions, Response } from '@angular/http';
import { MockStoreProviderFactory } from './../../shared/testing/mocks/mock-store-provider-factory';
import { extractInformationBarItems } from './../../shared/helpers/extract-helpers';
import { AeInformationBarItem } from './../../atlas-elements/common/models/ae-informationbar-item';
import { processDocumentInfomationBarItems } from './document-extract-helper';
import { AeInformationBarItemType } from './../../atlas-elements/common/ae-informationbar-itemtype.enum';

let statItems: AeInformationBarItem[];

describe('Document information bar items - processDocumentInfomationBarItems method', () => {
    beforeEach(() => {
        let data = MockStoreProviderFactory.getMockedDocumentInformationbarItems();
        let response = getResponse(data);
        statItems = extractInformationBarItems(response);
    });

    it('should return array of AeInformationBarItem objects', () => {
        let companyId = null;
        let infobarItems = processDocumentInfomationBarItems(statItems, companyId);
        statItems.forEach(item => {
            expect(item).toEqual(jasmine.any(AeInformationBarItem));
        });
    });

    it('should return empty array of items when supplied items is null', () => {
        let companyId = null;
        let infobarItems = processDocumentInfomationBarItems(null, companyId);
        expect(infobarItems).toBeNull();

        infobarItems = processDocumentInfomationBarItems([], companyId);
        expect(infobarItems.length).toBe(0);
    });

    it('should populate appropriate tooltip when count is greater than zero', () => {
        let companyId = null;
        let infobarItems = processDocumentInfomationBarItems(statItems, companyId);

        let activeRA = infobarItems.filter(c => c.Type == AeInformationBarItemType.RiskAssesmentDocuments)[0];
        expect(activeRA.ToolTip).toBe('This number shows your active risk assessments. You may see more risk assessments in this folder if you\'ve exported any that have not yet been approved.');

        let empHandbook = infobarItems.filter(c => c.Type == AeInformationBarItemType.HandbooksOutstanding)[0];
        expect(empHandbook.ToolTip).toBe('Click here to view the distributed Employee Handbook that still requires action');

        let documentsAwaiting = infobarItems.filter(c => c.Type == AeInformationBarItemType.DocumentsAwaiting)[0];
        expect(documentsAwaiting.ToolTip).toBe('Click here to view documents that need your action');

        let trainingCertificates = infobarItems.filter(c => c.Type == AeInformationBarItemType.TrainingCertificates)[0];
        expect(trainingCertificates.ToolTip).toBe('Click here to view your Training Certificates');

        let companyDocuments = infobarItems.filter(c => c.Type == AeInformationBarItemType.CompanyDocuments)[0];
        expect(companyDocuments.ToolTip).toBe('Click here to view the documents that have been shared with you');

        let personalDocuments = infobarItems.filter(c => c.Type == AeInformationBarItemType.PersonalDocuments)[0];
        expect(personalDocuments.ToolTip).toBe('Click here to view the documents you have uploaded');
    });

    it('should populate appropriate tooltip when count is zero', () => {
        let companyId = null;
        statItems.forEach(c => {
            c.Count = 0;
        });
        let infobarItems = processDocumentInfomationBarItems(statItems, companyId);

        let activeRA = infobarItems.filter(c => c.Type == AeInformationBarItemType.RiskAssesmentDocuments)[0];
        expect(activeRA.ToolTip).toBe('Looks like you don\'t currently have any Risk Assessments. Go to your Risk Assessment Library to create some');

        let empHandbook = infobarItems.filter(c => c.Type == AeInformationBarItemType.HandbooksOutstanding)[0];
        expect(empHandbook.ToolTip).toBe('Looks like everyone has actioned the handbook sent to them');

        let documentsAwaiting = infobarItems.filter(c => c.Type == AeInformationBarItemType.DocumentsAwaiting)[0];
        expect(documentsAwaiting.ToolTip).toBe('Looks like you\'re up to date');

        let trainingCertificates = infobarItems.filter(c => c.Type == AeInformationBarItemType.TrainingCertificates)[0];
        expect(trainingCertificates.ToolTip).toBe('You have no training certificates');

        let companyDocuments = infobarItems.filter(c => c.Type == AeInformationBarItemType.CompanyDocuments)[0];
        expect(companyDocuments.ToolTip).toBe('Keep an eye on this area for when documents are sent to you');

        let personalDocuments = infobarItems.filter(c => c.Type == AeInformationBarItemType.PersonalDocuments)[0];
        expect(personalDocuments.ToolTip).toBe('Looks like you haven\'t uploaded anything here yet!');
    });

    it('should return only "Active risk assessments" "Employee handbook outstanding" components when cid is available', () => {
        let companyId = '5AE84046-482C-4CE3-980B-6A1F6385A8D3';
        let infobarItems = processDocumentInfomationBarItems(statItems, companyId);

        expect(infobarItems.length).toBe(2);
        let filteredList = infobarItems.filter(c => c.Type == AeInformationBarItemType.RiskAssesmentDocuments);
        expect(filteredList).not.toBeNull();
        expect(filteredList.length).toBe(1);

        filteredList = infobarItems.filter(c => c.Type == AeInformationBarItemType.HandbooksOutstanding);
        expect(filteredList).not.toBeNull();
        expect(filteredList.length).toBe(1);
    });
});

// generates response object
function getResponse(body): Response {
    const options = new ResponseOptions({
        body: JSON.stringify(body)
    });
    return new Response(options);
}