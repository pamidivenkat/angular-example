import { ClaimsHelperServiceStub } from '../../../shared/testing/mocks/claims-helper-service-mock';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DistributedDocumentsModeOfOperation } from '../../models/document';
import { MockStoreSharedDocuments } from '../../../shared/testing/mocks/mock-store-shared-documents';
import { processDistributedDocuments } from '../../common/document-extract-helper';
import { DatePipe } from '@angular/common';
import { RouteParamsMock } from '../../../shared/testing/mocks/route-params-mock';
import { RouteParams } from '../../../shared/services/route-params';
import { RouterMock } from '../../../shared/testing/mocks/router-stub';
import { ActivatedRouteStub } from '../../../shared/testing/mocks/activated-route-stub';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { TranslationServiceStub } from '../../../shared/testing/mocks/translation-service-stub';
import { LocaleServiceStub } from '../../../shared/testing/mocks/locale-service-stub';
import { BreadcrumbServiceStub } from '../../../shared/testing/mocks/breadcrumb-service-mock';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AtlasElementsModule } from '../../../atlas-elements/atlas-elements.module';
import { InjectorRef, LocaleDatePipe, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { ReactiveFormsModule } from '@angular/forms';
import { Store, StoreModule } from '@ngrx/store';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DocumentActionConfirmComponent } from './document-action-confirm.component';
import * as fromRoot from '../../../shared/reducers';
import { reducer } from '../../../shared/reducers/index';
import { DocumentSignatureViewComponent } from '../../../document/document-shared/components/document-signature-view/document-signature-view.component';

describe('Document Action Component -  Require read', () => {
    let component: DocumentActionConfirmComponent;
    let fixture: ComponentFixture<DocumentActionConfirmComponent>;
    let store: Store<fromRoot.State>;
    let downloadspy: jasmine.Spy;
    let status: any;
    let claimsgetEmpIdSpy: jasmine.Spy;
    var claimsHelperServiceStub: any;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule
                , LocalizationModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , BrowserAnimationsModule
            ],
            declarations: [
                DocumentActionConfirmComponent,
                DocumentSignatureViewComponent
            ],
            providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: Router, useClass: RouterMock }
                , LocaleDatePipe
                , { provide: RouteParams, useClass: RouteParamsMock }
                , DatePipe
            ]
        })
            .overrideComponent(DocumentActionConfirmComponent, { set: { host: { '(click)': 'dummy' } } })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(DocumentActionConfirmComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);
        claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
        downloadspy = spyOn(window, 'open');
        claimsgetEmpIdSpy = spyOn(claimsHelperServiceStub, 'getEmpId');
        let documentResp = processDistributedDocuments(MockStoreSharedDocuments.getCompanyDistributedDocs());
        component.ActionedDocument = documentResp.Entities[1];
        component.ModeOfOPeration = DistributedDocumentsModeOfOperation.Documents;
        fixture.detectChanges();
    })
    beforeEach(() => {
        component.onDialogDisplayStatusChange.subscribe(val => {
            status = val;
        });
        claimsgetEmpIdSpy.and.returnValue("55D1130C-6B4A-462A-A47F-D8DF2F6B8C73");
    });
    it('should be created', () => {
        expect(component).toBeTruthy();
    });
    it('should display title', () => {
        let headerElement: DebugElement = fixture.debugElement.query(By.css('.modal-dialog-header'));
        expect(headerElement).toBeDefined();
        let title = component.setActionConfirmTitle();
        let displayedTitle = headerElement.nativeElement.innerText.trim();
        expect(displayedTitle).toBeDefined();
    });
    it('should have checkbox saying "I have read and understood the document"', () => {
        let checkbox: DebugElement = fixture.debugElement.query(By.css('#chkReadActionConfirm_iChkBox'));
        expect(checkbox).toBeDefined();
        let messageElement = fixture.debugElement.query(By.css('.checkbox__copy'));
        expect(messageElement).toBeDefined();
        let message = messageElement.nativeElement.innerText;
        expect(message).toBeDefined();
        expect(message.trim()).toBe('Document_Read_Action_Acceptance');
    });
    it('should have buttons like view, discard,ok ', () => {
        let viewButton: DebugElement = fixture.debugElement.query(By.css('#confirmView_aeIcon_1'));
        let discardButton: DebugElement = fixture.debugElement.query(By.css('#confirmNo_aeButton_1'));
        let okButton: DebugElement = fixture.debugElement.query(By.css('#confirmYes_aeButton_1'));
        expect(viewButton).toBeDefined();
        expect(discardButton).toBeDefined();
        expect(okButton).toBeDefined();
    });
    it('clicking on view button should download document', () => {
        let viewButton: DebugElement = fixture.debugElement.query(By.css('#confirmView_aeIcon_1'));
        expect(viewButton).not.toBeUndefined();
        viewButton.nativeElement.click();
        fixture.detectChanges();
        let downloadUrl = '/filedownload?documentId=' + component.ActionedDocument.Id + '&isSystem=false&version=' + component.ActionedDocument.DocumentVersion;
        expect(downloadspy).toHaveBeenCalledWith(downloadUrl);
    });
    it('clicking on discard button should close the action document confirmation modal', () => {
        let discardButton: DebugElement = fixture.debugElement.query(By.css('#confirmNo_aeButton_1'));
        expect(discardButton).not.toBeUndefined();
        expect(status).toBeUndefined();
        discardButton.nativeElement.click();
        fixture.detectChanges();
        expect(status).toBeFalsy();
    });
    it('should show validation message when clicked on ok button without ticking checkbox', () => {
        let okButton: DebugElement = fixture.debugElement.query(By.css('#confirmYes_aeButton_1'));
        okButton.nativeElement.click();
        fixture.detectChanges();
        let validationMsgElements: DebugElement[] = fixture.debugElement.queryAll(By.css('.error-text'));
        expect(validationMsgElements).toBeDefined();
        expect(validationMsgElements[0]).toBeDefined();
        let displayedValidationMsg = validationMsgElements[0].nativeElement.innerText;
        expect(displayedValidationMsg).toBe(component.validationMessage);
    });
    it('should be able to submit when checkbox ticked and clicked on ok button', () => {
        component.actionedDocumentForm.get('readActionConfirm').setValue(true);
        fixture.detectChanges();
        let okButton: DebugElement = fixture.debugElement.query(By.css('#confirmYes_aeButton_1'));
        okButton.nativeElement.click();
        fixture.detectChanges();
        expect(status).toBeTruthy();
    });
});

