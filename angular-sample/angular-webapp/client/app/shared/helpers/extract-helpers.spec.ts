import { ResponseOptions, Response } from '@angular/http';
import { MockStoreProviderFactory } from './../../shared/testing/mocks/mock-store-provider-factory';
import { extractInformationBarItems } from './extract-helpers';
import { AeInformationBarItem } from './../../atlas-elements/common/models/ae-informationbar-item';
import { AeInformationBarItemType } from './../../atlas-elements/common/ae-informationbar-itemtype.enum';

let data: any;
let response: any;
let statItems: AeInformationBarItem[];

describe('Extract helpers - extractInformationBarItems method', () => {
    beforeEach(() => {
        data = MockStoreProviderFactory.getMockedDocumentInformationbarItems();
        response = getResponse(data);
    });

    it('should return array of AeInformationBarItem objects', () => {
        statItems = extractInformationBarItems(response);
        statItems.forEach(item => {
            expect(item).toEqual(jasmine.any(AeInformationBarItem));
        });
    });

    it('should return empty array of items when supplied items is null', () => {
        response = getResponse(null);
        statItems = extractInformationBarItems(response);
        expect(statItems.length).toBe(0);
    });

    it('should instance AeInformationbarItem entity appropriately', () => {
        let resp = Array.from(data)
            .filter((c, i) => i === 0);
        response = getResponse(resp);
        statItems = extractInformationBarItems(response);
        expect(statItems[0].Count).toBe(32);
        expect(statItems[0].Type).toBe(AeInformationBarItemType.HandbooksOutstanding);
        expect(statItems[0].IconName).toBe('icon-notebook');
        expect(statItems[0].Title).toBe('Employee handbooks outstanding');
        expect(statItems[0].Priority).toBe(2);
    });

    it('should sort the informationbar items based on priority', () => {
        statItems = extractInformationBarItems(response);
        expect(statItems[0].Title).toBe('Active risk assessments');
        expect(statItems[1].Title).toBe('Employee handbooks outstanding');
        expect(statItems[2].Title).toBe('Documents to action');
        expect(statItems[3].Title).toBe('Training certificates');
        expect(statItems[4].Title).toBe('Shared documents');
        expect(statItems[5].Title).toBe('Personal documents');
    });
});

// generates response object
function getResponse(body): Response {
    const options = new ResponseOptions({
        body: JSON.stringify(body)
    });
    return new Response(options);
}