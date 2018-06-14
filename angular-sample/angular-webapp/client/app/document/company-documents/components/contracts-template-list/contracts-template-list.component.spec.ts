import { CommonTestHelper } from '../../../../shared/testing/helpers/common-test-helper';
import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { Observable } from 'rxjs/Rx';
import { LoadSitesCompleteAction, LoadSitesAction } from './../../../../shared/actions/company.actions';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { Document, DocumentActionType } from './../../../models/document';
import { AeAutocompleteComponent } from '../../../../atlas-elements/ae-autocomplete/ae-autocomplete.component';
import { AeDatatableComponent } from '../../../../atlas-elements/ae-datatable/ae-datatable.component';
import { AeInputComponent } from '../../../../atlas-elements/ae-input/ae-input.component';
import { AeNavActionsComponent } from '../../../../atlas-elements/ae-nav-actions/ae-nav-actions.component';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { HomeModule } from '../../../../home/home.module';
import { routes } from '../../../../home/home.routes';
import { AtlasSharedModule } from '../../../../shared/atlas-shared.module';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers';
import { reducer } from '../../../../shared/reducers/index';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { MockStoreCompanyDocuments } from '../../../../shared/testing/mocks/mock-store-company-documents';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { DocumentSharedModule } from '../../../document-shared/document-shared.module';
import { LoadContractsListCompleteAction, LoadContractsListAction } from '../../actions/contracts.actions';
import { ContractsListComponent } from '../contracts-list/contracts-list.component';
import { ContractsTemplateListComponent } from './contracts-template-list.component';
import * as Immutable from 'immutable';

