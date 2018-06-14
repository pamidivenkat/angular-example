import { AeInformationBarItemType } from './../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { AeInformationBarItem } from './../../atlas-elements/common/models/ae-informationbar-item';
import { DocumentInformationBarState } from './information-bar-reducer';
import { reducer } from './information-bar-reducer';

describe('Document-Information-Bar-reducer', () => {
    let initalState: DocumentInformationBarState;
    let sampleResponse: AeInformationBarItem[];

    beforeEach(() => {
        sampleResponse = [
            new AeInformationBarItem(AeInformationBarItemType.TrainingCertificates, 50, "Training Certificates", true, "test tool tip1")
            , new AeInformationBarItem(AeInformationBarItemType.PersonalDocuments, 50, "Personal Documents", false, "test tool tip2")
            , new AeInformationBarItem(AeInformationBarItemType.CompanyDocuments, 50, "Company Documents", false, "test tool tip3")
            , new AeInformationBarItem(AeInformationBarItemType.DocumentsAwaiting, 50, "Documents to action", false, "test tool tip4")
        ]
        initalState = {
            hasStatisticsDataLoaded: false,
            statistics: []
        };

    });

    it('should return the default state', () => {
        const action = {} as any;
        const result = reducer(initalState, action);
        expect(result).toEqual(initalState);
    });

    it('should return current state when no valid actions have been made', () => {
        const actual = reducer(initalState, { type: 'INVALID_ACTION', payload: {} }); //player(state, {type: 'INVALID_ACTION', payload: {}});
        const expected = initalState;
        expect(actual).toEqual(expected);
    });

    it('should return hasStatisticsDataLoaded false after first store action LOAD_DOCUMENT_INFORMATIONBAR is despatched', () => {
        const actual = reducer(initalState, { type: '[Document Informationbar] Load Document Informationbar', payload: 'logged in emplooyeeId' });
        expect(actual.hasStatisticsDataLoaded).toBe(false);
    });


    it('should return hasStatisticsDataLoaded true and store should have the data after first store action LOAD_DOCUMENT_INFORMATIONBAR_COMPLETE; is despatched', () => {
        const actual = reducer(initalState, { type: '[Document Informationbar] Load Document Informationbar complete', payload: sampleResponse });
        expect(actual.hasStatisticsDataLoaded).toBe(true);
        expect(actual.statistics).toEqual(sampleResponse);
    });


    it('store should have the data after first store action LOAD_DOCUMENT_INFORMATIONBAR_SPECIFIC_STAT_COMPLETE; is despatched', () => {
        let resp = sampleResponse.filter(c => c.Type == AeInformationBarItemType.DocumentsAwaiting);
        const actual = reducer(initalState, { type: '[Document Informationbar] Load Document Informationbar specific stat complete', payload: resp });
        expect(actual.statistics).toEqual(resp);
    });
});
