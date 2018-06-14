import { FormBuilderService } from './../../../../shared/services/form-builder.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Store, Action, StoreModule } from '@ngrx/store';
import { LocaleServiceStub } from './../../../../shared/testing/mocks/locale-service-stub';
import { LocalizationConfigStub } from './../../../../shared/testing/mocks/localization-config-stub';
import { ChangeDetectorRef, DebugElement } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { RouterMock } from './../../../../shared/testing/mocks/router-stub';
import { ClaimsHelperServiceStub } from './../../../../shared/testing/mocks/claims-helper-service-mock';
import { RouteParamsMock } from './../../../../shared/testing/mocks/route-params-mock';
import { Subject, Observer, BehaviorSubject } from 'rxjs';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { TranslationServiceStub } from './../../../../shared/testing/mocks/translation-service-stub';
import { reducer } from './../../../../shared/reducers/index';
import { CommonModule } from '@angular/common';
import { AtlasElementsModule } from './../../../../atlas-elements/atlas-elements.module';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from './../../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocalizationConfig } from './../../../../shared/localization-config';
import { ActivatedRouteStub } from './../../../../shared/testing/mocks/activated-route-stub';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { RouteParams } from './../../../../shared/services/route-params';
import { AddProcedureComponent } from '../../components/add-procedure/add-procedure.component';
import { AddMsProcedureComponent } from '../../components/add-ms-procedure/add-ms-procedure.component';
import { ProcedureQuickViewComponent } from '../../components/procedure-quick-view/procedure-quick-view.component';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DocumentDetailsService } from './../../../../document/document-details/services/document-details.service';
import { DocumentDetailsServiceStub } from './../../../../shared/testing/mocks/document-details-service-stub';
import { Http } from '@angular/http';
import { mockHttpProvider } from './../../../../shared/testing/mocks/http-stub';
import { ProcedureCode, MethodStatement } from './../../../../method-statements/models/method-statement';
import { LoadMethodStatementByIdCompleteAction, LoadProceduresForMSCompleteAction, LoadProceduresForMSAction } from '../../actions/manage-methodstatement.actions';
import { tick } from '@angular/core/testing';
import { fakeAsync } from '@angular/core/testing';
import { ProcedureService } from './../../../../method-statements/procedures/services/procedure.service';
import { ProcedureServiceStub } from './../../../../shared/testing/mocks/procedure-service-stub';
import { isNullOrUndefined } from 'util';
import { AeCheckboxComponent } from './../../../../atlas-elements/ae-checkbox/ae-checkbox.component';
import { Procedure } from './../../../../method-statements/procedures/models/procedure';
import { MSProcedureMockData } from './../../../../shared/testing/mocks/data/msprocedure-data';
import { AeSelectComponent } from './../../../../atlas-elements/ae-select/ae-select.component';
import { AtlasApiRequestWithParams } from './../../../../shared/models/atlas-api-response';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { addOrUpdateAtlasParamValue } from './../../../../root-module/common/extract-helpers';

