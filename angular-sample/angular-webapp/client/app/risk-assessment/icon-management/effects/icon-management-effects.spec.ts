import {
    AddIconAction,
    AddIconCompleteAction,
    LoadIconAction,
    LoadIconCompleteAction,
    UpdateIconAction,
    UpdateIconCompleteAction,
} from '../actions/icon-add-update.actions';
import { addOrUpdateAtlasParamValue } from '../../../root-module/common/extract-helpers';
import { Icon } from '../models/icon';
import { IconType } from '../models/icon-type.enum';
import { IconManagementEffects } from "../../../risk-assessment/icon-management/effects/icon-management-effects";
import { Store, StoreModule } from '@ngrx/store';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasParams, AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { IconManagementMockStoreProviderFactory } from '../../../shared/testing/mocks/icon-mgmt-mock-store-provider-factory';
import { Hazard } from '../../models/hazard';
import { Observable } from 'rxjs/Rx';
import { TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';

import { BulkRemoveIconItemAction, RemoveIconItemAction, LoadHazardsOrControlsListAction, LoadHazardsOrControlsListCompleteAction } from '../../../risk-assessment/icon-management/actions/icon-management-actions';
import { BulkIcons, IconItem } from '../../../risk-assessment/icon-management/models/remove-icon-item';
import { RestClientService } from '../../../shared/data/rest-client.service';
import * as fromRoot from '../../../shared/reducers';
import { reducer } from '../../../shared/reducers/index';
import { MessengerService } from '../../../shared/services/messenger.service';
import { ResponseOptions, Response, URLSearchParams } from '@angular/http';

describe('Icon management effect: ', () => {
    let runner;
    let iconManagementEffect: IconManagementEffects;
    let restClientServiceStub;
    let store: Store<fromRoot.State>;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
            , StoreModule.provideStore(reducer)
        ]
        , providers: [
            IconManagementEffects
            , MessengerService
            , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceStub', ['get', 'post', 'put', 'delete']) }

        ]
    }));

    beforeEach(() => {
        runner = TestBed.get(EffectsRunner);
        iconManagementEffect = TestBed.get(IconManagementEffects);
        restClientServiceStub = TestBed.get(RestClientService);
        store = TestBed.get(Store);

    })

    it('should return complete action on success of load Hazard or Controls icons data', () => {
        let mockResponse = IconManagementMockStoreProviderFactory.getTestHazardIconsResponse();
        let mockHazardIconsData = IconManagementMockStoreProviderFactory.GetMockHazardIconsList();
        let params: Array<AtlasParams> = [];
        params.push(new AtlasParams('categoryHazardsFilter', '1'));
        params.push(new AtlasParams('searchHazardsFilter', "test"));
        params.push(new AtlasParams('folder', "hazard"));
        params.push(new AtlasParams('fields', 'Id,Name,PictureId,Description,Category,IsExample,Author.FirstName,Author.LastName,Version'));

        params.push(new AtlasParams('isExample', 'true'));
        let apiParams: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, params);
        let options = new ResponseOptions({ body: mockResponse });
        let response = new Response(options);

        restClientServiceStub.get.and.returnValue(Observable.of(response));
        runner.queue(new LoadHazardsOrControlsListAction(apiParams));

        let resultParams: URLSearchParams = new URLSearchParams();
        resultParams.set('pageNumber', apiParams.PageNumber.toString());
        resultParams.set('pageSize', apiParams.PageSize.toString());
        resultParams.set('sortField', apiParams.SortBy.SortField);
        resultParams.set('direction', apiParams.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

        let expt = new LoadHazardsOrControlsListCompleteAction({ HazardsOrControlsList: mockHazardIconsData.HazardsOrControlsList, HazardsOrControlsListPagingInfo: mockHazardIconsData.HazardsOrControlsListPagingInfo });

        iconManagementEffect.loadHazardOrControlsIcons$.subscribe((result) => {
            expect(expt).toEqual(result);
            expect(restClientServiceStub.get).toHaveBeenCalledWith('hazard', { search: resultParams });
        });
    });
    it('should return true  on success of add hazard icon', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        let iconType: IconType = IconType.Hazard;
        let respIcon = IconManagementMockStoreProviderFactory.getIconAsJson();
        let options = new ResponseOptions({ body: respIcon });
        let response = new Response(options);
        let params: URLSearchParams = new URLSearchParams();
        restClientServiceStub.put.and.returnValue(Observable.of(response));
        runner.queue(new AddIconAction({ icon: icon, type: IconType.Hazard }));

        iconManagementEffect.addIcon$.subscribe((result) => {
            expect(true).toEqual(result.payload);
            expect(restClientServiceStub.put).toHaveBeenCalledWith('Hazard', icon, { search: params });
        });
    });
    it('should return true  on success of add control icon', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        let iconType: IconType = IconType.Control;
        let options = new ResponseOptions({ body: icon });
        let response = new Response(options);
        let params: URLSearchParams = new URLSearchParams();
        restClientServiceStub.put.and.returnValue(Observable.of(response));
        runner.queue(new AddIconAction({ icon: icon, type: IconType.Control }));
        iconManagementEffect.addIcon$.subscribe((result) => {
            expect(true).toEqual(result.payload);
            expect(restClientServiceStub.put).toHaveBeenCalledWith('Control', icon, { search: params });
        });
    });
    it('should return true  on success of update hazard icon', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        let iconType: IconType = IconType.Hazard;
        let params: URLSearchParams = new URLSearchParams();
        let options = new ResponseOptions({ body: icon });
        let response = new Response(options);
        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new UpdateIconAction({ icon: icon, type: IconType.Hazard }));
        iconManagementEffect.updateIcon$.subscribe((result) => {
            expect(true).toEqual(result.payload);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('Hazard', icon, { search: params });
        });
    });
    it('should return true  on success of update hazard icon', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        let iconType: IconType = IconType.Control;
        let params: URLSearchParams = new URLSearchParams();
        let options = new ResponseOptions({ body: icon });
        let response = new Response(options);
        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new UpdateIconAction({ icon: icon, type: IconType.Control }));
        iconManagementEffect.updateIcon$.subscribe((result) => {
            expect(true).toEqual(result.payload);
            expect(restClientServiceStub.post).toHaveBeenCalledWith('Control', icon, { search: params });
        });
    });
    it('should return icon  on success of load hazard icon', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        let iconType: IconType = IconType.Hazard;
        let options = new ResponseOptions({ body: icon });
        let response = new Response(options);
        let params: URLSearchParams = new URLSearchParams();
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        iconManagementEffect.loadIcon$.subscribe((result) => {
            expect(icon).toEqual(result.payload);
            expect(restClientServiceStub.get).toHaveBeenCalledWith('Hazard', { search: params });
        });
    });
    it('should return icon  on success of load control icon', () => {
        let icon: Icon = IconManagementMockStoreProviderFactory.getIcon();
        let iconType: IconType = IconType.Control;
        let options = new ResponseOptions({ body: icon });
        let response = new Response(options);
        let params: URLSearchParams = new URLSearchParams();
        restClientServiceStub.get.and.returnValue(Observable.of(response));
        iconManagementEffect.loadIcon$.subscribe((result) => {
            expect(icon).toEqual(result.payload);
            expect(restClientServiceStub.get).toHaveBeenCalledWith('Control', { search: params });
        });
    });


    it('should return success status on remove action', () => {
        let iconItem = new IconItem<Hazard>();
        iconItem.Type = "hazard";
        iconItem.Entity = IconManagementMockStoreProviderFactory.GetMockHazardIconsList().HazardsOrControlsList.toArray()[0];
        let options = new ResponseOptions({ body: "OK" });
        let response = new Response(options);
        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new RemoveIconItemAction(iconItem));
        iconManagementEffect.RemoveIconItem$.subscribe((result) => {
            expect(result.payload).toBeTruthy();
        });
    })

    it('should return success statu on bulk remove action', () => {
        let bulkIcons = new BulkIcons();
        let checkedRows: Array<string> = ['3ce19d3a-404e-4852-8ccb-9ad762e8c1c2', '19c2bc7c-e597-4438-8b89-dd12f228604f'];
        bulkIcons.Type = "hazard";
        bulkIcons.Icons = checkedRows;
        let options = new ResponseOptions({ body: "OK" });
        let response = new Response(options);
        restClientServiceStub.post.and.returnValue(Observable.of(response));
        runner.queue(new BulkRemoveIconItemAction(bulkIcons));
        iconManagementEffect.BulkRemoveIcons$.subscribe((result) => {
            expect(result.payload).toBeTruthy();
        });
    })
});