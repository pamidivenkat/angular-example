import { AeModalDialogComponent } from '../../../../atlas-elements/ae-modal-dialog/ae-modal-dialog.component';
import { AeNavActionsComponent } from '../../../../atlas-elements/ae-nav-actions/ae-nav-actions.component';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';

import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { AtlasApiRequest } from '../../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../../shared/reducers';
import { reducer } from '../../../../shared/reducers/index';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { UserService } from '../../../../shared/services/user-services';
import { CommonTestHelper } from '../../../../shared/testing/helpers/common-test-helper';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbServiceStub } from '../../../../shared/testing/mocks/breadcrumb-service-mock';
import { ClaimsHelperServiceStub } from '../../../../shared/testing/mocks/claims-helper-service-mock';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { MockStoreProviderFactory } from '../../../../shared/testing/mocks/mock-store-provider-factory';
import { RestClientServiceStub } from '../../../../shared/testing/mocks/rest-client-service-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { MethodStatement } from '../../../models/method-statement';
import {
  AddMSResponsibilityAction,
  LoadMethodStatementByIdCompleteAction,
  LoadMSResponsibilitiesPagingSortingAction,
} from '../../actions/manage-methodstatement.actions';
import {
  SafetyResponsibilitiesAddUpdateComponent,
} from '../safety-responsibilities-add-update/safety-responsibilities-add-update.component';
import { SaftyResponsibilitiesComponent } from './safty-responsibilities.component';
import { EventEmitter } from '@angular/core';

