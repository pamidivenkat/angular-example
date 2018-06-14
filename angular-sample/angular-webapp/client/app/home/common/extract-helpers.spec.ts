import { extractStatisticsInformation, extractServiceReportingStatisticsInformation, extractTodaysOverviewStatisticsInformation } from './extract-helpers';
import { AeInformationBarItemType } from '../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { extractInformationBarItems } from '../../shared/helpers/extract-helpers';
import { Response, ResponseOptions } from '@angular/http';
import * as Immutable from 'immutable';
import { fakeAsync, tick } from '@angular/core/testing';
import { MockStoreProviderFactory } from '../../shared/testing/mocks/mock-store-provider-factory';

const MOCK_RESPONSE = JSON.parse('[{"Code":10,"Priority":1,"Name":"Out of Office","IconName":null,"Count":0.0,"ContextData":null},{"Code":9,"Priority":1,"Name":"Tasks due today","IconName":null,"Count":1.0,"ContextData":null},{"Code":8,"Priority":1,"Name":"Documents","IconName":null,"Count":0.0,"ContextData":[]},{"Code":7,"Priority":1,"Name":"Joiners","IconName":null,"Count":2.0,"ContextData":[{"Key":"Employee","Value":"Lee  Cramp"},{"Key":"Employee","Value":"Gavin  Jeffery"}]}]');

const MOCK_INFORMATIONBAR_RESPONSE = JSON.parse('[{"Code": 5, "Priority": 10, "Name": "Training courses","IconName": "icon-education",  "Count": 0,"ContextData": null},{"Code": 4, "Priority": 9,"Name": "Tasks to complete","IconName": null,"Count": 4,"ContextData": null},{"Code": 2,"Priority": 7, "Name": "Team holidays","IconName": null,"Count": 2,"ContextData": null}, { "Code": 3,"Priority": 8, "Name": "Documents to action", "IconName": "icon-to-review", "Count": 19,"ContextData": null },{"Code": 1,"Priority": 6, "Name": "Holidays available", "IconName": "icon-holidays-absence","Count": 12,"ContextData": [{"Key": "HolidayUnitType","Value": "Days"}]},{"Code": 6,"Priority": 5,"Name": "Holiday countdown","IconName": "icon-case","Count": 0,"ContextData": null}]');

