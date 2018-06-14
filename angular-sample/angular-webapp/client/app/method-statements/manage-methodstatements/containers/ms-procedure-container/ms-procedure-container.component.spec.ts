import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { StoreInjectorComponent } from './../../../../shared/testing/mocks/components/store-injector/store-injector.component';
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
import { MethodStatementCopyModule } from './../../../../method-statements/method-statement-copy/method-statement-copy.module';
import { AtlasElementsModule } from './../../../../atlas-elements/atlas-elements.module';
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from 'angular-l10n';
import { AtlasSharedModule } from './../../../../shared/atlas-shared.module';
import { routes } from './../../manage-method-statements.routes';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbServiceStub } from './../../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocalizationConfig } from './../../../../shared/localization-config';
import { ActivatedRouteStub } from './../../../../shared/testing/mocks/activated-route-stub';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { RouteParams } from './../../../../shared/services/route-params';
import { MethodstatementContainerComponent } from '../../containers/methodstatement-container/methodstatement-container.component';
import { GeneralComponent } from '../../components/general/general.component';
import { PlantEquipmentComponent } from '../../components/plant-equipment/plant-equipment.component';
import { SafetyPrecautionsComponent } from '../../components/safety-precautions/safety-precautions.component';
import { FurtherInformationComponent } from '../../components/further-information/further-information.component';
import { SupportingDocumentationComponent } from '../../components/supporting-documentation/supporting-documentation.component';
import { AddPlantEquipmentComponent } from '../../components/add-plant-equipment/add-plant-equipment.component';
import { SaftyResponsibilitiesComponent } from '../../components/safty-responsibilities/safty-responsibilities.component';
import { PersonalProtectiveEquipmentComponent } from '../../components/personal-protective-equipment/personal-protective-equipment.component';
import { MsProcedureContainerComponent } from '../../containers/ms-procedure-container/ms-procedure-container.component';
import { AddProcedureComponent } from '../../components/add-procedure/add-procedure.component';
import { AddMsProcedureComponent } from '../../components/add-ms-procedure/add-ms-procedure.component';
import { ProcedureQuickViewComponent } from '../../components/procedure-quick-view/procedure-quick-view.component';
import { UpdateMsProcedureComponent } from '../../components/update-ms-procedure/update-ms-procedure.component';
import { SafetyProceduresComponent } from '../../components/safety-procedures/safety-procedures.component';
import { SafetyResponsibilitiesAddUpdateComponent } from '../../components/safety-responsibilities-add-update/safety-responsibilities-add-update.component';
import { InformationFromComputerComponent } from '../../components/information-from-computer/information-from-computer.component';
import { By } from '@angular/platform-browser';
import { ManageListComponent } from './../../../../method-statements/components/manage-list/manage-list.component';
import { RiskAssessmentSharedModule } from './../../../../risk-assessment/risk-assessment-shared/risk-assessment-shared.module';
import { DocumentSharedModule } from './../../../../document/document-shared/document-shared.module';
import { PlantandequipmentsharedModule } from './../../../../method-statements/plantandequipment/plantandequipmentshared/plantandequipmentshared.module';
import { EmailSharedModule } from './../../../../email-shared/email-shared.module';
import { ManageMethodStatementsModule } from './../../manage-methodstatements.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PreviewComponent } from '../../components/preview/preview.component';
import { MsCopyComponent } from '../../../method-statement-copy/components/ms-copy/ms-copy.component';
import { DocumentDetailsService } from './../../../../document/document-details/services/document-details.service';
import { DocumentDetailsServiceStub } from './../../../../shared/testing/mocks/document-details-service-stub';
import { Http } from '@angular/http';
import { mockHttpProvider } from './../../../../shared/testing/mocks/http-stub';
import { ProcedureCode, MethodStatement } from './../../../../method-statements/models/method-statement';
import { LoadMethodStatementByIdCompleteAction } from '../../actions/manage-methodstatement.actions';
import { tick } from '@angular/core/testing';
import { MSProcedureMockData } from './../../../../shared/testing/mocks/data/msprocedure-data';
import { fakeAsync } from '@angular/core/testing';
import { SequenceofeventsComponent } from '../../../manage-methodstatements/components/sequenceofevents/sequenceofevents.component';
import { AeDatatableComponent } from './../../../../atlas-elements/ae-datatable/ae-datatable.component';
import { MockStoreProviderFactory } from './../../../../shared/testing/mocks/mock-store-provider-factory';
import { AtlasApiRequest } from './../../../../shared/models/atlas-api-response';
import { LoadProcedureGroupCompleteAction } from './../../../../shared/actions/lookup.actions';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { CommonTestHelper } from './../../../../shared/testing/helpers/common-test-helper';
import { AeNavActionsComponent } from './../../../../atlas-elements/ae-nav-actions/ae-nav-actions.component';
import { AeModalDialogComponent } from './../../../../atlas-elements/ae-modal-dialog/ae-modal-dialog.component';

