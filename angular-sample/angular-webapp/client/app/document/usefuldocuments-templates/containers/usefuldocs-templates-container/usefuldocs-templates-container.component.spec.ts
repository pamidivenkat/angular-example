import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';

import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers';
import { reducer } from '../../../../shared/reducers/index';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import { DocumentDetailsService } from '../../../document-details/services/document-details.service';
import {
    DocumentReviewDistributeComponenet,
} from '../../../document-shared/components/document-review-distribute/document-review-distribute.component';
import {
    UsefuldocsTemplatesListComponent,
} from '../../components/usefuldocs-templates-list/usefuldocs-templates-list.component';
import { UsefuldocsTemplatesContainerComponent } from './usefuldocs-templates-container.component';

describe('Useful documents and templates container', () => {
    let fixture: ComponentFixture<UsefuldocsTemplatesContainerComponent>;
    let component: UsefuldocsTemplatesContainerComponent;
    let restClientServiceMock;
    let claimsHelperService;
    let store: Store<fromRoot.State>;
    let dispatchSpy: jasmine.Spy;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                AtlasElementsModule
                , LocalizationModule
                , ReactiveFormsModule
                , StoreModule.provideStore(reducer)
                , NoopAnimationsModule
            ]
            , declarations: [
                UsefuldocsTemplatesContainerComponent
                , UsefuldocsTemplatesListComponent
                , DocumentReviewDistributeComponenet
            ]
            , providers: [
                BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , InjectorRef
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , DocumentDetailsService
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['']) }
                , { provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperService', ['']) }
                , MessengerService
            ]
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(UsefuldocsTemplatesContainerComponent);
        component = fixture.componentInstance;

        store = fixture.debugElement.injector.get(Store);

        fixture.detectChanges()
    });
    it('should be created', () => {

        dispatchSpy = spyOn(store, 'dispatch');
        expect(component).toBeTruthy();

        expect(dispatchSpy).toHaveBeenCalledTimes(0);

    });
});