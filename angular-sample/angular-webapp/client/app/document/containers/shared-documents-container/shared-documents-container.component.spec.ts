import { LocationStrategy } from '@angular/common';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule, RouterOutletMap, UrlSegment } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';

import { AeNotificationComponent } from '../../../atlas-elements/ae-notification/ae-notification.component';
import { AeTabStripComponent } from '../../../atlas-elements/ae-tabstrip/ae-tabstrip.component';
import { AtlasElementsModule } from '../../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { HomeModule } from '../../../home/home.module';
import { routes } from '../../../home/home.routes';
import * as fromRoot from '../../../shared/reducers';
import { reducer } from '../../../shared/reducers/index';
import { MessengerService } from '../../../shared/services/messenger.service';
import { ActivatedRouteStub } from '../../../shared/testing/mocks/activated-route-stub';
import { BreadcrumbServiceStub } from '../../../shared/testing/mocks/breadcrumb-service-mock';
import { LocaleServiceStub } from '../../../shared/testing/mocks/locale-service-stub';
import { MockStoreSharedDocuments } from '../../../shared/testing/mocks/mock-store-shared-documents';
import { RouterOutletMapStub } from '../../../shared/testing/mocks/router-outlet-stub';
import { RouterMock } from '../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../shared/testing/mocks/translation-service-stub';
import {
    LoadCompanyDocumentsToReviewComplete,
    LoadCompanyUsefulDocumentsToReviewComplete,
} from '../../actions/shared-documents.actions';
import { processDistributedDocuments, processDistributedSharedDocuments } from '../../common/document-extract-helper';
import { SharedDocumentsContainerComponent } from './shared-documents-container.component';
import { DocumentSignatureViewComponent } from '../../document-shared/components/document-signature-view/document-signature-view.component';

describe('Shared document container', () => {
    let component: SharedDocumentsContainerComponent;
    let fixture: ComponentFixture<SharedDocumentsContainerComponent>;
    let messengerServiceMock;
    let locationStrategy;
    let store: Store<fromRoot.State>;
    let activatedRouteStub;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                AtlasElementsModule
                , LocalizationModule
                , RouterModule.forChild(routes)
                , HomeModule
                , StoreModule.provideStore(reducer)
            ]
            , declarations: [
                SharedDocumentsContainerComponent,
                DocumentSignatureViewComponent
            ]
            , providers: [
                { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: Router, useClass: RouterMock }
                , InjectorRef
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: RouterOutletMap, useClass: RouterOutletMapStub }
                , { provide: LocationStrategy, useValue: jasmine.createSpyObj('locationStrategyMock', ['prepareExternalUrl']) }
                , { provide: MessengerService, useValue: jasmine.createSpyObj('messengerServiceMock', ['']) }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SharedDocumentsContainerComponent)
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);

        fixture.detectChanges()
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should have a notification message', () => {
        let notification = fixture.debugElement.query(By.directive(AeNotificationComponent));
        expect(notification).toBeTruthy();
        expect(notification.nativeElement.innerText.trim()).toEqual('SHARED_DOCUMENT_LANDING_MESSAGE');
    });



});