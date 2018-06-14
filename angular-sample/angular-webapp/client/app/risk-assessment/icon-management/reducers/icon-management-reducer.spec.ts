import { IconType } from '../models/icon-type.enum';
import { Icon } from '../models/icon';
import {
    getSelectedIcon,
} from '../../../risk-assessment/icon-management/reducers/icon-management-reducer';
import { Control } from '../../models/control';
import { IconManagementState, reducer, getHazardsOrControlsApiRequest, getHazardsOrControlsListLoadingState, getHazardsOrControlsListTotalCount, getHazardsOrControlsList, getHazardsOrControlsListDataTableOptions, getRemoveActionStatus, getIconAddUpdateCompleteStatus } from "../../../risk-assessment/icon-management/reducers/icon-management-reducer";
import { Hazard } from "../../../risk-assessment/models/hazard";
import { List } from "immutable";
import { IconManagementMockStoreProviderFactory } from "../../../shared/testing/mocks/icon-mgmt-mock-store-provider-factory";
import { AtlasApiRequestWithParams, AtlasParams } from "../../../shared/models/atlas-api-response";
import { Observable } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { DataTableOptions } from "../../../atlas-elements/common/models/ae-datatable-options";
import { AtlasApiResponse, AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import { MockStoreProviderFactory } from './../../../shared/testing/mocks/mock-store-provider-factory';
import { extractMSRiskAssessments } from '../../../method-statements/common/extract-helper';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { IconItem, BulkIcons } from "../../../risk-assessment/icon-management/models/remove-icon-item";



describe('Icon Management State', () => {

    let atlasParamsArray: Array<any>;
    let sampleApiRequestParams: AtlasApiRequestWithParams;
    let modifiedState: IconManagementState;

    let initialState: IconManagementState;
    let mockHazardIconsData: any;
    let mockControlIconsData: any;
    let mockIconData: Icon;

    beforeEach(() => {
        initialState = {
            HasHazardsOrControlsListLoaded: false,
            HazardsOrControlsList: null,
            HazardsOrControlsListPagingInfo: null,
            apiRequestWithParams: null,
            RemoveActionStatus: false,
            BulkRemoveActionStatus: false,
            selectedIcon: null,
            IconAddUpdateCompleteStatus: false
        };
        atlasParamsArray = [];
        sampleApiRequestParams = new AtlasApiRequestWithParams(0, 0, null, null, atlasParamsArray);

        mockHazardIconsData = IconManagementMockStoreProviderFactory.GetMockHazardIconsList();
        mockControlIconsData = IconManagementMockStoreProviderFactory.GetMockControlIconsList();
        mockIconData = IconManagementMockStoreProviderFactory.getIcon();
    });

    it('should return the default state', () => {
        const action = {} as any;
        const result = reducer(initialState, action);
        expect(result).toEqual(initialState);
    });

    it('should return current state when no valid actions have been made', () => {
        const actual = reducer(initialState, { type: 'INVALID_ACTION', payload: {} });
        const expected = initialState;
        expect(actual).toBe(expected);
    });

    it('should dispatch LOAD_HAZARDS_OR_CONTROLS_LIST action load Hazard Or Controls list ', () => {
        atlasParamsArray.push(new AtlasParams('category', ''));
        atlasParamsArray.push(new AtlasParams('searchText', ''));
        sampleApiRequestParams.Params = atlasParamsArray;
        const actual = reducer(initialState, { type: '[HazardControl] Load hazards or controls', payload: sampleApiRequestParams });
        expect(actual.HasHazardsOrControlsListLoaded).toBe(false);
    });


    it('should dispatch LOAD_HAZARDS_OR_CONTROLS_LIST action when filters are changed in hazard icons tab', () => {
        atlasParamsArray.push(new AtlasParams('category', 1));
        atlasParamsArray.push(new AtlasParams('searchText', 'test'));
        atlasParamsArray.push(new AtlasParams('folder', 'hazard'));
        sampleApiRequestParams.Params = atlasParamsArray;

        initialState.apiRequestWithParams = sampleApiRequestParams;
        const actual = reducer(initialState, { type: '[HazardControl] Load hazards or controls', payload: sampleApiRequestParams });
        expect(actual.HasHazardsOrControlsListLoaded).toBeFalsy();
        expect(actual.apiRequestWithParams).toEqual(sampleApiRequestParams);
    });

    it('should dispatch LOAD_HAZARDS_OR_CONTROLS_LIST action when filters are changed in controls icons tab', () => {
        atlasParamsArray.push(new AtlasParams('category', 1));
        atlasParamsArray.push(new AtlasParams('searchText', 'test'));
        atlasParamsArray.push(new AtlasParams('folder', 'control'));
        sampleApiRequestParams.Params = atlasParamsArray;

        initialState.apiRequestWithParams = sampleApiRequestParams;
        const actual = reducer(initialState, { type: '[HazardControl] Load hazards or controls', payload: sampleApiRequestParams });
        expect(actual.HasHazardsOrControlsListLoaded).toBeFalsy();
        expect(actual.apiRequestWithParams).toEqual(sampleApiRequestParams);
    });

    it('after Hazard Or Controls list list load complete', () => {
        initialState.HazardsOrControlsListPagingInfo = mockHazardIconsData.HazardsOrControlsListPagingInfo;
        const actual = reducer(initialState, { type: '[HazardControl] Load hazards or controls list Complete', payload: mockHazardIconsData });
        expect(actual.HasHazardsOrControlsListLoaded).toBe(true);
        expect(actual.HazardsOrControlsListPagingInfo.PageNumber).toEqual(mockHazardIconsData.HazardsOrControlsListPagingInfo.PageNumber);
        expect(actual.HazardsOrControlsListPagingInfo.Count).toEqual(mockHazardIconsData.HazardsOrControlsListPagingInfo.Count);
        expect(actual.HazardsOrControlsList).toEqual(mockHazardIconsData.HazardsOrControlsList);
        expect(actual.HazardsOrControlsListPagingInfo.TotalCount).toEqual(mockHazardIconsData.HazardsOrControlsListPagingInfo.TotalCount);
    });


    it('when viewing records in other than first page ', () => {
        initialState.HazardsOrControlsListPagingInfo = mockHazardIconsData.HazardsOrControlsListPagingInfo;
        let payload = mockHazardIconsData;
        payload.HazardsOrControlsListPagingInfo.PageNumber = 2;
        const actual = reducer(initialState, { type: '[HazardControl] Load hazards or controls list Complete', payload: payload });
        expect(actual.HasHazardsOrControlsListLoaded).toBe(true);
        expect(actual.HazardsOrControlsListPagingInfo.PageNumber).toEqual(payload.HazardsOrControlsListPagingInfo.PageNumber);
        expect(actual.HazardsOrControlsListPagingInfo.Count).toEqual(payload.HazardsOrControlsListPagingInfo.Count);
        expect(actual.HazardsOrControlsList).toEqual(mockHazardIconsData.HazardsOrControlsList);
    });


    it('when actioned removing hazard', () => {
        let iconItem = new IconItem<Hazard>();
        iconItem.Type = this._folder;
        iconItem.Entity = IconManagementMockStoreProviderFactory.GetMockHazardIconsList().HazardsOrControlsList.toArray()[0];
        const actual = reducer(initialState, { type: '[HazardControl] Remove hazard or control', payload: iconItem });
        expect(actual.RemoveActionStatus).toBe(false);
    });

    it('when actioned removing control', () => {
        let iconItem = new IconItem<Control>();
        iconItem.Type = "control";
        iconItem.Entity = IconManagementMockStoreProviderFactory.GetMockControlIconsList().HazardsOrControlsList.toArray()[0];
        const actual = reducer(initialState, { type: '[HazardControl] Remove hazard or control', payload: iconItem });
        expect(actual.RemoveActionStatus).toBe(false);
    });

    it('when actioned removing hazard or control complete', () => {
        let status = true;
        const actual = reducer(initialState, { type: '[HazardControl] Remove hazard or control complete', payload: status });
        expect(actual.RemoveActionStatus).toBe(true);
    });

    it('when actioned bulk removal of hazards or controls', () => {
        let bulkIcons = new BulkIcons();
        let checkedRows: Array<string> = ['3ce19d3a-404e-4852-8ccb-9ad762e8c1c2', '19c2bc7c-e597-4438-8b89-dd12f228604f'];
        bulkIcons.Type = "hazard";
        bulkIcons.Icons = checkedRows;
        const actual = reducer(initialState, { type: '[HazardControl] Bulk remove hazard or control', payload: bulkIcons });
        expect(actual.BulkRemoveActionStatus).toBe(false);
    });

    it('when actioned bulk removal of hazards or controls complete', () => {
        let status = true;
        const actual = reducer(initialState, { type: '[HazardControl] Bulk remove hazard or control complete', payload: status });
        expect(actual.BulkRemoveActionStatus).toBe(true);
    });

    it('when actioned adding hazard icon', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        const actual = reducer(initialState, { type: '[ICON] Add icon', payload: { icon: icon, type: IconType.Hazard } });
        expect(actual.IconAddUpdateCompleteStatus).toBe(false);
    });
    it('when actioned adding control icon', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        const actual = reducer(initialState, { type: '[ICON] Add icon', payload: { icon: icon, type: IconType.Control } });
        expect(actual.IconAddUpdateCompleteStatus).toBe(false);
    });
    it('when add hazard icon complete', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        const actual = reducer(initialState, { type: '[ICON] Add icon complete', payload: true });
        expect(actual.IconAddUpdateCompleteStatus).toBe(true);
    });
    it('when add  control icon complete', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        const actual = reducer(initialState, { type: '[ICON] Add icon complete', payload: true });
        expect(actual.IconAddUpdateCompleteStatus).toBe(true);
    });
    it('when actioned updating hazard icon', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        const actual = reducer(initialState, { type: '[ICON] Update icon', payload: { icon: icon, type: IconType.Hazard } });
        expect(actual.IconAddUpdateCompleteStatus).toBe(false);
    });
    it('when actioned adding control icon', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        const actual = reducer(initialState, { type: '[ICON] Update icon', payload: { icon: icon, type: IconType.Control } });
        expect(actual.IconAddUpdateCompleteStatus).toBe(false);
    });
    it('when update hazard icon complete', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        const actual = reducer(initialState, { type: '[ICON] Update icon complete', payload: true });
        expect(actual.IconAddUpdateCompleteStatus).toBe(true);
    });
    it('when update  control icon complete', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        const actual = reducer(initialState, { type: '[ICON] Update icon complete', payload: true });
        expect(actual.IconAddUpdateCompleteStatus).toBe(true);
    });
    describe('Functions in Icon Management reducer', () => {

        beforeEach(() => {
            modifiedState = {
                HasHazardsOrControlsListLoaded: true,
                HazardsOrControlsList: mockHazardIconsData.HazardsOrControlsList,
                HazardsOrControlsListPagingInfo: mockHazardIconsData.HazardsOrControlsListPagingInfo,
                apiRequestWithParams: sampleApiRequestParams,
                RemoveActionStatus: true,
                BulkRemoveActionStatus: true,
                selectedIcon: mockIconData,
                IconAddUpdateCompleteStatus: false
            }
        });

        it('function should return loading state of hazard or controls icons list when getHazardsOrControlsListLoadingState method was called', () => {
            getHazardsOrControlsListLoadingState(Observable.of(modifiedState)).subscribe(val => {
                expect(val).toEqual(modifiedState.HasHazardsOrControlsListLoaded);
            });
        });

        it('function should return current api request when getHazardsOrControlsApiRequest method was called', () => {
            getHazardsOrControlsApiRequest(Observable.of(modifiedState)).subscribe(val => {
                expect(val).toEqual(modifiedState.apiRequestWithParams);
            });
        });

        it('function should return hazard or controls icons list  when getHazardsOrControlsList method was called', () => {
            getHazardsOrControlsList(Observable.of(modifiedState)).subscribe(val => {
                expect(val).toEqual(Immutable.List<Hazard>((modifiedState.HazardsOrControlsList)));
            });
        });

        it('function should return hazard or controls icons list total count when getHazardsOrControlsListTotalCount method was called', () => {
            getHazardsOrControlsListTotalCount(Observable.of(modifiedState)).subscribe(val => {
                expect(val).toEqual(modifiedState.HazardsOrControlsListPagingInfo.TotalCount);
            });
        });

        it('function should return hazard or controls icons list data table options when getHazardsOrControlsListDataTableOptions method was called', () => {
            let dataTableOptions = new DataTableOptions(mockHazardIconsData.HazardsOrControlsListPagingInfo.PageNumber, mockHazardIconsData.HazardsOrControlsListPagingInfo.Count, sampleApiRequestParams.SortBy.SortField, sampleApiRequestParams.SortBy.Direction);
            let pagingInformation = new PagingInfo(modifiedState.HazardsOrControlsListPagingInfo.PageSize, modifiedState.HazardsOrControlsListPagingInfo.TotalCount, modifiedState.HazardsOrControlsListPagingInfo.PageNumber, modifiedState.HazardsOrControlsListPagingInfo.PageSize);
            getHazardsOrControlsListDataTableOptions(Observable.of(modifiedState)).subscribe(val => {
                expect(val).toEqual(dataTableOptions);
            });
        });
        it('function should return selectedIcon data when getSelectedIcon method was called', () => {
            getSelectedIcon(Observable.of(modifiedState)).subscribe(val => {
                expect(val).toEqual(mockIconData);
            });
        });

        it('function should return icon remove status when remove actioned', () => {
            getRemoveActionStatus(Observable.of(modifiedState)).subscribe(val => {
                expect(val).toBe(true);
            });
        })

        it('function should return icon bulk remove status when bulk remove actioned', () => {
            getRemoveActionStatus(Observable.of(modifiedState)).subscribe(val => {
                expect(val).toBe(true);
            });
        })
        it('function should return add update icon statuswhen  getIconAddUpdateCompleteStatus method was called', () => {
            getIconAddUpdateCompleteStatus(Observable.of(modifiedState)).subscribe(val => {
                expect(val).toEqual(false);
            });
        });
    });

});