describe('Document Action Component -  Require sign', () => {
    let component: DocumentActionConfirmComponent;
    let fixture: ComponentFixture<DocumentActionConfirmComponent>;
    let store: Store<fromRoot.State>;
    let downloadspy: jasmine.Spy;
    let status: any;
    let claimsgetEmpIdSpy: jasmine.Spy;
    var claimsHelperServiceStub: any;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule
                , LocalizationModule
                , AtlasElementsModule
                , StoreModule.provideStore(reducer)
                , BrowserAnimationsModule
            ],
            declarations: [
                DocumentActionConfirmComponent
            ],
            providers: [
                InjectorRef
                , { provide: BreadcrumbService, useClass: BreadcrumbServiceStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: ClaimsHelperService, useClass: ClaimsHelperServiceStub }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , { provide: Router, useClass: RouterMock }
                , LocaleDatePipe
                , { provide: RouteParams, useClass: RouteParamsMock }
                , DatePipe
            ]
        })
            .overrideComponent(DocumentActionConfirmComponent, { set: { host: { '(click)': 'dummy' } } })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(DocumentActionConfirmComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);
        claimsHelperServiceStub = fixture.debugElement.injector.get(ClaimsHelperService);
        let documentResp = processDistributedDocuments(MockStoreSharedDocuments.getCompanyDistributedDocs());
        downloadspy = spyOn(window, 'open');
        claimsgetEmpIdSpy = spyOn(claimsHelperServiceStub, 'getEmpId');
        component.ActionedDocument = documentResp.Entities[8];
        component.ModeOfOPeration = DistributedDocumentsModeOfOperation.Documents;
        fixture.detectChanges();
    })
    beforeEach(() => {
        component.onDialogDisplayStatusChange.subscribe(val => {
            status = val;
        });
        claimsgetEmpIdSpy.and.returnValue("55D1130C-6B4A-462A-A47F-D8DF2F6B8C73");
    });
    it('should be created', () => {
        expect(component).toBeTruthy();
    });
    it('should display title', () => {
        let headerElement: DebugElement = fixture.debugElement.query(By.css('.modal-dialog-header'));
        expect(headerElement).toBeDefined();
        let title = component.setActionConfirmTitle();
        let displayedTitle = headerElement.nativeElement.innerText.trim();
        expect(displayedTitle).toBeDefined();
    });
    it('should have fields like text box for signature, signature pad, check box', () => {
        let signaturePadElement: DebugElement = fixture.debugElement.query(By.css('signature-pad'));
        let clearSignatureElement: DebugElement = fixture.debugElement.query(By.css('clearSignature'));
        let confirmCheckboxElement: DebugElement = fixture.debugElement.query(By.css('#chkSignActionConfirm_iChkBox'));
        expect(signaturePadElement).toBeDefined();
        expect(clearSignatureElement).toBeDefined();
        expect(confirmCheckboxElement).toBeDefined();
    });
    it('should have buttons like view, discard,ok ', () => {
        let viewButton: DebugElement = fixture.debugElement.query(By.css('#confirmView_aeIcon_1'));
        let discardButton: DebugElement = fixture.debugElement.query(By.css('#confirmNo_aeButton_1'));
        let okButton: DebugElement = fixture.debugElement.query(By.css('#confirmYes_aeButton_1'));
        expect(viewButton).toBeDefined();
        expect(discardButton).toBeDefined();
        expect(okButton).toBeDefined();
    });
    it('clicking on view button should download document', () => {
        let viewButton: DebugElement = fixture.debugElement.query(By.css('#confirmView_aeIcon_1'));
        expect(viewButton).not.toBeUndefined();
        viewButton.nativeElement.click();
        fixture.detectChanges();
        let downloadUrl = '/filedownload?documentId=' + component.ActionedDocument.Id + '&isSystem=false&version=' + component.ActionedDocument.DocumentVersion;
        expect(downloadspy).toHaveBeenCalledWith(downloadUrl);
    });
    it('clicking on discard button should close the action document confirmation modal', () => {
        let discardButton: DebugElement = fixture.debugElement.query(By.css('#confirmNo_aeButton_1'));
        expect(discardButton).not.toBeUndefined();
        expect(status).toBeUndefined();
        discardButton.nativeElement.click();
        fixture.detectChanges();
        expect(status).toBeFalsy();
    });
    it('should show validation message when clicked on ok button without signature', () => {
        let okButton: DebugElement = fixture.debugElement.query(By.css('#confirmYes_aeButton_1'));
        okButton.nativeElement.click();
        fixture.detectChanges();
        let validationMsgElements: DebugElement[] = fixture.debugElement.queryAll(By.css('.error-text'));
        expect(validationMsgElements).toBeDefined();
        expect(validationMsgElements[1]).toBeDefined();
        let displayedValidationMsg = validationMsgElements[1].nativeElement.innerText;
        expect(displayedValidationMsg).toBe(component.validationMessage);
    });
    it('on giving signature on signature pad checkbox should be ticked', () => {
        let checkbox = fixture.debugElement.query(By.css('#chkSignActionConfirm_iChkBox'));
        expect(checkbox).toBeDefined();
        let initialValue = checkbox.nativeElement.value;
        expect(initialValue).toBe('');
        let canvas: HTMLCanvasElement = fixture.debugElement.query(By.css('canvas')).nativeElement;
        let context = canvas.getContext("2d");
        let data = "data:image/png;base64,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"
        component.actionedDocumentForm.get('employeeSignConfirm').setValue(data);
        component.onSigned({});
        fixture.detectChanges();
        fixture.debugElement.triggerEventHandler('click', {});
        let newValue = checkbox.nativeElement.value;
        expect(newValue).toBeTruthy();
    });
    it('should be able to clear signature by clicking "Clear Signature"', () => {
        component.actionedDocumentForm.get('employeeSignConfirm').setValue('test');
        fixture.detectChanges();
        fixture.debugElement.triggerEventHandler('click', {});
        let signature = component.actionedDocumentForm.get('employeeSignConfirm').value;
        expect(signature).toBe('test');
        let clearButton: DebugElement = fixture.debugElement.query(By.css('#clearSignature'));
        expect(clearButton).toBeDefined();
        clearButton.nativeElement.click();
        fixture.detectChanges();
        fixture.debugElement.triggerEventHandler('click', {});
        signature = component.actionedDocumentForm.get('employeeSignConfirm').value;
        expect(signature).toBe('');
    });
    it('should be able to submit with signature', () => {
        let data = "data:image/png;base64,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"
        component.actionedDocumentForm.get('employeeSignConfirm').setValue(data);
        component.onSigned({});
        fixture.detectChanges();
        fixture.debugElement.triggerEventHandler('click', {});
        let okButton: DebugElement = fixture.debugElement.query(By.css('#confirmYes_aeButton_1'));
        okButton.nativeElement.click();
        fixture.detectChanges();
        expect(status).toBeTruthy();
    });
});
