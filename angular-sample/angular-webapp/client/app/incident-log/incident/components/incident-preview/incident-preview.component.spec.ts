import { DatePipe } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Http } from '@angular/http';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { InjectorRef, LocaleDatePipe, LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeNotificationComponent } from '../../../../atlas-elements/ae-notification/ae-notification.component';
import { AtlasElementsModule } from '../../../../atlas-elements/atlas-elements.module';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { IncidentTypeLoadCompleteAction } from '../../../../shared/actions/lookup.actions';
import { RestClientService } from '../../../../shared/data/rest-client.service';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers';
import { reducer } from '../../../../shared/reducers/index';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { RouteParams } from '../../../../shared/services/route-params';
import { ActivatedRouteStub } from '../../../../shared/testing/mocks/activated-route-stub';
import { HttpStub } from '../../../../shared/testing/mocks/http-stub';
import { LocaleServiceStub } from '../../../../shared/testing/mocks/locale-service-stub';
import { MockStoreProviderIncident } from '../../../../shared/testing/mocks/mock-store-provider-incident';
import { RouteParamsMock } from '../../../../shared/testing/mocks/route-params-mock';
import { RouterMock } from '../../../../shared/testing/mocks/router-stub';
import { TranslationServiceStub } from '../../../../shared/testing/mocks/translation-service-stub';
import {
    IncidentDetailsGetCompleteAction,
    IncidentLoadApplicableSectionsCompleteAction,
} from '../../actions/incident-formal-investigation.actions';
import { extractIncidentPreviewData } from '../../common/extract-helpers';
import { InvSection } from '../../models/incident-inv-section';
import { IncidentPreviewVM } from '../../models/incident-preview.model';
import { IncidentKeyFieldsValidationService } from '../../services/incident-key-fields-validation.service';
import { IncidentLogService } from '../../services/incident-log.service';
import { IncidentPreviewService } from '../../services/incident-preview.service';
import { IncidentPreviewComponent } from './incident-preview.component';

var sectionAssert = function (sections, index: number, titleText: string) {
    if (index === 0) {
        let title = sections[index].query(By.css('h3'));
        expect(title).toBeNull();
    } else {
        let title = sections[index].query(By.css('h3'));
        expect(title.nativeElement.innerText.trim()).toEqual(titleText);
    }
}

var fieldsAssert = function (fields, labels: string[], values: any[]) {
    expect(fields.length).toEqual(labels.length);
    fields.map((field, index) => {
        expect(field.children[0].nativeElement.innerText.trim()).toEqual(labels[index].trim());
        let value = field.children[1].nativeElement.innerText;
        if (!isNullOrUndefined(values[index])) {
            let match = /\r|\n/.exec(value);
            if (!isNullOrUndefined(match)) {
                let textParts = value.split('\n');
                expect(textParts.join(' ').trim().toLowerCase()).toEqual(values[index].trim().toLowerCase());
            } else {
                expect(value.trim().toLowerCase()).toEqual(values[index].trim().toLowerCase());
            }
        }
    });
}

var getLabels = function (invSections: InvSection[]) {
    let labels: string[] = [];
    invSections.map((section, index) => {
        section.InvQuestions.map((question, qIndex) => {
            labels.push(question.Question);
        })
    });
    return labels;
}

var getValues = function (component) {
    let values: string[] = [];
    component.investigationSections.map((section, index) => {
        section.InvQuestions.map((question, qIndex) => {
            let answer = component.getAnswer(question);
            values.push(answer);
        })
    });
    return values;
}