describe('Method Statements sequence of events Component', () => {
  let component: AddMsProcedureComponent;
  let fixture: ComponentFixture<AddMsProcedureComponent>;
  let store: Store<fromRoot.State>;
  let dispatchSpy: jasmine.Spy;
  let configLoaded: jasmine.Spy;
  let dataTableElement: any;

  let breadCumServiceStub: any;
  let localeServiceStub: any;
  let translationServiceStub: any;
  let localizationConfigStub: any;
  let routerMock: any;
  let activatedRouteStub: any;
  let claimsHelperServiceStub: any
  let routeParamsStub: any;
  let _http: any;
  let msObject: any;
  let newProcSpy: any;
  let datagridElement: any;
  let columnDivs: any;
  let expectedAPIRequest: AtlasApiRequestWithParams;

  let assertFun = function (columnDivs: DebugElement[], columnIndex: number, columnNameKey: string, sortKey: string) {
    let divHeader = columnDivs[columnIndex];
    let spanHeader: HTMLSpanElement = divHeader.query(By.css('span')).nativeElement;
    expect(spanHeader.innerHTML).toEqual(columnNameKey);
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AtlasElementsModule,
        NoopAnimationsModule,
        LocalizationModule,
        StoreModule.provideStore(reducer)
      ],
      declarations: [
        AddMsProcedureComponent
        , AddProcedureComponent
        , ProcedureQuickViewComponent
      ],
      providers: [
        FormBuilderService,
        InjectorRef
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
        , { provide: Router, useClass: RouterMock }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: DocumentDetailsService, useClass: DocumentDetailsServiceStub }
        , { provide: RouteParams, useClass: RouteParamsMock }
        , { provide: Http, useValue: mockHttpProvider }
        , { provide: ProcedureService, useValue: ProcedureServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    msObject = JSON.parse(MSProcedureMockData);
    fixture = TestBed.createComponent(AddMsProcedureComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(Store);
    component.methodStatementId = msObject;
    component.procedureGroupId = '5188533a-e520-4282-92e2-4af25e3d0678';
    fixture.detectChanges();

    breadCumServiceStub = fixture.debugElement.injector.get(BreadcrumbService);
    localeServiceStub = fixture.debugElement.injector.get(LocaleService);
    translationServiceStub = fixture.debugElement.injector.get(TranslationService);
    localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
    routerMock = fixture.debugElement.injector.get(Router);
    activatedRouteStub = fixture.debugElement.injector.get(ActivatedRoute);
    claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
    routeParamsStub = fixture.debugElement.injector.get(RouteParams);

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    dataTableElement = fixture.debugElement.query(By.css('ae-datatable'));
    dispatchSpy = spyOn(store, 'dispatch');
  });

  describe('Component launch', () => {
    it('"Adding a Procedure to method statement" component must be launched without any errors', () => {
      expect(component).toBeTruthy();
    });

    it('"Add Procedure" slide-out panel title must be "Add procedure"', () => {
      let titleElement = <HTMLElement>fixture.debugElement.query(By.css('.so-panel__title')).query(By.css('h3')).nativeElement;
      expect(titleElement).toBeDefined();
      expect(1).toBe(1);
    });
  });

  describe('"New Procedure" button', () => {
    beforeEach(() => {
      newProcSpy = spyOn(component, 'addNewProcedure').and.callThrough();
    });

    it('Verify "New Procedure" button is present in the UI or not.', () => {
      let newProcedureButton = fixture.debugElement.nativeElement
        .querySelector('#AddMSProcedure_AeAnchor_1');
      expect(newProcedureButton).toBeDefined();
    });

    it('"New Procedure" button text must be "New procedure".', () => {
      let newProcedureButton = <HTMLElement>fixture.debugElement.nativeElement
        .querySelector('#AddMSProcedure_AeAnchor_1');
      expect(1).toBe(1);
    });

    it('Verify whether user is able to click on "New Procedure" button or not.', async () => {
      let newProcedureButton = <HTMLAnchorElement>fixture.debugElement.nativeElement
        .querySelector('#AddMSProcedure_AeAnchor_1');
      newProcedureButton.click();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(newProcSpy).toHaveBeenCalled();
        expect(component.showNewProcedurePanel).toBeTruthy();
      });
    });

    it('When user clicks on "New procedure" button, slide-out panle to add a new procedure must be displayed.', async () => {
      let newProcedureButton = fixture.debugElement.nativeElement
        .querySelector('#AddMSProcedure_AeAnchor_1');
      newProcedureButton.click();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(newProcSpy).toHaveBeenCalled();
        expect(component.showNewProcedurePanel).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelector('#add_new_procedure_panel')).toBeDefined();
        expect((<HTMLElement>fixture.debugElement.nativeElement.querySelector('#add_new_procedure_panel')).classList.contains('slide--animate')).toBeTruthy();
      });
    });
  });

  describe('"Filter by" section', () => {
    beforeEach(() => {
      component.methodStatementId = msObject;
      component.procedureGroupId = '5188533a-e520-4282-92e2-4af25e3d0678';
    });

    it('Name of "Filter by" field must be "Filter by"', () => {
      let filterByElement = <HTMLElement>fixture.debugElement
        .query(By.css('.so-panel__content'))
        .query(By.css('.add-ms-procedure'))
        .query(By.css('.table__filter-bar'))
        .query(By.css('.filter-bar__label'))
        .nativeElement;

      expect(filterByElement).toBeDefined();
      expect(1).toBe(1);
    });

    it('When adding procedure to a non-example method statement, "filter by" section must be displayed.', () => {
      let filterByElement = fixture.debugElement
        .query(By.css('.so-panel__content'))
        .query(By.css('.add-ms-procedure'))
        .query(By.css('.table__filter-bar'));

      expect(component.methodStatementId.IsExample).toBeFalsy();
      expect(filterByElement).toBeDefined();
    });

    it('When adding procedure to a example method statement, "filter by" section must not be displayed.', fakeAsync(() => {
      let msTempObject = Object.assign({}, msObject);
      msTempObject.IsExample = true;
      component.methodStatementId = Object.assign({}, msTempObject);
      let anchorElement = <HTMLAnchorElement>fixture.debugElement.query(By.css('#AddMSProcedure_AeAnchor_1')).nativeElement;
      anchorElement.click();
      //above click is just to trigger the change detection process
      fixture.detectChanges();
      tick(60);
      let filterByElement = <HTMLElement>fixture.debugElement
        .query(By.css('.so-panel__content'))
        .query(By.css('.table.add-ms-procedure'))
        .nativeElement;
      expect(filterByElement.querySelector('.table__filter-bar')).toBe(null);

    }));

    it('Verify whether Drop down of Filter type is present in the UI or not', () => {
      let filterByElement = <HTMLElement>fixture.debugElement
        .query(By.css('.so-panel__content'))
        .query(By.css('.add-ms-procedure'))
        .query(By.css('.table__filter-bar'))
        .query(By.css('.filter-bar__filters'))
        .query(By.css('#AddMSProcedure_AeSelect_2'))
        .nativeElement;

      expect(filterByElement).toBeDefined();
    });

    it('Verify whether Drop down of Filter type has options of All, Examples, Own or not', () => {
      let filterByElement = <HTMLSelectElement>fixture.debugElement
        .query(By.css('.so-panel__content'))
        .query(By.css('.add-ms-procedure'))
        .query(By.css('.table__filter-bar'))
        .query(By.css('.filter-bar__filters'))
        .query(By.css('#AddMSProcedure_AeSelect_2'))
        .nativeElement;

      expect(filterByElement.options).toBeDefined();
      expect(filterByElement.options.length).toBe(3);
      expect(filterByElement.options[0].text).toBe('All');
      expect(filterByElement.options[1].text).toBe('Examples');
      expect(filterByElement.options[2].text).toBe('Own');
    });

    it('Verify whether Drop down of Filter type defaults to option "All"', () => {
      let filterByElement = <HTMLSelectElement>fixture.debugElement
        .query(By.css('.so-panel__content'))
        .query(By.css('.add-ms-procedure'))
        .query(By.css('.table__filter-bar'))
        .query(By.css('.filter-bar__filters'))
        .query(By.css('#AddMSProcedure_AeSelect_2'))
        .nativeElement;
      expect(filterByElement.options).toBeDefined();
      expect(component.filterType).toBe('All');
    });

    it('Verify whether Drop down of Filter type defaults to option "All"', () => {
      let filterByElement = <HTMLSelectElement>fixture.debugElement
        .query(By.css('.so-panel__content'))
        .query(By.css('.add-ms-procedure'))
        .query(By.css('.table__filter-bar'))
        .query(By.css('.filter-bar__filters'))
        .query(By.css('#AddMSProcedure_AeSelect_2'))
        .nativeElement;
      expect(filterByElement.options).toBeDefined();
      expect(component.filterType).toBe('All');
    });

    it('Verify whether user is able to change options from Filter type dropdown or not', () => {
      let filterSpy = spyOn(component, 'changeFilterType').and.callThrough();
      let filterByElement = fixture.debugElement
        .query(By.css('.so-panel__content'))
        .query(By.css('.add-ms-procedure'))
        .query(By.css('.table__filter-bar'))
        .query(By.css('.filter-bar__filters'));

      let selectComponent = <AeSelectComponent<string>>filterByElement.query(By.directive(AeSelectComponent)).componentInstance;
      selectComponent.aeSelectChange.emit({
        SelectedItem: {
          Text: 'Own',
          Value: 'Own'
        }
      });
      expect(filterSpy).toHaveBeenCalled();
    });

    it('Verify whether appropriate procedures are fetching from server, after filter type change', () => {
      expectedAPIRequest = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, []);
      let filterByElement = fixture.debugElement
        .query(By.css('.so-panel__content'))
        .query(By.css('.add-ms-procedure'))
        .query(By.css('.table__filter-bar'))
        .query(By.css('.filter-bar__filters'));
      dispatchSpy.and.callThrough();
      let selectComponent = <AeSelectComponent<string>>filterByElement.query(By.directive(AeSelectComponent)).componentInstance;
      selectComponent.aeSelectChange.emit({
        SelectedItem: {
          Text: 'Own',
          Value: 'Own'
        }
      });
      expectedAPIRequest.Params = addOrUpdateAtlasParamValue(expectedAPIRequest.Params, 'ProcedureGroup', '5188533a-e520-4282-92e2-4af25e3d0678');
      expectedAPIRequest.Params = addOrUpdateAtlasParamValue(expectedAPIRequest.Params, 'MethodStatementId', '90e92c62-4ffe-4be2-93b7-7f10f0a1c169');
      expectedAPIRequest.Params = addOrUpdateAtlasParamValue(expectedAPIRequest.Params, 'exampleType', 'Own');
      expectedAPIRequest.Params = addOrUpdateAtlasParamValue(expectedAPIRequest.Params, 'example', 'false');
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadProceduresForMSAction(expectedAPIRequest));
    });

    it('Verify whether appropriate procedures are displaying in procedure datatable after filter type change', fakeAsync(() => {
      expectedAPIRequest = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, []);
      let filterByElement = fixture.debugElement
        .query(By.css('.so-panel__content'))
        .query(By.css('.add-ms-procedure'))
        .query(By.css('.table__filter-bar'))
        .query(By.css('.filter-bar__filters'));
      dispatchSpy.and.callThrough();
      let selectComponent = <AeSelectComponent<string>>filterByElement.query(By.directive(AeSelectComponent)).componentInstance;
      selectComponent.aeSelectChange.emit({
        SelectedItem: {
          Text: 'Own',
          Value: 'Own'
        }
      });
      expectedAPIRequest.Params = addOrUpdateAtlasParamValue(expectedAPIRequest.Params, 'ProcedureGroup', '5188533a-e520-4282-92e2-4af25e3d0678');
      expectedAPIRequest.Params = addOrUpdateAtlasParamValue(expectedAPIRequest.Params, 'MethodStatementId', '90e92c62-4ffe-4be2-93b7-7f10f0a1c169');
      expectedAPIRequest.Params = addOrUpdateAtlasParamValue(expectedAPIRequest.Params, 'exampleType', 'Own');
      expectedAPIRequest.Params = addOrUpdateAtlasParamValue(expectedAPIRequest.Params, 'example', 'false');
      let anchorElement = <HTMLAnchorElement>fixture.debugElement.query(By.css('#AddMSProcedure_AeAnchor_1')).nativeElement;
      //anchorElement.click();
      //above click is just to trigger the change detection process
      fixture.detectChanges();
      tick(200);
      expect(dispatchSpy).toHaveBeenCalledWith(new LoadProceduresForMSAction(expectedAPIRequest))

    }));
  });

  describe('procedures data table', () => {
    beforeEach(() => {
      datagridElement = fixture.debugElement.query(By.css('#AddMSProcedure_AeDatatable_6_divBody_0'));
      columnDivs = datagridElement.queryAll(By.css('.table__heading'));
    });

    it('Verify whether Procedures data table is present in UI or not.', () => {
      expect(datagridElement).toBeDefined();
    });

    it('Verify whether Procedures data table has two columns or not.', () => {
      let columns = fixture.debugElement.nativeElement.querySelectorAll('.table__heading');
      expect(columns.length).toEqual(2);
    });

    it('Verify whether Procedures data table has columns with agreed column names.', () => {
      assertFun(columnDivs, 0, 'MANAGE_METHOD_STM.SEQUENCE_OF_EVENTS.PROC_NAME', '');
      assertFun(columnDivs, 1, 'Actions', '');
    });

    it('Procedures data table must show "no data to display" message when there is no data in it.', async(() => {
      let procData = JSON.parse('{"Entities": []}');
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadProceduresForMSCompleteAction(procData));
      expect(component.procedureStore$.getValue().count()).toBe(0);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let cells = fixture.debugElement.nativeElement.querySelectorAll('.no--data');
        expect(cells).not.toBeNull();
        expect(cells[0].innerText).toEqual('There is no data to display');
      });
    }));

    it('Verify whether supplied data is properly rendering on each cell in procedures data table or not.', fakeAsync(() => {
      let procData = JSON.parse('{"Entities":[{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":6,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"40c6bd44-d783-4c5b-a8a6-469d3a40c325","CreatedOn":"2016-08-24T05:43:00","ModifiedOn":"2016-08-24T05:43:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":12,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3e740d3f-ef01-4779-942c-784e35bec4d3","CreatedOn":"2016-10-05T01:45:00","ModifiedOn":"2016-10-05T01:45:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add pro","Description":"<p>87ol;9erfgttbh</p>","IsExample":false,"OrderIndex":2,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3b64a79b-5986-4de3-aeb8-b623407a9646","CreatedOn":"2016-07-20T04:28:00","ModifiedOn":"2016-07-20T04:28:00","CreatedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","ModifiedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add test","Description":"<p>waftwewe</p>","IsExample":false,"OrderIndex":3,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"37515603-f31d-4384-beba-620b723febce","CreatedOn":"2016-08-03T05:06:00","ModifiedOn":"2016-08-03T05:06:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0"}]}');
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadProceduresForMSCompleteAction(procData));
      let anchorElement = <HTMLAnchorElement>fixture.debugElement.query(By.css('#AddMSProcedure_AeAnchor_1')).nativeElement;
      anchorElement.click();
      //above click is just to trigger the change detection process
      fixture.detectChanges();
      tick(200);
      expect(component.procedureStore$.getValue()).not.toBe(null);
      let eleList = (<HTMLElement>(<DebugElement>datagridElement).query(By.css('.table__row--group')).nativeElement).querySelectorAll('.table__row');
      for (let i = 0; i < eleList.length; i++) {
        expect(eleList.item(i).querySelector('.table__item-inner').querySelector('span').innerHTML).toBe(procData.Entities[i].Name);
        if (i === 2) {
          break;
        }
      }
    }));

    it('Verify whether each row in procedure datatable has "Procedure quick view" button or not.', async(() => {
      let procData = JSON.parse('{"Entities":[{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":6,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"40c6bd44-d783-4c5b-a8a6-469d3a40c325","CreatedOn":"2016-08-24T05:43:00","ModifiedOn":"2016-08-24T05:43:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":12,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3e740d3f-ef01-4779-942c-784e35bec4d3","CreatedOn":"2016-10-05T01:45:00","ModifiedOn":"2016-10-05T01:45:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add pro","Description":"<p>87ol;9erfgttbh</p>","IsExample":false,"OrderIndex":2,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3b64a79b-5986-4de3-aeb8-b623407a9646","CreatedOn":"2016-07-20T04:28:00","ModifiedOn":"2016-07-20T04:28:00","CreatedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","ModifiedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add test","Description":"<p>waftwewe</p>","IsExample":false,"OrderIndex":3,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"37515603-f31d-4384-beba-620b723febce","CreatedOn":"2016-08-03T05:06:00","ModifiedOn":"2016-08-03T05:06:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0"}]}');
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadProceduresForMSCompleteAction(procData));
      expect(component.procedureStore$.getValue()).not.toBe(null);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        fixture.debugElement.query(By.css('ae-datatable')).queryAll(By.css('.table__row')).forEach((r, i) => {
          expect(r.query(By.css('#AddMSProcedure_AeIcon_' + i))).toBeDefined();
        });
      });
    }));

    it('Verify whether user is able to click on "Procedure quick view" button in procedure data table or not.', async(() => {
      let procData = JSON.parse('{"Entities":[{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":6,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"40c6bd44-d783-4c5b-a8a6-469d3a40c325","CreatedOn":"2016-08-24T05:43:00","ModifiedOn":"2016-08-24T05:43:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":12,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3e740d3f-ef01-4779-942c-784e35bec4d3","CreatedOn":"2016-10-05T01:45:00","ModifiedOn":"2016-10-05T01:45:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add pro","Description":"<p>87ol;9erfgttbh</p>","IsExample":false,"OrderIndex":2,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3b64a79b-5986-4de3-aeb8-b623407a9646","CreatedOn":"2016-07-20T04:28:00","ModifiedOn":"2016-07-20T04:28:00","CreatedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","ModifiedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add test","Description":"<p>waftwewe</p>","IsExample":false,"OrderIndex":3,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"37515603-f31d-4384-beba-620b723febce","CreatedOn":"2016-08-03T05:06:00","ModifiedOn":"2016-08-03T05:06:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0"}]}');
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadProceduresForMSCompleteAction(procData));
      expect(component.procedureStore$.getValue()).not.toBe(null);
      fixture.detectChanges();
      let btnSpy = spyOn(component, 'showProcQuickInfo').and.callThrough();
      fixture.whenStable().then(() => {
        let procViewbtn = <HTMLElement>fixture.debugElement.query(By.css('ae-datatable')).queryAll(By.css('.table__row'))[0].query(By.css('a')).nativeElement;
        procViewbtn.click();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(btnSpy).toHaveBeenCalled();
        });
      });
    }));

    it('Procedures data table must load with all procedures', fakeAsync(() => {
      let procData = JSON.parse('{"Entities":[{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":6,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"40c6bd44-d783-4c5b-a8a6-469d3a40c325","CreatedOn":"2016-08-24T05:43:00","ModifiedOn":"2016-08-24T05:43:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":12,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3e740d3f-ef01-4779-942c-784e35bec4d3","CreatedOn":"2016-10-05T01:45:00","ModifiedOn":"2016-10-05T01:45:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add pro","Description":"<p>87ol;9erfgttbh</p>","IsExample":false,"OrderIndex":2,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3b64a79b-5986-4de3-aeb8-b623407a9646","CreatedOn":"2016-07-20T04:28:00","ModifiedOn":"2016-07-20T04:28:00","CreatedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","ModifiedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add test","Description":"<p>waftwewe</p>","IsExample":false,"OrderIndex":3,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"37515603-f31d-4384-beba-620b723febce","CreatedOn":"2016-08-03T05:06:00","ModifiedOn":"2016-08-03T05:06:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0"}]}');
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadProceduresForMSCompleteAction(procData));
      expect(component.procedureStore$.getValue()).not.toBe(null);
    }));

    it('Verify whether paging provision is available in procedures data table or not.', (() => {
      let listeners = fixture.debugElement.query(By.css('ae-datatable')).listeners;
      let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
      expect(pageChangeEvent).toBeDefined();
    }));
  });

  describe('Select procedures from procedures data table', () => {
    beforeEach(() => {
      datagridElement = fixture.debugElement.query(By.css('#AddMSProcedure_AeDatatable_6_divBody_0'));
      columnDivs = datagridElement.queryAll(By.css('.table__heading'));
    });

    it('Verify whether user is able to check/uncheck the checkboxes under Actions column in procedure datatable', async(() => {
      let procData = JSON.parse('{"Entities":[{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":6,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"40c6bd44-d783-4c5b-a8a6-469d3a40c325","CreatedOn":"2016-08-24T05:43:00","ModifiedOn":"2016-08-24T05:43:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":12,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3e740d3f-ef01-4779-942c-784e35bec4d3","CreatedOn":"2016-10-05T01:45:00","ModifiedOn":"2016-10-05T01:45:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add pro","Description":"<p>87ol;9erfgttbh</p>","IsExample":false,"OrderIndex":2,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3b64a79b-5986-4de3-aeb8-b623407a9646","CreatedOn":"2016-07-20T04:28:00","ModifiedOn":"2016-07-20T04:28:00","CreatedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","ModifiedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add test","Description":"<p>waftwewe</p>","IsExample":false,"OrderIndex":3,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"37515603-f31d-4384-beba-620b723febce","CreatedOn":"2016-08-03T05:06:00","ModifiedOn":"2016-08-03T05:06:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true}]}');
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadProceduresForMSCompleteAction(procData));
      expect(component.procedureStore$.getValue()).not.toBe(null);
      let ents = Array.from<Procedure>(procData.Entities);
      ents = ents.map(c => {
        c.IsSelected = true;
        return c;
      });
      component.procedureStore$.next(Immutable.List(ents));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        (<DebugElement>datagridElement).query(By.css('.table__row--group')).queryAll(By.css('.table__row')).forEach((row, i) => {

          let childComponent = <AeCheckboxComponent>row.query(By.directive(AeCheckboxComponent)).componentInstance;
          let selectedValue = component.getFieldValue(i, 'IsSelected');
          childComponent.value = selectedValue;
          childComponent.checked = selectedValue;
          childComponent.onAeChange.emit(selectedValue);
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            expect(component.selectedProcCount).toBe(ents.length);
          });
        });
      });
    }));

    it('Verify whether submit button is enabled, when no. of selected procedures are more than zero', async(() => {
      let procData = JSON.parse('{"Entities":[{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":6,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"40c6bd44-d783-4c5b-a8a6-469d3a40c325","CreatedOn":"2016-08-24T05:43:00","ModifiedOn":"2016-08-24T05:43:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":12,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3e740d3f-ef01-4779-942c-784e35bec4d3","CreatedOn":"2016-10-05T01:45:00","ModifiedOn":"2016-10-05T01:45:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add pro","Description":"<p>87ol;9erfgttbh</p>","IsExample":false,"OrderIndex":2,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3b64a79b-5986-4de3-aeb8-b623407a9646","CreatedOn":"2016-07-20T04:28:00","ModifiedOn":"2016-07-20T04:28:00","CreatedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","ModifiedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add test","Description":"<p>waftwewe</p>","IsExample":false,"OrderIndex":3,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"37515603-f31d-4384-beba-620b723febce","CreatedOn":"2016-08-03T05:06:00","ModifiedOn":"2016-08-03T05:06:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true}]}');
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadProceduresForMSCompleteAction(procData));
      expect(component.procedureStore$.getValue()).not.toBe(null);
      let ents = Array.from<Procedure>(procData.Entities);
      ents[0].IsSelected = true;
      component.procedureStore$.next(Immutable.List(ents));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        (<DebugElement>datagridElement).query(By.css('.table__row--group')).queryAll(By.css('.table__row')).forEach((row, i) => {

          let childComponent = <AeCheckboxComponent>row.query(By.directive(AeCheckboxComponent)).componentInstance;
          let selectedValue = component.getFieldValue(i, 'IsSelected');
          childComponent.value = selectedValue;
          childComponent.checked = selectedValue;
          childComponent.onAeChange.emit(selectedValue);
        });

        fixture.detectChanges(); // button--disabled  
        fixture.whenStable().then(() => {
          let submitButton = <HTMLElement>fixture.debugElement.query(By.css('#AddMSProcedure_ae-anchor_1')).nativeElement;
          expect(submitButton.classList.contains('button--disabled')).toBeFalsy();
        });
      });
    }));

    it('Verify whether selected procedures are adding to grid after user clicks on submit button', async(() => {
      let procData = JSON.parse('{"Entities":[{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":6,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"40c6bd44-d783-4c5b-a8a6-469d3a40c325","CreatedOn":"2016-08-24T05:43:00","ModifiedOn":"2016-08-24T05:43:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":12,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3e740d3f-ef01-4779-942c-784e35bec4d3","CreatedOn":"2016-10-05T01:45:00","ModifiedOn":"2016-10-05T01:45:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add pro","Description":"<p>87ol;9erfgttbh</p>","IsExample":false,"OrderIndex":2,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3b64a79b-5986-4de3-aeb8-b623407a9646","CreatedOn":"2016-07-20T04:28:00","ModifiedOn":"2016-07-20T04:28:00","CreatedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","ModifiedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add test","Description":"<p>waftwewe</p>","IsExample":false,"OrderIndex":3,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"37515603-f31d-4384-beba-620b723febce","CreatedOn":"2016-08-03T05:06:00","ModifiedOn":"2016-08-03T05:06:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true}]}');
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadProceduresForMSCompleteAction(procData));
      expect(component.procedureStore$.getValue()).not.toBe(null);
      let ents = Array.from<Procedure>(procData.Entities);
      ents[0].IsSelected = true;
      component.procedureStore$.next(Immutable.List(ents));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        (<DebugElement>datagridElement).query(By.css('.table__row--group')).queryAll(By.css('.table__row')).forEach((row, i) => {

          let childComponent = <AeCheckboxComponent>row.query(By.directive(AeCheckboxComponent)).componentInstance;
          let selectedValue = component.getFieldValue(i, 'IsSelected');
          childComponent.value = selectedValue;
          childComponent.checked = selectedValue;
          childComponent.onAeChange.emit(selectedValue);
        });

        fixture.detectChanges(); // button--disabled
        fixture.whenStable().then(() => {
          let addSpy = spyOn(component, 'onAddSelectedMSProcs').and.callThrough();
          let submitButton = <HTMLElement>fixture.debugElement.query(By.css('#AddMSProcedure_ae-anchor_1')).nativeElement;
          submitButton.click();
          expect(addSpy).toHaveBeenCalled();
        });
      });
    }));

    it('Verify whether submit button is disabled, when no. of selected procedures are less than one', async(() => {
      let procData = JSON.parse('{"Entities":[{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":6,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"40c6bd44-d783-4c5b-a8a6-469d3a40c325","CreatedOn":"2016-08-24T05:43:00","ModifiedOn":"2016-08-24T05:43:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"a1","Description":"","IsExample":false,"OrderIndex":12,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3e740d3f-ef01-4779-942c-784e35bec4d3","CreatedOn":"2016-10-05T01:45:00","ModifiedOn":"2016-10-05T01:45:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add pro","Description":"<p>87ol;9erfgttbh</p>","IsExample":false,"OrderIndex":2,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"3b64a79b-5986-4de3-aeb8-b623407a9646","CreatedOn":"2016-07-20T04:28:00","ModifiedOn":"2016-07-20T04:28:00","CreatedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","ModifiedBy":"6dc0bc83-6c9e-4b49-9144-a2b7e60fda2a","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true},{"Author":null,"Modifier":null,"ProcedureGroup":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","Name":"add test","Description":"<p>waftwewe</p>","IsExample":false,"OrderIndex":3,"ProcedureGroupId":"5188533a-e520-4282-92e2-4af25e3d0678","Id":"37515603-f31d-4384-beba-620b723febce","CreatedOn":"2016-08-03T05:06:00","ModifiedOn":"2016-08-03T05:06:00","CreatedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","ModifiedBy":"c4d65343-b71e-437e-b96d-3d5f0fe1c413","IsDeleted":false,"LCid":2057,"Version":"1.0","IsSelected":true}]}');
      dispatchSpy.and.callThrough();
      store.dispatch(new LoadProceduresForMSCompleteAction(procData));
      expect(component.procedureStore$.getValue()).not.toBe(null);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        (<DebugElement>datagridElement).query(By.css('.table__row--group')).queryAll(By.css('.table__row')).forEach((row, i) => {

          let childComponent = <AeCheckboxComponent>row.query(By.directive(AeCheckboxComponent)).componentInstance;
          let selectedValue = component.getFieldValue(i, 'IsSelected');
          childComponent.value = selectedValue;
          childComponent.checked = selectedValue;
          childComponent.onAeChange.emit(selectedValue);
        });
        fixture.detectChanges(); // button--disabled
        fixture.whenStable().then(() => {
          let submitButton = <HTMLElement>fixture.debugElement.query(By.css('#AddMSProcedure_ae-anchor_1')).nativeElement;
          expect(submitButton.classList.contains('button--disabled')).toBeTruthy();
        });
      });
    }));
  });

  describe('"Close" button in slide-out panel', () => {
    it('Verify whether "Close" button is present in the UI', () => {
      let closeButton = fixture.debugElement.query(By.css('#addmsprocedure_button_close')).nativeElement;
      expect(closeButton).toBeDefined();
    });

    it('Verify whether slide-out panel is getting closed, when user clicks on close button.', async(() => {
      let closebtnSpy = spyOn(component, 'closeAddMSProcSlideOut');
      let closeButton = fixture.debugElement.query(By.css('#addmsprocedure_button_close')).nativeElement;
      closeButton.click();
      fixture.whenStable().then(() => {
        expect(closebtnSpy).toHaveBeenCalled();
      });

    }));
  });
});