xdescribe('FancyService without the TestBed', () => {
    //beforeEach(() => { service = new FancyService(); });
    it('should return immutable array', () => {
        let response = getResponse(MOCK_RESPONSE);
        let result = Immutable.List(extractStatisticsInformation(response));
        expect(Immutable.Iterable.isIterable(result)).toEqual(true);
    });

    it('returned array length should be match with the items in response', () => {
        let content = JSON.parse('[{"Code":10,"Priority":1,"Name":"Out of Office","IconName":null,"Count":1,"ContextData":null}]');
        let response = getResponse(content);
        let result = Immutable.List(extractStatisticsInformation(response));
        expect(result.count()).toEqual(1);

        content = JSON.parse('[]');
        response = getResponse(content);
        result = Immutable.List(extractStatisticsInformation(response));
        expect(result.count()).toEqual(0);
    });

    it('returned array should not contain item in response whose count property is less than 1', () => {
        let content = JSON.parse('[{"Code":10,"Priority":1,"Name":"Out of Office","IconName":null,"Count":1,"ContextData":null}]');
        let response = getResponse(content);
        let result = Immutable.List(extractTodaysOverviewStatisticsInformation(response));
        expect(result.count()).toEqual(1);

        content = JSON.parse('[{"Code":10,"Priority":1,"Name":"Out of Office","IconName":null,"Count":0,"ContextData":null}]');
        response = getResponse(content);
        result = Immutable.List(extractTodaysOverviewStatisticsInformation(response));
        expect(result.count()).toEqual(0);
    });

    it('each item in returned array should have 3 properties (Code, Count, Data)', () => {
        let response = getResponse(MOCK_RESPONSE);
        let result = Immutable.List(extractStatisticsInformation(response))

        result.forEach(item => {
            expect(item['Count']).toBeDefined();
            expect(item['Code']).toBeDefined();
            expect(item['Data']).toBeDefined();
        });
    });

    it('each property in result array should hold correct value as of supplied info.', () => {
        let content = JSON.parse('[{"Code":10,"Priority":1,"Name":"Out of Office","IconName":null,"Count":1,"ContextData":null}]');
        let response = getResponse(content);
        let result = Immutable.List(extractTodaysOverviewStatisticsInformation(response));
        expect(result.count()).toEqual(1);

        expect(result.get(0).Count).toEqual(1);
        expect(result.get(0).Code).toEqual(10);
        expect(result.get(0).Data).toBeNull();
    });

    it('"Data" property should hold value when context data has some data.', () => {
        let content = JSON.parse('[{"Code":7,"Priority":1,"Name":"Joiners","IconName":null,"Count":2,"ContextData":[{"Key":"Employee","Value":"Lee  Cramp"},{"Key":"Employee","Value":"Gavin  Jeffery"}]}]');
        let response = getResponse(content);
        let result = Immutable.List(extractTodaysOverviewStatisticsInformation(response));
        expect(result.count()).toEqual(2);

        expect(result.get(0).Count).toEqual(2);
        expect(result.get(0).Code).toEqual(7);
        expect(result.get(0).Data).toBe('Gavin  Jeffery');
    });
    
    // Start of Information bar helper function test cases 
    it('should return exact count which matches to input response data', () => {
        let response = getResponse(MOCK_INFORMATIONBAR_RESPONSE);
        let result = extractInformationBarItems(response);
        expect(result.length).toEqual(6);
    });

    it(`should return Looks like you're up to date tooltip when count === 0 for Training courses , documents to action , Tasks to complete types`, () => {
        let response = getResponse(MOCK_INFORMATIONBAR_RESPONSE);
        let result = extractInformationBarItems(response);
        result.forEach(item => {
            if (item['Count'] === 0 && (item['Code'] === 3 || item['Code'] === 4 || item['Code'] === 5)) {
                expect(item['ToolTip']).toEqual('INFORMATIONBAR.Up_to_date_tooltip');
            }
        });
    });

    it(`should return You have no holidays booked tooltip when the type of informaiton bar is Holiday countdown and Count === 0`, () => {
        let response = getResponse(MOCK_INFORMATIONBAR_RESPONSE);
        let result = extractInformationBarItems(response);
        result.forEach(item => {
            if (item['Count'] === 0 && (item['Type'] === 6)) {
                expect(item['ToolTip']).toEqual('INFORMATIONBAR.Holiday_count_down_Uptodate_tooltip');
            }
        });
    });

    it(`should return proper tooltip messages when Count > 0`, () => {
        let response = getResponse(MOCK_INFORMATIONBAR_RESPONSE);
        let result = extractInformationBarItems(response);
        let itemType: number;
        result.forEach(item => {
            if (item['Count'] > 0) {
                itemType = <number>item['Code'];
                switch (itemType) {
                    case AeInformationBarItemType.DocumentsAwaiting:
                        {
                            expect(item['ToolTip']).toEqual('INFORMATIONBAR.Documents_awaiting_tooltip');
                        }
                    case AeInformationBarItemType.HolidayCountdown:
                        {
                            expect(item['ToolTip']).toEqual('INFORMATIONBAR.Holiday_count_down_tooltip');
                        }
                    case AeInformationBarItemType.HolidaysAvailable:
                        {
                            expect(item['ToolTip']).toEqual('INFORMATIONBAR.Holidays_available_tooltip');
                        }
                    case AeInformationBarItemType.TasksToComplete:
                        {
                            expect(item['ToolTip']).toEqual('INFORMATIONBAR.Tasks_to_complete_tooltip');
                        }
                    case AeInformationBarItemType.TeamHolidays:
                        {
                            expect(item['ToolTip']).toEqual('INFORMATIONBAR.Team_holidays_tooltip');
                        }
                    case AeInformationBarItemType.TrainingCourses:
                        {
                            expect(item['ToolTip']).toEqual('INFORMATIONBAR.Training_course_tooltip');
                        }
                    default:
                }
            }
        });
    });

    it('return object should have Name, Code , Count , IconName , Priority)', () => {
        let response = getResponse(MOCK_INFORMATIONBAR_RESPONSE);
        let result = extractInformationBarItems(response)
        result.forEach(item => {
            expect(item['Count']).toBeDefined();
            expect(item['Type']).toBeDefined();
            expect(item['Title']).toBeDefined();
            expect(item['IconName']).toBeDefined();
            expect(item['ToolTip']).toBeDefined();
            expect(item['RequireNotification']).toBeDefined();
        });
    });

    it('Service Reporting Statics Information', fakeAsync(() => () => {
        let TOdata = MockStoreProviderFactory.getTOdata();
        let response = getResponse(TOdata);
        let extraHelperTOdata = extractServiceReportingStatisticsInformation(response);
        let mokeupTOdata = MockStoreProviderFactory.getMockTestTodayOverview();
        tick(100);
        expect(mokeupTOdata).toEqual(extraHelperTOdata);
    }));

    // End of Information bar helper function test cases 
});

// generates response object
function getResponse(body): Response {
    const options = new ResponseOptions({
        body: JSON.stringify(body)
    });
    return new Response(options);
}