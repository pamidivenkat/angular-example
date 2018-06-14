import { Store } from '@ngrx/store';
import { PlantAndEquipment } from './../models/plantandequipment';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse, AtlasParams, AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import * as manageMethodStatementsActions from './../actions/plantequipment-actions';
import * as Immutable from 'immutable';
import {
    plantAndEquipmentReducer,
    PlantAndEquipmentState,
    getPlantAndEquipmentLoadStatus,
    getPlantAndEquipmentList,
    getPlantAndEquipmentListTotalCount,
    getPlantAndEquipmentListListDataTableOptions,
    getSelectedPlantAndEquipment
} from './plantandequipment.reducer';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { extractMSRiskAssessments } from '../../../method-statements/common/extract-helper';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { Observable } from 'rxjs';
import { DataTableOptions } from "../../../atlas-elements/common/models/ae-datatable-options";
import * as fromRoot from './../../../shared/reducers/index';

describe('Plant and Equipment State', () => {
    let atlasParamsArray: Array<any>;
    let sampleApiRequestParams: AtlasApiRequestWithParams;
    let sampleApiRequest: AtlasApiRequest;
    let plantandequipments: AtlasApiResponse<PlantAndEquipment>;
    let sampleResponse: AtlasApiResponse<PlantAndEquipment>;
    let initialState: PlantAndEquipmentState;
    let sampleSelectedEquipmentData: PlantAndEquipment;
    let modifiedState: PlantAndEquipmentState;
    let store: Store<fromRoot.State>;
    let initialWholeState: fromRoot.State;

    beforeEach(() => {
        initialState = {
            plantandequipmentsLoaded: false,
            currentApiRequest: null,
            plantandequipments: null,
            selectedPlantandequipment: null,
            pagingInfo: null,
        };
        plantandequipments = MockStoreProviderFactory.getTestPlantEquipmentData();
        sampleApiRequest = new AtlasApiRequest(1, 10, null, null);
        sampleSelectedEquipmentData = MockStoreProviderFactory.getTestSelectedPlantAndEquipmentData();
    });


    it('should return the default state', () => {
        const action = {} as any;
        const result = plantAndEquipmentReducer(initialState, action);
        expect(result).toEqual(initialState);
    });

    it('should return current state when no valid actions have been made', () => {
        const actual = plantAndEquipmentReducer(initialState, { type: 'INVALID_ACTION', payload: {} });
        const expected = initialState;
        expect(actual).toBe(expected);
    });

    it('it should dispatch LOAD_PLANTANDEQUIPMENT action to load the list of Plant and equipment List screen', () => {
        const actual = plantAndEquipmentReducer(initialState, { type: '[PLANTANDEQUIPMENT] Load plantandequipments', payload: sampleApiRequest });
        expect(actual.plantandequipmentsLoaded).toBe(true);
        expect(actual.currentApiRequest).toEqual(sampleApiRequest);
    });

    describe('it should dispatch LOAD_PLANTANDEQUIPMENT_COMPLETE action when loaded list for Plant and equipment List screen', () => {
        it('for the initial loading of list screen paging information is null', () => {
            const actual = plantAndEquipmentReducer(initialState, { type: '[PLANTANDEQUIPMENT] Load plantandequipments complete', payload: plantandequipments });
            expect(actual.pagingInfo).toEqual(plantandequipments.PagingInfo);
            expect(actual.plantandequipmentsLoaded).toBe(false);
        });

        it('once the list is loaded paging information is available', () => {
            initialState.pagingInfo = new PagingInfo(0, 0, 0, 0);
            const actual = plantAndEquipmentReducer(initialState, { type: '[PLANTANDEQUIPMENT] Load plantandequipments complete', payload: plantandequipments });
            expect(actual.plantandequipmentsLoaded).toBe(false);
            expect(actual.pagingInfo.PageNumber).toEqual(plantandequipments.PagingInfo.PageNumber);
            expect(actual.pagingInfo.Count).toEqual(plantandequipments.PagingInfo.Count);
            expect(actual.pagingInfo.TotalCount).toEqual(plantandequipments.PagingInfo.TotalCount);
        });
        it('when page is changed to view records other than first page', () => {
            initialState.pagingInfo = new PagingInfo(0, 0, 0, 0);
            const actual = plantAndEquipmentReducer(initialState, { type: '[PLANTANDEQUIPMENT] Load plantandequipments complete', payload: plantandequipments });
            expect(actual.plantandequipmentsLoaded).toBe(false);
            expect(actual.pagingInfo.PageNumber).toEqual(plantandequipments.PagingInfo.PageNumber);
            expect(actual.pagingInfo.Count).toEqual(plantandequipments.PagingInfo.Count);
        });
    });

    it('should dispatch LOAD_SELECTED_PLANTANDEQUIPMENT action to load the selected plant and equipment', () => {
        const actual = plantAndEquipmentReducer(initialState, { type: '[PLANTANDEQUIPMENT] Load selected plantandequipment', payload: '' });
        expect(actual).toEqual(initialState);
    });

    it('should dispatch LOAD_SELECTED_PLANTANDEQUIPMENT_COMPLETE action to load the selected plant and equipment', () => {
        const actual = plantAndEquipmentReducer(initialState, { type: '[PLANTANDEQUIPMENT]  Load selected plantandequipment complete', payload: sampleSelectedEquipmentData });
        expect(actual.selectedPlantandequipment).toEqual(sampleSelectedEquipmentData);
    });

    it('should dispatch ADD_PLANTANDEQUIPMENT action when adding new plant and equipment', () => {
        const actual = plantAndEquipmentReducer(initialState, { type: '[PLANTANDEQUIPMENT] Add plantandequipment', payload: {} });
        expect(actual).toEqual(initialState);
    });

    it('should dispatch ADD_PLANTANDEQUIPMENT_COMPLETE action when added plant and equipment successfully', () => {
        const actual = plantAndEquipmentReducer(initialState, { type: '[PLANTANDEQUIPMENT]  Add plantandequipment complete', payload: sampleSelectedEquipmentData });
        expect(actual.selectedPlantandequipment).toEqual(sampleSelectedEquipmentData);
    });

    it('should dispatch UPDATE_PLANTANDEQUIPMENT action when updating plant and equipment', () => {
        const actual = plantAndEquipmentReducer(initialState, { type: '[PLANTANDEQUIPMENT] Update plantandequipment', payload: {} });
        expect(actual).toEqual(initialState);
    });

    it('should dispatch UPDATE_PLANTANDEQUIPMENT_COMPLETE action when updated plant and equipment successfully', () => {
        const actual = plantAndEquipmentReducer(initialState, { type: '[PLANTANDEQUIPMENT]  Add plantandequipment complete', payload: sampleSelectedEquipmentData });
        expect(actual.selectedPlantandequipment).toEqual(sampleSelectedEquipmentData);
    });

    describe('Functions in the Plant and Equipment reducer', () => {
        beforeEach(() => {
            store = MockStoreProviderFactory.createInitialStore();
            plantandequipments = MockStoreProviderFactory.getTestPlantEquipmentData();
            store.subscribe(s => { initialWholeState = s; })
            modifiedState = plantAndEquipmentReducer(initialState, { type: '[PLANTANDEQUIPMENT] Load plantandequipments', payload: sampleApiRequest });
            modifiedState = plantAndEquipmentReducer(modifiedState, { type: '[PLANTANDEQUIPMENT] Load plantandequipments complete', payload: plantandequipments });
            initialWholeState.plantAndEquipmentState = modifiedState;
        });

        it('function should return Loading status when getPlantAndEquipmentLoadStatus method was called', () => {
            store.let(fromRoot.getPlantAndEquipmentLoadStatus).subscribe(status => {
                expect(status).toEqual(modifiedState.plantandequipmentsLoaded);
            });
        });

        it('function should return plant and equipment list when getPlantAndEquipmentList method was called', () => {
            store.let(fromRoot.getPlantAndEquipmentList).subscribe(value => {
                expect(value).toEqual(Immutable.List<PlantAndEquipment>(modifiedState.plantandequipments));
            });
        });

        it('function should return plant and equipment list total count when getPlantAndEquipmentListTotalCount method was called', () => {
            store.let(fromRoot.getPlantAndEquipmentListTotalCount).subscribe(value => {
                expect(value).toEqual(modifiedState.pagingInfo.TotalCount);
            });
        });

        it('function should return plant and equipment list data table options when getPlantAndEquipmentListListDataTableOptions method was called', () => {
            let pagingInformation = plantandequipments.PagingInfo;

            let dataTableOptions = new DataTableOptions(pagingInformation.PageNumber, pagingInformation.Count, sampleApiRequest.SortBy.SortField, sampleApiRequest.SortBy.Direction);
            store.let(fromRoot.getPlantAndEquipmentListListDataTableOptions).subscribe(value => {

                expect(value).toEqual(dataTableOptions);
            });
        });

        it('function should return selected plant and equipment details when getSelectedPlantAndEquipment method was called', () => {
            store.let(fromRoot.getSelectedPlantAndEquipment).subscribe(value => {
                expect(value).toEqual(modifiedState.selectedPlantandequipment);
            });
        });
    });
});