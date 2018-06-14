import { ResponseOptions, Response } from '@angular/http';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { extractDocumentDetails } from './document-details-extract-helper';
import { DocumentDetails } from './../models/document-details-model';
import { differenceInDays } from 'date-fns';


describe('Document details ', () => {
    it('should return Document Detail object', () => {
        let data = MockStoreProviderFactory.getDocumentMockData();
        let response = getResponse(data);
        let docDetails = extractDocumentDetails(response);
        expect(docDetails).toEqual(jasmine.any(DocumentDetails));
    });

    it('should return empty document detail instance when response is null', () => {
        let data = null;
        let response = getResponse(data);
        let docDetails = extractDocumentDetails(response);
        expect(docDetails.Id).toBe('');
        expect(docDetails.FileName).toBe('');
        expect(docDetails.Category).toBe(0);
    });

    it('verify whether each property in document detail instance must be populated', () => {
        let data = MockStoreProviderFactory.getDocumentMockData();
        data.Description = 'Document Description';
        data.ExpiryDate = '2017-11-10T09:12:25.807';
        let nowDate = new Date(2017, 10, 20, 15, 0, 0);
        jasmine.clock().mockDate(nowDate);
        let response = getResponse(data);
        let docDetails = extractDocumentDetails(response);
        expect(docDetails.Id).toBe('f86ce3d4-8160-4bdb-8f86-a7b5f9ed7a44');
        expect(docDetails.CategoryLocalizedName).toBe('Disciplinary');
        expect(docDetails.FileName).toBe('101117 sesitive doc');
        expect(docDetails.Notes).toBe('Document created');
        expect(docDetails.Description).toBe('Document Description');
        expect(docDetails.Title).toBe('101117 sesitive doc');
        expect(docDetails.ExpiryDate).toBe('2017-11-10T09:12:25.807');
        expect(docDetails.Archived).toBe('No');
        expect(docDetails.ModifiedOn).toBe('2017-11-10T09:12:25.807');
        expect(docDetails.Usage).toBe(2);
        expect(docDetails.UsageName).toBe('User');
        expect(docDetails.ModifiedByName).toBe('SO VLTC');
        expect(docDetails.LastUpdatedDays).toBe(10);
        expect(docDetails.CreatedOn).toBe('2017-11-10T09:12:25.807');
        expect(docDetails.RegardingObjectId).toBe('60502a22-7124-4c7c-8e65-16015cea6916');
        expect(docDetails.SiteId).toBeNull();
        expect(docDetails.FileStorageIdentifier).toBe('dd86e944-5916-4227-8d94-7fcabb624fd6');
        expect(docDetails.Category).toBe(9001);
        expect(docDetails.Keywords).toBeUndefined();
        expect(docDetails.Service).toBe('');
        expect(docDetails.Sector).toBe('All');
        expect(docDetails.Country).toBe('All');
        expect(docDetails.Version).toBe('1.0');
        expect(docDetails.IsDistributable).toBeTruthy();
    });

    it('verify whether category localized name is propulating properly or not', () => {
        let data = MockStoreProviderFactory.getDocumentMockData();
        data.CategoryLocalizedName = 'Localized name';
        data.Category = 2001;
        let response = getResponse(data);
        let docDetails = extractDocumentDetails(response);
        expect(docDetails.Category).toBe(2001);
        expect(docDetails.CategoryLocalizedName).toBe('Localized name');

        data.CategoryLocalizedName = null;
        data.Category = { Name: 'Some Category' };
        response = getResponse(data);
        docDetails = extractDocumentDetails(response);
        expect(docDetails.CategoryLocalizedName).toBe('Some Category');
    });

    it('verify whether file name is propulating properly or not', () => {
        let data = MockStoreProviderFactory.getDocumentMockData();
        data.FileNameAndTitle = 'This is file name and title';
        data.FileName = 'This is file name';
        let response = getResponse(data);
        let docDetails = extractDocumentDetails(response);
        expect(docDetails.FileName).toBe('This is file name and title');

        data.FileNameAndTitle = null;
        data.FileName = 'This is file name';
        response = getResponse(data);
        docDetails = extractDocumentDetails(response);
        expect(docDetails.FileName).toBe('This is file name');
    });

    it('verify whether description is propulating properly or not', () => {
        let data = MockStoreProviderFactory.getDocumentMockData();
        data.Description = 'This is some description';
        let response = getResponse(data);
        let docDetails = extractDocumentDetails(response);
        expect(docDetails.Description).toBe('This is some description');

        data.Description = null;
        response = getResponse(data);
        docDetails = extractDocumentDetails(response);
        expect(docDetails.Description).toBe('Not mentioned');
    });

    it('verify whether archived property is propulating properly or not', () => {
        let data = MockStoreProviderFactory.getDocumentMockData();
        data.IsArchived = true;
        let response = getResponse(data);
        let docDetails = extractDocumentDetails(response);
        expect(docDetails.Archived).toBe('Yes');

        data.IsArchived = false;
        response = getResponse(data);
        docDetails = extractDocumentDetails(response);
        expect(docDetails.Archived).toBe('No');

        data.IsArchived = null;
        response = getResponse(data);
        docDetails = extractDocumentDetails(response);
        expect(docDetails.Archived).toBe('No');
    });

    it('verify whether modifiedbyname is populating properly or not', () => {
        let data = MockStoreProviderFactory.getDocumentMockData();
        data.Modifier = null;
        let response = getResponse(data);
        let docDetails = extractDocumentDetails(response);
        expect(docDetails.ModifiedByName).toBe('');

        data.Modifier = {};
        response = getResponse(data);
        docDetails = extractDocumentDetails(response);
        expect(docDetails.ModifiedByName).toBe('');

        data.Modifier = {
            FullName: ''
        };
        response = getResponse(data);
        docDetails = extractDocumentDetails(response);
        expect(docDetails.ModifiedByName).toBe('');

        data.Modifier = {
            FullName: 'SO VLTC'
        };
        response = getResponse(data);
        docDetails = extractDocumentDetails(response);
        expect(docDetails.ModifiedByName).toBe('SO VLTC');
    });

    it('verify whether regardingobjectid and siteid are populating properly or not', () => {
        let data = MockStoreProviderFactory.getDocumentMockData();
        data.RegardingObject = null;
        let response = getResponse(data);
        let docDetails = extractDocumentDetails(response);
        expect(docDetails.SiteId).toBeNull();
        expect(docDetails.RegardingObjectId).toBeNull();

        data.RegardingObject = {
            ObjectTypeCode: 17,
            Id: '60502a22-7124-4c7c-8e65-16015cea6916'
        };
        response = getResponse(data);
        docDetails = extractDocumentDetails(response);
        expect(docDetails.SiteId).toBeNull();
        expect(docDetails.RegardingObjectId).toBe('60502a22-7124-4c7c-8e65-16015cea6916');

        data.RegardingObject = {
            ObjectTypeCode: 3,
            Id: '60502a22-7124-4c7c-8e65-16015cea6916'
        };
        response = getResponse(data);
        docDetails = extractDocumentDetails(response);
        expect(docDetails.RegardingObjectId).toBeNull();
        expect(docDetails.SiteId).toBe('60502a22-7124-4c7c-8e65-16015cea6916');
    });

    it('verify whether shared document properties are populating properly or not', () => {
        let data = MockStoreProviderFactory.getMockedSharedDocumentData();
        data.Keywords = 'some keywords, some more, and more';
        data.Sector = 'QA Sector';
        let response = getResponse(data);
        let docDetails = extractDocumentDetails(response);
        expect(docDetails.Keywords).toBe('some keywords, some more, and more');
        expect(docDetails.Service).toBe('Employment Law');
        expect(docDetails.Sector).toBe('QA Sector');
        expect(docDetails.Country).toBe('Northern Ireland,Ireland,Wales,England,Scotland');
        expect(docDetails.Title).toBe('* = Please contact the Employment Law Team before use.');
    });
});

// generates response object
function getResponse(body): Response {
    const options = new ResponseOptions({
        body: JSON.stringify(body)
    });
    return new Response(options);
}