describe('Incident preview component', () => {
    let fixture: ComponentFixture<IncidentPreviewComponent>;
    let component: IncidentPreviewComponent;
    let restClientServiceMock;
    let incidentPreviewServiceMock;
    let store: Store<fromRoot.State>;
    let complete: Subject<boolean>;
    let incidentDetails: IncidentPreviewVM;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                LocalizationModule
                , AtlasElementsModule
                , ReactiveFormsModule
                , StoreModule.provideStore(reducer)
            ]
            , declarations: [
                IncidentPreviewComponent
            ]
            , providers: [
                InjectorRef
                , BreadcrumbService
                , { provide: Router, useClass: RouterMock }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , {
                    provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceMock', [
                        'canApproveIncident'
                        , 'canManageIncidents'
                    ])
                }
                , { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                , MessengerService
                , { provide: IncidentPreviewService, useValue: jasmine.createSpyObj('incidentPreviewServiceMock', ['getIncidentPreviewDetails']) }
                , { provide: RestClientService, useValue: jasmine.createSpyObj('restClientServiceMock', ['get']) }
                , { provide: Http, useClass: HttpStub }
                , DatePipe
                , { provide: RouteParams, useClass: RouteParamsMock }
                , IncidentLogService
                , IncidentKeyFieldsValidationService
                , LocaleDatePipe
            ]
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(IncidentPreviewComponent);
        component = fixture.componentInstance;
        const complete = new Subject<boolean>();
        complete.next(false);
        component.onComplete = complete;

        store = fixture.debugElement.injector.get(Store);
        incidentPreviewServiceMock = TestBed.get(IncidentPreviewService);

        incidentDetails = extractIncidentPreviewData(MockStoreProviderIncident.getIncidentPreviewDetailsStub());
        incidentPreviewServiceMock.getIncidentPreviewDetails.and.returnValue(Observable.of(incidentDetails));
        store.dispatch(new IncidentTypeLoadCompleteAction(MockStoreProviderIncident.getIncidentTypeStub()));
        store.dispatch(new IncidentDetailsGetCompleteAction(MockStoreProviderIncident.getIncidentStub()));

        fixture.detectChanges();
    });

    it('should be loaded with out any buttons with all sections and signature', () => {
        expect(component).toBeTruthy();

        let notification = fixture.debugElement.query(By.directive(AeNotificationComponent));
        expect(notification).toBeTruthy();
        expect(notification.nativeElement.innerText.trim()).toEqual('INCIDENT_LOG.INCIDENT_LOG_PREVIEW_INFO');

        let buttons = fixture.debugElement.queryAll(By.css('.button-bar__item'));
        expect(buttons.length).toEqual(0);

        let sections = fixture.debugElement.queryAll(By.css('section'));
        expect(sections.length).toEqual(5);

        sectionAssert(sections, 0, '');
        sectionAssert(sections, 1, 'PREVIEW.Incident_Record');
        sectionAssert(sections, 2, 'PREVIEW.ABOUT_THE_AFFECTED_PARTY');
        sectionAssert(sections, 3, 'PREVIEW.PERSON_REPORTING');
        sectionAssert(sections, 4, 'PREVIEW.ABOUT_THE_INCIDENT');

        let signature = fixture.debugElement.query(By.css('#preview_signature'))
        expect(signature).toBeTruthy();
        expect(signature.children.length).toEqual(2);
    });

    describe('With approve or manage permissions', () => {
        let claimsHelperServiceMock;
        beforeEach(() => {
            claimsHelperServiceMock = TestBed.get(ClaimsHelperService);
            claimsHelperServiceMock.canApproveIncident.and.returnValue(true);

            fixture = TestBed.createComponent(IncidentPreviewComponent);
            component = fixture.componentInstance;

            const complete = new Subject<boolean>();
            complete.next(false);
            component.onComplete = complete;

            fixture.detectChanges();
        });

        it('should have three buttons for approve, save and export', () => {
            let buttons = fixture.debugElement.queryAll(By.css('.button-bar__item'));
            expect(buttons.length).toEqual(3);

            expect(buttons[0].nativeElement.innerText.trim()).toEqual('PREVIEW.APPROVE');
            expect(buttons[1].nativeElement.innerText.trim()).toEqual('PREVIEW.SAVE_INCIDENT_TO_ATLAS');
            expect(buttons[2].nativeElement.innerText.trim()).toEqual('PREVIEW.EXPORT_FULL_REVIEW');

        });
    });

    describe('Second section', () => {
        it('should have incident record details', () => {
            let sections = fixture.debugElement.queryAll(By.css('section'));
            let fields = sections[1].queryAll(By.css('.information-grid__item'));
            let labels = ['PREVIEW.Record_No', 'PREVIEW.Injury_Type', 'PREVIEW.Date'];
            let values = [incidentDetails.ReferenceNumber.trim(), incidentDetails.InjuryTypesText.trim(), incidentDetails.PreviewDate.toLocaleDateString('en-GB')];
            fieldsAssert(fields, labels, values);
        });
    });

    describe('Fourth section', () => {
        it('should have reporting person details', () => {
            let sections = fixture.debugElement.queryAll(By.css('section'));
            let fields = sections[3].queryAll(By.css('.information-grid__item'));
            let labels = [
                'PREVIEW.INCIDENT_REPORTED_BY'
                , 'PREVIEW.WORK_ADDRESS'
                , 'PREVIEW.TOWN_CITY'
                , 'COUNTY'
                , 'POSTCODE'
            ];
            let values = [
                incidentDetails.IncidentReportedByUserFullName
                , (incidentDetails.IncidentReportedByAddressLine1 + ' ' + incidentDetails.IncidentReportedByAddressLine2).trim()
                , incidentDetails.IncidentReportedByTown
                , incidentDetails.IncidentReportedByCountyName
                , incidentDetails.IncidentReportedByPostcode
            ];
            fieldsAssert(fields, labels, values);
        });
    });

    describe('Fifth section', () => {
        it('should have about the incident details for injury', () => {
            let sections = fixture.debugElement.queryAll(By.css('section'));
            let fields = sections[4].queryAll(By.css('.information-grid__item'));
            let labels = [
                'PREVIEW.INJURY_TYPE'
                , 'PREVIEW.INJURED_PARTS_OF_BODY'
                , 'PREVIEW.HOW_DID_THE_INCIDENT_HAPPEN'
                , 'PREVIEW.DESCRIBE_ANY_INJURIES_SUSTAINED'
                , 'PREVIEW.WHEN_DID_THE_INCIDENT_HAPPEN'
                , 'PREVIEW.WHEN_WAS_THE_INCIDENT_REPORTED'
                , 'PREVIEW.WHERE_DID_THE_INCIDENT_HAPPEN'
                , 'PREVIEW.TOWN'
                , 'COUNTY'
                , 'POSTCODE'
                , 'PREVIEW.WHERE_ON_THE_PREMISES_DID_THE_INCIDENT_HAPPEN'
                , 'PREVIEW.WAS_THE_INCIDENT_COVERED_BY_CCTV'
                , 'PREVIEW.WHAT_WAS_THE_CONDITION_OF_THE_AREA'
                , 'PREVIEW.DID_THE_INJURED_AFFECTED_PERSON_REQUIRE_MEDICAL_ASSISTANCE'
                , 'PREVIEW.WERE_THERE_ANY_WITNESSES'
                , 'PREVIEW.WHAT_ACTIONS_WERE_TAKEN_HAVE_BEEN_TAKEN_IN_RELATION_TO_THIS_INCIDENT'
                , 'PREVIEW.WAS_THE_RELEVANT_RISK_ASSESSMENT_UPDATED'
            ];
            let values = [
                incidentDetails.InjuryTypesText
                , incidentDetails.InjuredPartsText
                , incidentDetails.AboutIncidentDetails.HowDidHappen
                , incidentDetails.AboutIncidentDetails.InjuryDescription
                , (<Date>incidentDetails.AboutIncidentDetails.WhenHappened).toLocaleDateString('en-GB') + ' ' + (<Date>incidentDetails.AboutIncidentDetails.WhenHappened).toLocaleTimeString('en-GB', { hour12: true })
                , (new Date(incidentDetails.AboutIncidentDetails.WhenReported)).toLocaleDateString('en-GB') + ' ' + (new Date(incidentDetails.AboutIncidentDetails.WhenReported)).toLocaleTimeString('en-GB', { hour12: true })
                , incidentDetails.AboutIncidentSiteName + ' ' + incidentDetails.AboutIncidentDetails.AddressLine1 + ' ' + incidentDetails.AboutIncidentDetails.AddressLine2
                , incidentDetails.AboutIncidentDetails.Town
                , incidentDetails.AboutIncidentDetails.County ? incidentDetails.AboutIncidentDetails.County.Name : ''
                , incidentDetails.AboutIncidentDetails.Postcode
                , incidentDetails.AboutIncidentDetails.Premises
                , 'No'
                , incidentDetails.AboutIncidentDetails.ConditionOfArea
                , incidentDetails.AboutIncidentDetails.IsMedicalAssistanceRequired
                , 'No'
                , incidentDetails.AboutIncidentDetails.ActionsTaken
                , 'No'
            ];
            fieldsAssert(fields, labels, values);
        });
    });

    describe('Third section', () => {
        it('should have affected party details', () => {
            let sections = fixture.debugElement.queryAll(By.css('section'));
            let fields = sections[2].queryAll(By.css('.information-grid__item'));
            let labels = [
                'PREVIEW.INJURED_PARTY'
                , 'NAME'
                , 'PREVIEW.JOB_ROLE'
                , 'PREVIEW.DATE_OF_BIRTH'
                , 'PREVIEW.HOME_ADDRESS'
                , 'PREVIEW.TOWN'
                , 'COUNTY'
                , 'POSTCODE'
                , 'TELEPHONE_NUMBER'
                , 'PREVIEW.GENDER'
            ];
            let values = [
                incidentDetails.InjuredPersonInjuredPartyName
                , incidentDetails.InjuredPersonName
                , incidentDetails.InjuredPersonOccupation
                , incidentDetails.InjuredPersonDateOfBirth
                , incidentDetails.InjuredPersonAddressLine1
                , incidentDetails.InjuredPersonTown
                , incidentDetails.InjuredPersonCounty
                , incidentDetails.InjuredPersonPostcode
                , incidentDetails.InjuredPersonMobilePhone
                , incidentDetails.InjuredPersonGenderText
            ];
            fieldsAssert(fields, labels, values);
        });
    });

    describe('When Expected mother selected with employee type', () => {

        beforeEach(() => {
            fixture = TestBed.createComponent(IncidentPreviewComponent);
            component = fixture.componentInstance;
            const complete = new Subject<boolean>();
            complete.next(false);
            component.onComplete = complete;

            store = fixture.debugElement.injector.get(Store);
            incidentPreviewServiceMock = TestBed.get(IncidentPreviewService);

            incidentDetails = extractIncidentPreviewData(MockStoreProviderIncident.getIncidentPreviewDetailsStub('expected mother'));
            incidentPreviewServiceMock.getIncidentPreviewDetails.and.returnValue(Observable.of(incidentDetails));
            store.dispatch(new IncidentTypeLoadCompleteAction(MockStoreProviderIncident.getIncidentTypeStub()));
            store.dispatch(new IncidentDetailsGetCompleteAction(MockStoreProviderIncident.getIncidentStub()));

            fixture.detectChanges();
        });

        it('should have affected party details with extra fields', () => {
            let sections = fixture.debugElement.queryAll(By.css('section'));
            let fields = sections[2].queryAll(By.css('.information-grid__item'));
            let labels = [
                'PREVIEW.INJURED_PARTY'
                , 'NAME'
                , 'PREVIEW.JOB_ROLE'
                , 'PREVIEW.EMPLOYEE_START_DATE'
                , 'PREVIEW.DATE_OF_BIRTH'
                , 'PREVIEW.HOME_ADDRESS'
                , 'PREVIEW.TOWN'
                , 'COUNTY'
                , 'POSTCODE'
                , 'TELEPHONE_NUMBER'
                , 'PREVIEW.GENDER'
                , 'PREVIEW.NEW_OR_EXPECTANT_MOTHER'
            ];
            let values = [
                incidentDetails.InjuredPersonInjuredPartyName
                , incidentDetails.InjuredPersonName
                , incidentDetails.InjuredPersonOccupation
                , (new Date(incidentDetails.InjuredPersonStartDate)).toLocaleDateString('en-GB')
                , (new Date(incidentDetails.InjuredPersonDateOfBirth)).toLocaleDateString('en-GB')
                , incidentDetails.InjuredPersonAddressLine1 + ' ' + incidentDetails.InjuredPersonAddressLine2
                , incidentDetails.InjuredPersonTown
                , incidentDetails.InjuredPersonCounty
                , incidentDetails.InjuredPersonPostcode
                , incidentDetails.InjuredPersonMobilePhone
                , incidentDetails.InjuredPersonGenderText
                , incidentDetails.NewOrExpectantMother ? 'Yes' : 'No'
            ];
            fieldsAssert(fields, labels, values);
        });
    });

    describe('Type of behavioral', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IncidentPreviewComponent);
            component = fixture.componentInstance;
            const complete = new Subject<boolean>();
            complete.next(false);
            component.onComplete = complete;

            store = fixture.debugElement.injector.get(Store);
            incidentPreviewServiceMock = TestBed.get(IncidentPreviewService);

            incidentDetails = extractIncidentPreviewData(MockStoreProviderIncident.getIncidentPreviewBehaviourStub());
            incidentPreviewServiceMock.getIncidentPreviewDetails.and.returnValue(Observable.of(incidentDetails));
            store.dispatch(new IncidentTypeLoadCompleteAction(MockStoreProviderIncident.getIncidentTypeStub()));
            store.dispatch(new IncidentDetailsGetCompleteAction(MockStoreProviderIncident.getIncidentStub()));

            fixture.detectChanges();
        });

        it('should have about the incident details for Behavioral', () => {
            let sections = fixture.debugElement.queryAll(By.css('section'));
            let fields = sections[4].queryAll(By.css('.information-grid__item'));
            let witnessField = fields.filter((field, index) => { return index == 22 })[0];
            fields = fields.filter((field, index) => { return index != 22 });
            let labels = [
                'PREVIEW.INJURY_TYPE'
                , 'PREVIEW.INJURED_PARTS_OF_BODY'
                , 'PREVIEW.HOW_DID_THE_INCIDENT_HAPPEN'
                , 'PREVIEW.WHAT_WERE_THE_EVENTS_LEADING_UP_TO_THE_INCIDENT'
                , 'PREVIEW.WERE_ANY_DRUGS_FOUND'
                , 'PREVIEW.WHAT_DRUGS_WERE_FOUND'
                , 'PREVIEW.DESCRIBE_ANY_PROPERTY_DAMAGE'
                , 'PREVIEW.DID_SOMEONE_ASSIST_THE_INJURED_AFFECTED_PERSON'
                , 'PREVIEW.WHO_ASSISTED_THE_INJURED_AFFECTED_PERSON'
                , 'PREVIEW.DESCRIBE_ANY_INJURIES_SUSTAINED'
                , 'PREVIEW.WHEN_DID_THE_INCIDENT_HAPPEN'
                , 'PREVIEW.WHEN_WAS_THE_INCIDENT_REPORTED'
                , 'PREVIEW.WHERE_DID_THE_INCIDENT_HAPPEN'
                , 'PREVIEW.TOWN'
                , 'COUNTY'
                , 'POSTCODE'
                , 'PREVIEW.WHERE_ON_THE_PREMISES_DID_THE_INCIDENT_HAPPEN'
                , 'PREVIEW.WAS_THE_INCIDENT_COVERED_BY_CCTV'
                , 'PREVIEW.WHAT_WAS_THE_CONDITION_OF_THE_AREA'
                , 'PREVIEW.WERE_THE_POLICE_CALLED'
                , 'PREVIEW.CRIME_NUMBER'
                , 'PREVIEW.WERE_THERE_ANY_WITNESSES'
                , 'PREVIEW.WHAT_ACTIONS_WERE_TAKEN_HAVE_BEEN_TAKEN_IN_RELATION_TO_THIS_INCIDENT'
                , 'PREVIEW.WAS_THE_RELEVANT_RISK_ASSESSMENT_UPDATED'
                , 'PREVIEW.UPDATE_DATE'
            ];
            let values = [
                incidentDetails.InjuryTypesText
                , incidentDetails.InjuredPartsText
                , incidentDetails.AboutIncidentDetails.HowDidHappen
                , incidentDetails.AboutIncidentDetails.IncidentEvents
                , 'Yes'
                , incidentDetails.AboutIncidentDetails.DetailsOfDrugsFound
                , incidentDetails.AboutIncidentDetails.PropertyDamaged
                , 'Yes'
                , incidentDetails.AboutIncidentDetails.AssistedDetails
                , incidentDetails.AboutIncidentDetails.InjuryDescription
                , (new Date(incidentDetails.AboutIncidentDetails.WhenHappened)).toLocaleDateString('en-GB') + ' ' + (new Date(incidentDetails.AboutIncidentDetails.WhenHappened)).toLocaleTimeString('en-GB', { hour12: true })
                , (new Date(incidentDetails.AboutIncidentDetails.WhenReported)).toLocaleDateString('en-GB') + ' ' + (new Date(incidentDetails.AboutIncidentDetails.WhenReported)).toLocaleTimeString('en-GB', { hour12: true })
                , incidentDetails.AboutIncidentSiteName + ' ' + incidentDetails.AboutIncidentDetails.AddressLine1 + ' ' + incidentDetails.AboutIncidentDetails.AddressLine2
                , incidentDetails.AboutIncidentDetails.Town
                , incidentDetails.AboutIncidentDetails.County ? incidentDetails.AboutIncidentDetails.County.Name : ''
                , incidentDetails.AboutIncidentDetails.Postcode
                , incidentDetails.AboutIncidentDetails.Premises
                , 'Yes'
                , incidentDetails.AboutIncidentDetails.ConditionOfArea
                , 'Yes'
                , incidentDetails.AboutIncidentDetails.CrimeNumber
                , 'Yes'
                , incidentDetails.AboutIncidentDetails.ActionsTaken
                , 'Yes'
                , (new Date(incidentDetails.AboutIncidentDetails.UpdatedDate)).toLocaleDateString('en-GB')
            ];
            fieldsAssert(fields, labels, values);

            let witnesses = witnessField.queryAll(By.css('.witness-grid-collection'));
            expect(witnesses.length).toEqual(1);

            witnesses.map((witness, index) => {
                let legend = witness.query(By.css('legend'));
                expect(legend.nativeElement.innerText).toEqual('Witness ' + (index + 1));

                let witnessField = witness.query(By.css('.witness-grid__name'));
                expect(witnessField.children[0].nativeElement.innerText.trim()).toEqual('PREVIEW.FULL_NAME');
                expect(witnessField.children[1].nativeElement.innerText.trim()).toEqual(incidentDetails.Witnesses[index].FullName)

                witnessField = witness.query(By.css('.witness-grid__telephone'));
                expect(witnessField.children[0].nativeElement.innerText.trim()).toEqual('PREVIEW.TELEPHONE');
                expect(witnessField.children[1].nativeElement.innerText.trim()).toEqual(incidentDetails.Witnesses[index].Telephone)

                witnessField = witness.query(By.css('.witness-grid__delegation'));
                expect(witnessField.children[0].nativeElement.innerText.trim()).toEqual('PREVIEW.JOB_TITLE');
                expect(witnessField.children[1].nativeElement.innerText.trim()).toEqual(incidentDetails.Witnesses[index].JobRole)
            })
        });

    });

    describe('When formation investigation available', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IncidentPreviewComponent);
            component = fixture.componentInstance;
            const complete = new Subject<boolean>();
            complete.next(false);
            component.onComplete = complete;

            store = fixture.debugElement.injector.get(Store);
            incidentPreviewServiceMock = TestBed.get(IncidentPreviewService);

            incidentDetails = extractIncidentPreviewData(MockStoreProviderIncident.getIncidentPreviewFormalInvestigation());
            incidentPreviewServiceMock.getIncidentPreviewDetails.and.returnValue(Observable.of(incidentDetails));
            store.dispatch(new IncidentTypeLoadCompleteAction(MockStoreProviderIncident.getIncidentTypeStub()));
            store.dispatch(new IncidentDetailsGetCompleteAction(MockStoreProviderIncident.getIncidentStub()));
            store.dispatch(new IncidentLoadApplicableSectionsCompleteAction(MockStoreProviderIncident.getInvestigationFieldsStub()));

            fixture.detectChanges();
        });

        it('should have formal investigation details', () => {
            let sections = fixture.debugElement.queryAll(By.css('section'));
            sectionAssert(sections, 5, 'PREVIEW.FORMAL_INVESTIGATION_DETAILS');

            let fields = sections[5].queryAll(By.css('.information-grid__item'));
            let subSections = sections[5].queryAll(By.css('h4'));
            expect(subSections.length).toEqual(6);
            let sectionNames = ['About the incident', 'About the injured person', 'Was the injured person...', 'Treatment', 'About the task/activity being carried out', 'RIDDOR specific information'];
            subSections.map((section, index) => {
                expect(section.nativeElement.innerText.trim()).toEqual(sectionNames[index]);
            });
            let labels = getLabels(component.investigationSections);
            let values = getValues(component);
            fieldsAssert(fields, labels, values);
        });
    });

    describe('When RIDDOR available', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IncidentPreviewComponent);
            component = fixture.componentInstance;
            const complete = new Subject<boolean>();
            complete.next(false);
            component.onComplete = complete;

            store = fixture.debugElement.injector.get(Store);
            incidentPreviewServiceMock = TestBed.get(IncidentPreviewService);

            incidentDetails = extractIncidentPreviewData(MockStoreProviderIncident.getIncidentPreviewForRiddor());
            incidentPreviewServiceMock.getIncidentPreviewDetails.and.returnValue(Observable.of(incidentDetails));
            store.dispatch(new IncidentTypeLoadCompleteAction(MockStoreProviderIncident.getIncidentTypeStub()));
            store.dispatch(new IncidentDetailsGetCompleteAction(MockStoreProviderIncident.getIncidentStub()));

            fixture.detectChanges();
        });

        it('should have RIDDOR details', () => {
            let sections = fixture.debugElement.queryAll(By.css('section'));
            sectionAssert(sections, 5, 'PREVIEW.RIDDOR');
            let fields = sections[5].queryAll(By.css('.information-grid__item'));
            let labels = [
                'PREVIEW.Main_industry'
                , 'PREVIEW.Main_activity'
                , 'PREVIEW.Sub_activity'
                , 'PREVIEW.WORK_PROCESS'
                , 'PREVIEW.ROOT_CAUSE'
                , 'PREVIEW.RIDDOR_REPORTED_BY'
                , 'PREVIEW.HOW_WAS_IT_REPORTED_TO_THE_HSE'
                , 'PREVIEW.DATE_REPORTED'
                , 'COUNTY'
                , 'COUNTRY'
                , 'PREVIEW.LOCAL_AUTHORITY'
            ];
            let reportedDate = new Date(incidentDetails.ReportedToRIDDORReportedDate);
            let values = [
                incidentDetails.ReportedToMainIndustry.trim()
                , incidentDetails.ReportedToMainActivity
                , incidentDetails.ReportedToSubActivity
                , incidentDetails.ReportedToWorkProcess
                , incidentDetails.ReportedToMainFactor
                , incidentDetails.IncidentReportedByUserFullName
                , incidentDetails.ReportedToRIDDORReportedMedium
                , reportedDate.toLocaleDateString('en-GB') + ' ' + reportedDate.toLocaleTimeString('en-GB')
                , incidentDetails.ReportedToCounty
                , incidentDetails.ReportedToCountry
                , incidentDetails.ReportedToLocalAuthority
            ];
            fieldsAssert(fields, labels, values);
        });
    });

});