describe('Method Statements Sequence of events / Stored Procedures list Component', () => {
  let component: MsProcedureContainerComponent;
  let fixture: ComponentFixture<MsProcedureContainerComponent>;
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
  let datagridElement: any;
  let columnDivs: any;

  let assertFun = function (columnDivs: DebugElement[], columnIndex: number, columnNameKey: string, sortKey: string) {
    let divHeader = columnDivs[columnIndex];
    let spanHeader: HTMLSpanElement = divHeader.query(By.css('span')).nativeElement;
    expect(spanHeader.innerHTML).toEqual(columnNameKey);
  }


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AtlasElementsModule,
        RiskAssessmentSharedModule,
        DocumentSharedModule,
        PlantandequipmentsharedModule,
        RouterModule.forChild(routes),
        LocalizationModule,
        AtlasSharedModule,
        EmailSharedModule,
        NoopAnimationsModule,
        StoreModule.provideStore(reducer)
      ],
      declarations: [
        MsCopyComponent,
        MethodstatementContainerComponent,
        GeneralComponent
        , SequenceofeventsComponent
        , PlantEquipmentComponent
        , SafetyPrecautionsComponent
        , FurtherInformationComponent
        , SupportingDocumentationComponent
        , PreviewComponent        
        , AddPlantEquipmentComponent
        , PersonalProtectiveEquipmentComponent
        , SaftyResponsibilitiesComponent
        , MsProcedureContainerComponent
        , AddMsProcedureComponent
        , AddProcedureComponent
        , UpdateMsProcedureComponent
        , ProcedureQuickViewComponent
        , InformationFromComputerComponent
        , SafetyProceduresComponent
        , SafetyResponsibilitiesAddUpdateComponent],
      providers: [
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
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsProcedureContainerComponent);
    component = fixture.componentInstance;
    component.dragRows = false;
    store = fixture.debugElement.injector.get(Store);

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

    msObject = JSON.parse(MSProcedureMockData);
  });

  describe('Component launch', () => {
    it('Sequence of events/Safety procedures list should be created without any errors', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Sequence of events/Safety procedures list data table with out data', () => {
    beforeEach(() => {
      let methodStatement = new MethodStatement();
      methodStatement.Id = msObject.Id;
      methodStatement.IsExample = msObject.IsExample;
      methodStatement.MSProcedures = [];
      component.methodStatement = methodStatement;
      fixture.detectChanges();

      datagridElement = fixture.debugElement.query(By.css('#msprocedurecontainer_AeDatatable_1_divBody_0'));
      columnDivs = datagridElement.queryAll(By.css('.table__heading'));
    });

    it('verify whether Sequence of events/Safety procedures datatable has three columns or not', () => {
      let columns = fixture.debugElement.nativeElement.querySelectorAll('.table__heading');
      expect(columns.length).toEqual(2);
    });

    it('Verify whether Procedures data table has columns with agreed column names.', () => {
      assertFun(columnDivs, 0, 'MANAGE_METHOD_STM.SEQUENCE_OF_EVENTS.PROC_NAME', '');
      expect(columnDivs[1].nativeElement.innerHTML).toBe('Actions');
    });

    it('verify whether Sequence of events/Safety procedures datatable is showing "There is no data to display", when there are no procedures to show', () => {
      let cells = fixture.debugElement.nativeElement.querySelectorAll('.no--data');
      expect(cells).not.toBeNull();
      expect(cells[0].innerText).toEqual('There is no data to display');
    });
  });

  describe('Load Sequence of events/Safety procedures data table with data', () => {
    beforeEach(() => {
      let methodStatement = new MethodStatement();
      methodStatement.Id = msObject.Id;
      methodStatement.IsExample = false;

      component.methodStatement = methodStatement;
      let msProcedreStub = MockStoreProviderFactory.getMSProceduresStub();
      methodStatement.MSProcedures = msProcedreStub;
      component.methodStatement = methodStatement;
    });

    it('verify whether Sequence of events datatable is displaying appropriate no. of records or not', (() => {
      component.procedureCode = 1;
      dispatchSpy.and.callThrough();
      let procedureGroupData = JSON.parse('[{"Id":"5188533a-e520-4282-92e2-4af25e3d0678","Name":"Sequence of Events","Code":1},{"Id":"d275f2a2-22b8-4e30-845d-af875db7c1a6","Name":"Safety Procedures","Code":2}]')
      store.dispatch(new LoadProcedureGroupCompleteAction(procedureGroupData));
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        let recordCount = fixture.debugElement.query(By.css('#msprocedurecontainer_AeDatatable_1_divBody_0'))
          .query(By.css('.table__row--group'))
          .queryAll(By.css('.table__row')).length;
        expect(recordCount).toBe(component.methodStatement.MSProcedures.filter(c => c.ProcedureGroupId == component.procedureGroupId).length);
      });
    }));

    it('verify whether safety procedures datatable is displaying appropriate no. of records or not', (() => {
      component.procedureCode = 2;
      dispatchSpy.and.callThrough();
      let procedureGroupData = JSON.parse('[{"Id":"5188533a-e520-4282-92e2-4af25e3d0678","Name":"Sequence of Events","Code":1},{"Id":"d275f2a2-22b8-4e30-845d-af875db7c1a6","Name":"Safety Procedures","Code":2}]')
      store.dispatch(new LoadProcedureGroupCompleteAction(procedureGroupData));
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        let recordCount = fixture.debugElement.query(By.css('#msprocedurecontainer_AeDatatable_1_divBody_0'))
          .query(By.css('.table__row--group'))
          .queryAll(By.css('.table__row')).length;
        expect(recordCount).toBe(component.methodStatement.MSProcedures.filter(c => c.ProcedureGroupId == component.procedureGroupId).length);
      });
    }));

    it('Verify whether seq. of events table has agreed action buttons "View, Update, Remove" or not', () => {
      component.procedureCode = 1;
      dispatchSpy.and.callThrough();
      let procedureGroupData = JSON.parse('[{"Id":"5188533a-e520-4282-92e2-4af25e3d0678","Name":"Sequence of Events","Code":1},{"Id":"d275f2a2-22b8-4e30-845d-af875db7c1a6","Name":"Safety Procedures","Code":2}]')
      store.dispatch(new LoadProcedureGroupCompleteAction(procedureGroupData));
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        let items: Array<AeDataTableAction> = component.actions.toArray();
        expect(items.length).toEqual(3);

        expect(CommonTestHelper.hasGivenButton(items, 'view')
          && CommonTestHelper.hasGivenButton(items, 'update')
          && CommonTestHelper.hasGivenButton(items, 'remove')
        ).toBeTruthy();
      });
    });

    it('Verify whether safety procedures table has agreed action buttons "View, Update, Remove" or not', () => {
      component.procedureCode = 2;
      dispatchSpy.and.callThrough();
      let procedureGroupData = JSON.parse('[{"Id":"5188533a-e520-4282-92e2-4af25e3d0678","Name":"Sequence of Events","Code":1},{"Id":"d275f2a2-22b8-4e30-845d-af875db7c1a6","Name":"Safety Procedures","Code":2}]')
      store.dispatch(new LoadProcedureGroupCompleteAction(procedureGroupData));
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        let items: Array<AeDataTableAction> = component.actions.toArray();
        expect(items.length).toEqual(3);

        expect(CommonTestHelper.hasGivenButton(items, 'view')
          && CommonTestHelper.hasGivenButton(items, 'update')
          && CommonTestHelper.hasGivenButton(items, 'remove')
        ).toBeTruthy();
      });
    });

    it('Verify in safety procedures table, user is able to click on "View" action or not', fakeAsync(() => {
      component.procedureCode = 2;
      dispatchSpy.and.callThrough();
      let procedureGroupData = JSON.parse('[{"Id":"5188533a-e520-4282-92e2-4af25e3d0678","Name":"Sequence of Events","Code":1},{"Id":"d275f2a2-22b8-4e30-845d-af875db7c1a6","Name":"Safety Procedures","Code":2}]')
      store.dispatch(new LoadProcedureGroupCompleteAction(procedureGroupData));
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        let msProcedres = component.methodStatement.MSProcedures.filter(c => c.ProcedureGroupId == component.procedureGroupId);
        let viewAction = CommonTestHelper.getGivenButton(component.actions.toArray(), 'view');
        viewAction.command.next(msProcedres[1]);
        tick(100);
        fixture.detectChanges();
        tick(100);
        expect(component.currentProcedure).not.toBe(null);
        expect(component.currentProcedure.Id).toBe(msProcedres[1].Id);
        expect(component.viewMSProcSlideoutStatus).toBeTruthy();
      });
    }));

    it('Verify in safety procedures table, user is able to click on "Update" action or not', fakeAsync(() => {
      component.procedureCode = 2;
      component.dragRows = false;
      dispatchSpy.and.callThrough();
      let procedureGroupData = JSON.parse('[{"Id":"5188533a-e520-4282-92e2-4af25e3d0678","Name":"Sequence of Events","Code":1},{"Id":"d275f2a2-22b8-4e30-845d-af875db7c1a6","Name":"Safety Procedures","Code":2}]')
      store.dispatch(new LoadProcedureGroupCompleteAction(procedureGroupData));
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        let msProcedres = component.methodStatement.MSProcedures.filter(c => c.ProcedureGroupId == component.procedureGroupId);
        let updateAction = CommonTestHelper.getGivenButton(component.actions.toArray(), 'update');
        updateAction.command.next(msProcedres[2]);
        tick(100);
        fixture.detectChanges();
        tick(100);
        expect(component.currentProcedure).not.toBe(null);
        expect(component.currentProcedure.Id).toBe(msProcedres[2].Id);
        expect(component.editMSProcSlideoutStatus).toBeTruthy();
      });
    }));

    it('Verify in safety procedures table, user is able to click on "Remove" action or not', fakeAsync(() => {
      component.procedureCode = 2;
      component.dragRows = false;
      dispatchSpy.and.callThrough();
      let procedureGroupData = JSON.parse('[{"Id":"5188533a-e520-4282-92e2-4af25e3d0678","Name":"Sequence of Events","Code":1},{"Id":"d275f2a2-22b8-4e30-845d-af875db7c1a6","Name":"Safety Procedures","Code":2}]')
      store.dispatch(new LoadProcedureGroupCompleteAction(procedureGroupData));
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        let msProcedres = component.methodStatement.MSProcedures.filter(c => c.ProcedureGroupId == component.procedureGroupId);
        let removeAction = CommonTestHelper.getGivenButton(component.actions.toArray(), 'remove');
        removeAction.command.next(msProcedres[0]);
        tick(100);
        fixture.detectChanges();
        tick(100);
        expect(component.currentProcedure).not.toBe(null);
        expect(component.currentProcedure.Id).toBe(msProcedres[0].Id);
        expect(component.showMSProcDeleteConfirmation).toBeTruthy();
      });
    }));

    it('Verify in safety procedures table, user is able to click on "remove" action or not', (() => {
      component.procedureCode = 2;
      component.dragRows = false;
      dispatchSpy.and.callThrough();
      let procedureGroupData = JSON.parse('[{"Id":"5188533a-e520-4282-92e2-4af25e3d0678","Name":"Sequence of Events","Code":1},{"Id":"d275f2a2-22b8-4e30-845d-af875db7c1a6","Name":"Safety Procedures","Code":2}]')
      store.dispatch(new LoadProcedureGroupCompleteAction(procedureGroupData));
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        let msProcedres = component.methodStatement.MSProcedures.filter(c => c.ProcedureGroupId == component.procedureGroupId);

        let navButtons = <AeNavActionsComponent<any>>fixture.debugElement.query(By.directive(AeNavActionsComponent)).componentInstance;
        let event = new MouseEvent('click');
        navButtons._onClick(event);

        fixture.detectChanges();
        let removeButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#Remove');
        removeButton.click();
        fixture.detectChanges();

        let confirmPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
        expect(confirmPopup).toBeTruthy();
      });
    }));

      it('Verify procedure remove popup has agreed title, message and buttons', (() => {
        component.procedureCode = 1;
        component.dragRows = false;
        dispatchSpy.and.callThrough();
        let procedureGroupData = JSON.parse('[{"Id":"5188533a-e520-4282-92e2-4af25e3d0678","Name":"Sequence of Events","Code":1},{"Id":"d275f2a2-22b8-4e30-845d-af875db7c1a6","Name":"Safety Procedures","Code":2}]')
        store.dispatch(new LoadProcedureGroupCompleteAction(procedureGroupData));
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          let msProcedres = component.methodStatement.MSProcedures.filter(c => c.ProcedureGroupId == component.procedureGroupId);

          let navButtons = <AeNavActionsComponent<any>>fixture.debugElement.query(By.directive(AeNavActionsComponent)).componentInstance;
          let event = new MouseEvent('click');
          navButtons._onClick(event);

          fixture.detectChanges();
          let removeButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#Remove');
          removeButton.click();
          fixture.detectChanges();

          let confirmPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
          expect(confirmPopup).toBeTruthy();

          let dialogElement = fixture.debugElement.query(By.directive(AeModalDialogComponent));
          let closeIcon = <HTMLElement>dialogElement.query(By.css('.button--close')).nativeElement;
          expect(closeIcon).toBeDefined();
          let title = <HTMLElement>dialogElement.query(By.css('.modal-dialog-header')).query(By.css('h3')).nativeElement;
          expect(title.innerText).toBe('MANAGE_METHOD_STM.SEQUENCE_OF_EVENTS.REMOVE_DIALOG.TITLE');
          let body = <HTMLElement>dialogElement.query(By.css('.modal-dialog-body')).query(By.css('p')).nativeElement;
          expect(body.innerText).toBe('MANAGE_METHOD_STM.SEQUENCE_OF_EVENTS.REMOVE_DIALOG.BODY_TEXT');
          let closeBtn = dialogElement.query(By.css('.modal-dialog-footer')).query(By.css('#msprocedurecontainer_AeButton_7_aeButton_1'));
          expect(closeBtn).toBeDefined();
          expect(closeBtn.query(By.css('span')).nativeElement.innerText).toBe('MANAGE_METHOD_STM.SEQUENCE_OF_EVENTS.REMOVE_DIALOG.NO_BTN_TEXT');
          let yesBtn = dialogElement.query(By.css('.modal-dialog-footer')).query(By.css('#msprocedurecontainer_AeButton_8_aeButton_1'));
          expect(yesBtn).toBeDefined();
          expect(yesBtn.query(By.css('span')).nativeElement.innerText).toBe('MANAGE_METHOD_STM.SEQUENCE_OF_EVENTS.REMOVE_DIALOG.YES_BTN_TEXT');
        });
      }));

      it('Verify controls/buttons present in procedure remove popup are actioning properly or not', (() => {
        component.procedureCode = 1;
        component.dragRows = false;
        dispatchSpy.and.callThrough();
        let procedureGroupData = JSON.parse('[{"Id":"5188533a-e520-4282-92e2-4af25e3d0678","Name":"Sequence of Events","Code":1},{"Id":"d275f2a2-22b8-4e30-845d-af875db7c1a6","Name":"Safety Procedures","Code":2}]')
        store.dispatch(new LoadProcedureGroupCompleteAction(procedureGroupData));
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          let msProcedres = component.methodStatement.MSProcedures.filter(c => c.ProcedureGroupId == component.procedureGroupId);

          let navButtons = <AeNavActionsComponent<any>>fixture.debugElement.query(By.directive(AeNavActionsComponent)).componentInstance;
          let event = new MouseEvent('click');
          navButtons._onClick(event);

          fixture.detectChanges();
          let removeButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#Remove');
          removeButton.click();
          fixture.detectChanges();

          let confirmPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
          expect(confirmPopup).toBeTruthy();

          let dialogElement = fixture.debugElement.query(By.directive(AeModalDialogComponent));
          let closeBtn = <HTMLElement>dialogElement.query(By.css('.modal-dialog-footer')).query(By.css('#msprocedurecontainer_AeButton_7_aeButton_1')).nativeElement;
          closeBtn.click();
          fixture.detectChanges();
          confirmPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
          expect(confirmPopup).not.toBeTruthy();
        });
      }));

      it('It should have page change and sort options', (() => {
        let listeners = fixture.debugElement.query(By.css('ae-datatable')).listeners;
        let pageChangeEvent = listeners.find(obj => obj.name.toLowerCase() == 'pagechanged');
        expect(pageChangeEvent).toBeDefined();
      }));
  });
});