describe('Safety responsibilities component unit test :', () => {
  let component: SaftyResponsibilitiesComponent;
  let fixture: ComponentFixture<SaftyResponsibilitiesComponent>;
  let store: Store<fromRoot.State>;

  let localeServiceStub: any;
  let translationServiceStub: any;
  let activatedRouteStub: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AtlasElementsModule
        , LocalizationModule
        , StoreModule.provideStore(reducer)
        , BrowserAnimationsModule
      ]
      , declarations: [
        SaftyResponsibilitiesComponent
        , SafetyResponsibilitiesAddUpdateComponent
      ]
      , providers: [
        InjectorRef
        , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
        , { provide: LocaleService, useClass: LocaleServiceStub }
        , { provide: TranslationService, useClass: TranslationServiceStub }
        , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
        , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
        , { provide: RestClientService, useClass: RestClientServiceStub }
        , UserService
        , FormBuilderService
      ]
    })
      .compileComponents();
  }));

  describe('Loading safety responsibility grid with out data', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(SaftyResponsibilitiesComponent);
      component = fixture.componentInstance;

      store = fixture.debugElement.injector.get(Store);
      let methodStatement = new MethodStatement();
      methodStatement.Id = '99a5d85a-f97d-4e12-9a6f-de5afbb63717';

      methodStatement.MSSafetyResponsibilities = [];
      component.methodStatement = methodStatement;

      store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));
      let actionApiRequest: AtlasApiRequest = new AtlasApiRequest(1, 10, '', null);
      store.dispatch(new LoadMSResponsibilitiesPagingSortingAction(actionApiRequest));

      fixture.detectChanges();
    });

    it('should be created', () => {
      expect(component).toBeTruthy();
    });

    it('add Safety Responsibilities button at the top of the Tab ', () => {
      expect(fixture.debugElement.nativeElement.getElementsByTagName("button")).not.toBeNull();
    })

    it('should have a table to show the data', () => {
      expect(fixture.debugElement.nativeElement.querySelector('#SaftyResponsibility_AeDatatable_1_divBody_0')).not.toBeNull();
    });

    it('there are three columns', () => {
      let columns = fixture.debugElement.nativeElement.querySelectorAll('.table__heading');
      expect(columns.length).toEqual(3);
    });

    //no--data
    it('grid defaults to blank until an item is added', () => {
      let cells = fixture.debugElement.nativeElement.querySelectorAll('.no--data');
      expect(cells).not.toBeNull();
      expect(cells[0].innerText).toEqual('There is no data to display');
    });

  });

  describe('Safety responsibilities to the Method Statement are displayed in the grid ', () => {

    beforeEach(() => {
      fixture = TestBed.createComponent(SaftyResponsibilitiesComponent);
      component = fixture.componentInstance;

      store = fixture.debugElement.injector.get(Store);
      let methodStatement = new MethodStatement();
      methodStatement.Id = '99a5d85a-f97d-4e12-9a6f-de5afbb63717';

      let responsibilitiesStub = MockStoreProviderFactory.getTestMethodStatementResponsibilities();
      methodStatement.MSSafetyResponsibilities = responsibilitiesStub;
      component.methodStatement = methodStatement;
      store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));
      let actionApiRequest: AtlasApiRequest = new AtlasApiRequest(1, 10, '', null);
      store.dispatch(new LoadMSResponsibilitiesPagingSortingAction(actionApiRequest));

      fixture.detectChanges();
    });

    it('should have two records', () => {
      let rows = fixture.debugElement.nativeElement.querySelectorAll('.table__row');
      expect(rows.length).toEqual(2);
    });

    it('should match the person names', () => {
      let cells = fixture.debugElement.nativeElement.querySelectorAll('.table__item-inner');
      let personName = component.getResponsiblePerson(component.methodStatement.MSSafetyResponsibilities[0])
      let otherPersonName = component.getResponsiblePerson(component.methodStatement.MSSafetyResponsibilities[1])

      expect(cells[0].innerText).toEqual(personName);
      expect(cells[3].innerText).toEqual(otherPersonName);
    });

    it('should match the responsibility names', () => {
      let cells = fixture.debugElement.nativeElement.querySelectorAll('.table__item-inner');
      let responsibilities = component.getResponsibilities(component.methodStatement.MSSafetyResponsibilities[0].Responsibilities, component.methodStatement.MSSafetyResponsibilities[0].OtherResponsibilityValue)
      let otherResponsibilities = component.getResponsibilities(component.methodStatement.MSSafetyResponsibilities[1].Responsibilities, component.methodStatement.MSSafetyResponsibilities[1].OtherResponsibilityValue)

      expect(cells[1].innerText).toEqual(responsibilities);
      expect(cells[4].innerText).toEqual(otherResponsibilities);
    });

    it('should have two action icons', () => {
      let items: Array<AeDataTableAction> = component.actions.toArray();
      expect(items.length).toEqual(2);

      expect(CommonTestHelper.hasGivenButton(items, 'update')
        && CommonTestHelper.hasGivenButton(items, 'remove')
      ).toBeTruthy();
    });

  });

  describe('Adding new responsibility to method statement', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(SaftyResponsibilitiesComponent);
      component = fixture.componentInstance;

      store = fixture.debugElement.injector.get(Store);
      let methodStatement = new MethodStatement();
      methodStatement.Id = '99a5d85a-f97d-4e12-9a6f-de5afbb63717';

      let responsibilitiesStub = MockStoreProviderFactory.getTestMethodStatementResponsibilities();
      methodStatement.MSSafetyResponsibilities = responsibilitiesStub;
      component.methodStatement = methodStatement;
      store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));
      let actionApiRequest: AtlasApiRequest = new AtlasApiRequest(1, 10, '', null);
      store.dispatch(new LoadMSResponsibilitiesPagingSortingAction(actionApiRequest));

      fixture.detectChanges();
      spyOn(component, 'openMSResponsibilitiesAddUpdateForm').and.callThrough();
      spyOn(component, 'onMSREspAdd').and.callThrough();

      let addButton = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('#SaftyResponsibility_AeButton_1_aeButton_1');
      addButton.click();
    })

    it('should have a clickable add button', async(() => {
      fixture.whenStable().then(() => {
        expect(component.openMSResponsibilitiesAddUpdateForm).toHaveBeenCalled();
      });
    }));

    it('a slide-out - add safety responsibility - opens ', () => {
      fixture.whenStable().then(() => {
        expect(component.showMSResponsibilitiesAddUpdateForm).toBeTruthy();
        fixture.detectChanges();
        expect(fixture.debugElement.nativeElement.querySelector('.safety-responsibilities-add-update')).not.toBeNull();
      });
    });

    it('should have an update form in the slide out', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(fixture.debugElement.nativeElement.querySelector('#responsibilitiesForm')).not.toBeNull();
      });
    });

    it('should call the add method which has api request', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        let childComponent = <SafetyResponsibilitiesAddUpdateComponent>fixture.debugElement.query(By.directive(SafetyResponsibilitiesAddUpdateComponent)).componentInstance;
        let data = MockStoreProviderFactory.getSafetyRespAssignedMock();
        childComponent._onAdd.emit(data);
        fixture.detectChanges();
        expect(component.onMSREspAdd).toHaveBeenCalled();
      });
    });

  });

  describe('Action buttons events', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(SaftyResponsibilitiesComponent);
      component = fixture.componentInstance;

      store = fixture.debugElement.injector.get(Store);
      let methodStatement = new MethodStatement();
      methodStatement.Id = '99a5d85a-f97d-4e12-9a6f-de5afbb63717';

      let responsibilitiesStub = MockStoreProviderFactory.getTestMethodStatementResponsibilities();
      methodStatement.MSSafetyResponsibilities = responsibilitiesStub;
      component.methodStatement = methodStatement;
      store.dispatch(new LoadMethodStatementByIdCompleteAction(methodStatement));
      let actionApiRequest: AtlasApiRequest = new AtlasApiRequest(1, 10, '', null);
      store.dispatch(new LoadMSResponsibilitiesPagingSortingAction(actionApiRequest));

      fixture.detectChanges();

      let navButtons = <AeNavActionsComponent<any>>fixture.debugElement.query(By.directive(AeNavActionsComponent)).componentInstance;
      let event = new MouseEvent('click');
      navButtons._onClick(event);
    });

    it('should launch popup for remove action', () => {
      fixture.detectChanges();
      let removeButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#Remove');
      removeButton.click();
      fixture.detectChanges();

      let confirmPopup = fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
      expect(confirmPopup).toBeTruthy();
    });

    it('should close the model popup on cancel', () => {
      fixture.detectChanges();
      let removeButton = <HTMLAnchorElement>fixture.debugElement.nativeElement.querySelector('#Remove');
      removeButton.click();
      fixture.detectChanges();
      let confirmPopup = <AeModalDialogComponent>fixture.debugElement.query(By.directive(AeModalDialogComponent)).componentInstance;
      confirmPopup.cancelEvent();
      expect(confirmPopup.isVisible).toBeTruthy();
      fixture.detectChanges();
    });

  });

});