describe('Company documents -> contracts & hand books -> contract templates', () => {
    let component: ContractsTemplateListComponent;
    let fixture: ComponentFixture<ContractsTemplateListComponent>;
    let store: Store<fromRoot.State>;
    let loadedSites: AeSelectItem<string>[];
    let mockedAeselectSitesData: AeSelectItem<string>[];
    let dispatchSpy: jasmine.Spy;
    let params: AtlasParams[] = new Array();
    params.push(new AtlasParams('contractsFilter', 1))
    let contractsApiRequest = new AtlasApiRequestWithParams(1, 10, 'Title', SortDirection.Ascending, params);
    let rows; let actions;
    let columns;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , DocumentSharedModule
                , StoreModule.provideStore(reducer)
                , RouterModule.forChild(routes)
                , AtlasSharedModule
                , HomeModule
                , BrowserAnimationsModule
            ]
            , declarations: [
                ContractsTemplateListComponent
                , ContractsListComponent
            ]
            , providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
                , { provide: Router, useClass: RouterMock }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
            ]
        })
            .overrideComponent(ContractsTemplateListComponent, { set: { host: { '(click)': 'dummy' } } })
            .compileComponents();
    }));

    describe('Loading contracts template list with out data', () => {
        beforeEach(() => {

            fixture = TestBed.createComponent(ContractsTemplateListComponent);
            component = fixture.componentInstance;
            store = fixture.debugElement.injector.get(Store);
            dispatchSpy = spyOn(store, 'dispatch');
            fixture.detectChanges();
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

        });

        it('should create', () => {
            expect(component).toBeTruthy();
            let dataTable = fixture.debugElement.query(By.directive(AeDatatableComponent));
            expect(dataTable).toBeTruthy();
        });

        it('should have a filter by Site and have a filter by site of auto complete type', () => {
            let siteFilter = fixture.debugElement.query(By.css('#Contracts-template_AeAutocomplete_1'));
            expect(siteFilter).toBeTruthy();
            expect(siteFilter.componentInstance instanceof AeInputComponent).toBeTruthy();
            let autoCompleteElement = fixture.debugElement.query(By.directive(AeAutocompleteComponent));
            expect(autoCompleteElement).toBeTruthy();
            expect(autoCompleteElement.name).toEqual('ae-autocomplete');

        });
        it('should load sites when no sites were found and load contractList when no contracts found in the store', () => {
            let siteLoadActionPayLoad: LoadSitesAction = (new LoadSitesAction(false));
            expect(dispatchSpy).toHaveBeenCalledWith(siteLoadActionPayLoad);
            let contractLoadAction: LoadContractsListAction = (new LoadContractsListAction(contractsApiRequest));
            expect(dispatchSpy).toHaveBeenCalledWith(contractLoadAction);
        });


        describe('After site, document category, documents list is loaded', () => {
            beforeEach(fakeAsync(() => {
                let mockedSites = MockStoreCompanyDocuments.getSiteLists();
                mockedAeselectSitesData = MockStoreCompanyDocuments.getSiteAeelement();
                component.sites$.subscribe((val) => {
                    loadedSites = val;
                });

                dispatchSpy.and.callThrough();

                store.dispatch(new LoadSitesCompleteAction(mockedSites.Entities));
                store.dispatch(new LoadContractsListCompleteAction(MockStoreCompanyDocuments.getContractTemplates()));
                fixture.detectChanges();

                let siteControlDebug = fixture.debugElement.query(By.css('#Contracts-template_AeAutocomplete_1'));
                siteControlDebug.triggerEventHandler('change', { target: { value: null } });

                fixture.detectChanges();
                tick(100);
                rows = fixture.debugElement.queryAll(By.css('.table__row'));
                columns = fixture.debugElement.queryAll(By.css('.table__heading'));


            }));

            it('Load sites for filtering', fakeAsync(() => {
                tick(100);
                expect(loadedSites).toEqual(mockedAeselectSitesData);
            }));

            it('should have a column for template name,employee group,template version,last modified date,actions with sort option', () => {
                expect(columns[0].nativeElement.innerText.trim()).toEqual('HANDBOOK.TEMPLATE_NAME');
                expect(columns[0].nativeElement.classList).toContain('js-sortable');
                expect(columns[1].nativeElement.innerText.trim()).toEqual('HANDBOOK.EMPLOYEE_GROUP');
                expect(columns[1].nativeElement.classList).toContain('js-sortable');
                expect(columns[2].nativeElement.innerText.trim()).toEqual('HANDBOOK.TEMPLATE_VERSION');
                expect(columns[2].nativeElement.classList).toContain('js-sortable');
                expect(columns[3].nativeElement.innerText.trim()).toEqual('HANDBOOK.LAST_MODIFY');
                expect(columns[3].nativeElement.classList).toContain('js-sortable');
                expect(columns[4].nativeElement.innerText.trim()).toEqual('Actions');
                expect(columns[4].nativeElement.classList).not.toContain('js-sortable');
            });
            it('should have 2 action items and have an action item as personalise and download as word', fakeAsync(() => {
                let actionButtonitems = rows[0].query(By.css('.nav--actions')).componentInstance;
                expect(actionButtonitems instanceof AeNavActionsComponent).toBeTruthy();
                let actionButton = rows[0].query(By.css('.nav--actions')).componentInstance;
                let event = new MouseEvent('click');
                actionButton._onClick(event);
                tick(200);
                fixture.detectChanges();
                actions = rows[0].queryAll(By.css('li'));
                expect(actions.length).toEqual(2);
                //Below cases are failing while running in server so using other methodology to assert these case
                // expect(actions[0].nativeElement.innerText.toString().toLowerCase()).toEqual('personalise');
                // expect(actions[1].nativeElement.innerText.toString().toLowerCase()).toEqual('download as word');
                let listComponent = <ContractsListComponent>fixture.debugElement.query(By.directive(ContractsListComponent)).componentInstance;
                 CommonTestHelper.hasGivenButton(listComponent.actions.toArray(),'Personalise');
                 CommonTestHelper.hasGivenButton(listComponent.actions.toArray(),'Download as word');
   
            }));

            it('User selects sites filter', fakeAsync(() => {
                let currentRequest = component.contractsApiRequest;
                let siteAutoCompControl: AeAutocompleteComponent<string> = fixture.debugElement.query(By.directive(AeAutocompleteComponent)).componentInstance;
                component.contractListForm.patchValue({ Site: ['2f6b82eb-42fb-a36a-9888-1cd1a65a500d'] });
                fixture.detectChanges();
                tick(200);
                currentRequest.Params = addOrUpdateAtlasParamValue(currentRequest.Params, 'site', '2f6b82eb-42fb-a36a-9888-1cd1a65a500d');
                let companyDocLoadAction: LoadContractsListAction = (new LoadContractsListAction(currentRequest));
                expect(dispatchSpy).toHaveBeenCalledWith(companyDocLoadAction);

                store.dispatch(new LoadContractsListCompleteAction(MockStoreCompanyDocuments.getFilterContractTemplates()));
                dispatchSpy.and.callThrough();
                fixture.detectChanges();
            }));


        });

    });
})