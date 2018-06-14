import { AeIndicatorStyle } from '../../atlas-elements/common/ae-indicator-style.enum';
import { AeLoaderType } from '../../atlas-elements/common/ae-loader-type.enum';
import { extractCalendarInformation } from '../../calendar/common/calendar-extract-helper';
import { AeDatasourceType } from '../../atlas-elements/common/ae-datasource-type';
import { AeVideoStyleMode } from '../../atlas-elements/common/ae-videostyle-mode';
import { FileResult } from '../../atlas-elements/common/models/file-result';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../shared/base-component';
import { AeInformationBarItemType } from '../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { BehaviorSubject, Subject } from 'rxjs/Rx';
import { AeIconSize } from '../../atlas-elements/common/ae-icon-size.enum';
import { AeListItem } from '../../atlas-elements/common/models/ae-list-item';
import { AeListStyle } from '../../atlas-elements/common/ae-list-style.enum';
import { AeTextareaResize } from '../../atlas-elements/common/ae-textarea-resize.enum';
import { Orientation } from '../../atlas-elements/common/orientation.enum';
import { AeInputType } from '../../atlas-elements/common/ae-input-type.enum';
import { AeLabelStyle } from '../../atlas-elements/common/ae-label-style.enum';
import { AeClassStyle } from '../../atlas-elements/common/ae-class-style.enum';
import { AeImageAvatarSize } from '../../atlas-elements/common/ae-image-avatar-size.enum';
import { AePosition } from '../../atlas-elements/common/ae-position.enum';
import { AeBannerTheme } from '../../atlas-elements/common/ae-banner-theme.enum';
import { AeNav } from '../../atlas-elements/common/ae-nav.enum';
import { AeSplitButtonOption } from '../../atlas-elements/common/models/ae-split-button-options';
import { error } from 'util';
import { ErrorService } from '../../shared/error-handling/error.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as Immutable from 'immutable';
import { MessageType } from '../../atlas-elements/common/ae-message.enum';
import { CalendarEvent } from '../../atlas-elements/common/models/calendar-models/calendarEvent';
//import { EventsTestData } from '../../atlas-elements/common/models/calendar-models/testEvents';


const MOCK_CALENDAR_RESPONSE = JSON.parse('{"Entities":[{"CalendarEntityType":2,"events":[{"Id":"01a7b216-7bb1-455e-b5e6-129fc1d3d187","Name":"Good Friday","HolidayDate":"2016-03-25T00:00:00","Year":2016},{"Id":"14371846-50ae-406c-9ac3-1c65e53ba3bc","Name":"Summer bank holiday","HolidayDate":"2016-08-29T00:00:00","Year":2016},{"Id":"0fa90aca-f219-46bb-8c5f-1db1bc9b5b7d","Name":"Easter Monday","HolidayDate":"2016-03-28T00:00:00","Year":2016},{"Id":"06ae73c9-5f49-4106-899e-1fb8c8a57c85","Name":"Early May bank holiday","HolidayDate":"2016-05-02T00:00:00","Year":2016},{"Id":"55da93a6-5ae9-4a96-a1c3-23177d828ef7","Name":"Boxing Day","HolidayDate":"2016-12-26T00:00:00","Year":2016},{"Id":"813d2f10-2f6f-4aa8-9ee9-388fb73a20f6","Name":"New Year’s Day (substitute day)","HolidayDate":"2017-01-02T00:00:00","Year":2016},{"Id":"2daa934f-9650-4b5c-9bac-60b04b8ad79c","Name":"Christmas Day","HolidayDate":"2017-12-25T00:00:00","Year":2016},{"Id":"2898770a-f268-4629-a268-67d7e3074443","Name":"Good Friday","HolidayDate":"2017-04-14T00:00:00","Year":2016},{"Id":"18bf15ce-bc35-4d68-a39e-69b396d376ae","Name":"Summer bank holiday","HolidayDate":"2017-08-28T00:00:00","Year":2016},{"Id":"ac96f9bd-c865-4365-9466-86432c76d7bc","Name":"Spring bank holiday","HolidayDate":"2017-05-29T00:00:00","Year":2016},{"Id":"fa849369-7030-4918-a5b8-9d20ab8ee72f","Name":"Boxing Day","HolidayDate":"2017-12-26T00:00:00","Year":2016},{"Id":"6ee2c06d-5361-4f14-a2af-b75723c69aeb","Name":"Early May bank holiday","HolidayDate":"2017-05-01T00:00:00","Year":2016},{"Id":"cb7eddb8-ab28-4fd1-9e9d-c9817893ea11","Name":"Easter Monday","HolidayDate":"2017-04-17T00:00:00","Year":2016},{"Id":"167d88c7-1720-40f1-952a-e082a076189d","Name":"Spring bank holiday","HolidayDate":"2016-05-30T00:00:00","Year":2016},{"Id":"dbfcb782-c47f-41cc-949f-e843301aa005","Name":"Christmas Day (substitute day)","HolidayDate":"2016-12-27T00:00:00","Year":2016}]},{"CalendarEntityType":1,"events":[{"Id":"0325ef47-c5b2-4b3f-aadf-670bb3fb244d","AbsencesType":null,"EmployeeId":"60502a22-7124-4c7c-8e65-16015cea6916","Comment":"","EndDate":"2017-03-30T00:00:00","IsHour":true,"StartDate":"2017-03-29T00:00:00","TypeId":1,"FullName":"Employee one  one","NoOfDays":7.00,"NoOfUnits":7.00,"Status":{"Name":"Approved","Code":4,"IsRequestedStatus":false,"Id":"2b5b7bf4-4115-4179-a9fe-90068d183ec7","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"HalfDayType":null,"AbsenceDetails":[{"Author":null,"Modifier":null,"MyAbsence":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","FromHour":"2017-03-30T04:00:00","ToHour":"2017-03-30T06:00:00","NoOfUnits":2.00,"MyAbsenceId":"0325ef47-c5b2-4b3f-aadf-670bb3fb244d","LunchDuration":0.00,"Id":"73f8207d-9925-4554-97db-80baaf70a886","CreatedOn":"2017-03-28T08:34:00","ModifiedOn":"2017-03-28T08:41:00","CreatedBy":"648aaee4-0c2e-4f26-a3dd-0a4d766010c6","ModifiedBy":"2cab23a4-6b6b-42d9-997e-401d21c2f7b3","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"MyAbsence":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","FromHour":"2017-03-29T04:00:00","ToHour":"2017-03-29T09:00:00","NoOfUnits":5.00,"MyAbsenceId":"0325ef47-c5b2-4b3f-aadf-670bb3fb244d","LunchDuration":0.00,"Id":"2e124833-3f36-4d4b-891c-9d78b52cae02","CreatedOn":"2017-03-28T08:34:00","ModifiedOn":"2017-03-28T08:41:00","CreatedBy":"648aaee4-0c2e-4f26-a3dd-0a4d766010c6","ModifiedBy":"2cab23a4-6b6b-42d9-997e-401d21c2f7b3","IsDeleted":false,"LCid":2057,"Version":"1.0"}]},{"Id":"1376c8a1-b8b0-47f1-b8b6-ac606a6e6ae7","AbsencesType":null,"EmployeeId":"60502a22-7124-4c7c-8e65-16015cea6916","Comment":"","EndDate":"2017-03-28T00:00:00","IsHour":false,"StartDate":"2017-03-25T00:00:00","TypeId":1,"FullName":"Employee one  one","NoOfDays":2.00,"NoOfUnits":2.00,"Status":{"Name":"Approved","Code":4,"IsRequestedStatus":false,"Id":"2b5b7bf4-4115-4179-a9fe-90068d183ec7","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"HalfDayType":null,"AbsenceDetails":[]},{"Id":"7dffd606-bced-483c-91c1-ef07480a3dda","AbsencesType":{"CompanyId":"00000000-0000-0000-0000-000000000000","TypeName":"Business Holiday","AbsenceCodeId":"00000000-0000-0000-0000-000000000000","AbsenceCode":null,"Color":null,"PictureId":null,"AbsenceSubType":null,"IsExample":false,"IsExampleFlag":false,"Id":"500c8e8b-6300-4cf4-9a27-8d3fd5fecb71","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"EmployeeId":"60502a22-7124-4c7c-8e65-16015cea6916","Comment":"asdfdsf","EndDate":"2017-03-03T00:00:00","IsHour":true,"StartDate":"2017-03-02T00:00:00","TypeId":2,"FullName":"Employee one  one","NoOfDays":9.00,"NoOfUnits":9.00,"Status":{"Name":"Approved","Code":4,"IsRequestedStatus":false,"Id":"2b5b7bf4-4115-4179-a9fe-90068d183ec7","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"HalfDayType":null,"AbsenceDetails":[{"Author":null,"Modifier":null,"MyAbsence":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","FromHour":"2017-03-03T04:00:00","ToHour":"2017-03-03T07:00:00","NoOfUnits":3.00,"MyAbsenceId":"7dffd606-bced-483c-91c1-ef07480a3dda","LunchDuration":0.00,"Id":"8600232e-b37b-440c-9aba-65eb5fe43f59","CreatedOn":"2017-03-29T10:17:00","ModifiedOn":"2017-03-29T10:21:00","CreatedBy":"648aaee4-0c2e-4f26-a3dd-0a4d766010c6","ModifiedBy":"2cab23a4-6b6b-42d9-997e-401d21c2f7b3","IsDeleted":false,"LCid":2057,"Version":"1.0"},{"Author":null,"Modifier":null,"MyAbsence":null,"CompanyId":"55d1130c-6b4a-462a-a47f-d8df2f6b8c73","FromHour":"2017-03-02T04:00:00","ToHour":"2017-03-02T10:00:00","NoOfUnits":6.00,"MyAbsenceId":"7dffd606-bced-483c-91c1-ef07480a3dda","LunchDuration":0.00,"Id":"6aada3c9-177c-47bc-83cc-e3c42be39323","CreatedOn":"2017-03-29T10:17:00","ModifiedOn":"2017-03-29T10:21:00","CreatedBy":"648aaee4-0c2e-4f26-a3dd-0a4d766010c6","ModifiedBy":"2cab23a4-6b6b-42d9-997e-401d21c2f7b3","IsDeleted":false,"LCid":2057,"Version":"1.0"}]},{"Id":"2cf935c0-4410-4752-88f7-8c162f4291d5","AbsencesType":{"CompanyId":"00000000-0000-0000-0000-000000000000","TypeName":"Public Duty","AbsenceCodeId":"00000000-0000-0000-0000-000000000000","AbsenceCode":null,"Color":null,"PictureId":null,"AbsenceSubType":null,"IsExample":false,"IsExampleFlag":false,"Id":"bd597580-46b6-4a08-a906-c4dacb99625d","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"EmployeeId":"60502a22-7124-4c7c-8e65-16015cea6916","Comment":"go n vote","EndDate":"2017-02-02T00:00:00","IsHour":false,"StartDate":"2017-02-02T00:00:00","TypeId":2,"FullName":"Employee one  one","NoOfDays":1.00,"NoOfUnits":1.00,"Status":{"Name":"Approved","Code":4,"IsRequestedStatus":false,"Id":"2b5b7bf4-4115-4179-a9fe-90068d183ec7","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"HalfDayType":null,"AbsenceDetails":[]},{"Id":"1cd72377-2da4-4788-86c5-3f96521ab10c","AbsencesType":null,"EmployeeId":"efbe68a2-d60c-44a3-930a-f3fb6a99f60b","Comment":"","EndDate":"2017-02-09T00:00:00","IsHour":false,"StartDate":"2017-02-07T00:00:00","TypeId":1,"FullName":"newtwo  live","NoOfDays":3.00,"NoOfUnits":2.50,"Status":{"Name":"Approved","Code":4,"IsRequestedStatus":false,"Id":"2b5b7bf4-4115-4179-a9fe-90068d183ec7","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"HalfDayType":2,"AbsenceDetails":[]},{"Id":"1cd72277-2da4-4788-86c5-3f96521ab10c","AbsencesType":null,"EmployeeId":"efbe68a2-d60c-44a3-930a-f3fb6a99f60b","Comment":"","EndDate":"2017-02-09T00:00:00","IsHour":false,"StartDate":"2017-02-07T00:00:00","TypeId":1,"FullName":"newthree  live","NoOfDays":3.00,"NoOfUnits":2.50,"Status":{"Name":"Approved","Code":4,"IsRequestedStatus":false,"Id":"2b5b7bf4-4115-4179-a9fe-90068d183ec7","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"HalfDayType":2,"AbsenceDetails":[]},{"Id":"1cd72377-2da4-4788-86c5-3f96521ab10c","AbsencesType":null,"EmployeeId":"efbe68a2-d60c-44a3-930a-f3fb6a99f60b","Comment":"","EndDate":"2017-02-09T00:00:00","IsHour":false,"StartDate":"2017-02-07T00:00:00","TypeId":1,"FullName":"newfour  live","NoOfDays":3.00,"NoOfUnits":2.50,"Status":{"Name":"Approved","Code":4,"IsRequestedStatus":false,"Id":"2b537bf4-4115-4179-a9fe-90068d183ec7","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"HalfDayType":2,"AbsenceDetails":[]},{"Id":"ec69bf03-a9f0-4d43-83d4-71d42ba695cd","AbsencesType":null,"EmployeeId":"efbe68a2-d60c-44a3-930a-f3fb6a99f60b","Comment":"","EndDate":"2017-02-15T00:00:00","IsHour":false,"StartDate":"2017-02-13T00:00:00","TypeId":1,"FullName":"newtwo  live","NoOfDays":3.00,"NoOfUnits":2.50,"Status":{"Name":"Approved","Code":4,"IsRequestedStatus":false,"Id":"2b5b7bf4-4115-4179-a9fe-90068d183ec7","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"HalfDayType":2,"AbsenceDetails":[]},{"Id":"fd4405e2-834b-49bc-a643-6dd606875a97","AbsencesType":{"CompanyId":"00000000-0000-0000-0000-000000000000","TypeName":"Family/Dependant","AbsenceCodeId":"00000000-0000-0000-0000-000000000000","AbsenceCode":null,"Color":null,"PictureId":null,"AbsenceSubType":null,"IsExample":false,"IsExampleFlag":false,"Id":"99c83ec9-c3bd-44af-8a01-6420395c24a0","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"EmployeeId":"efbe68a2-d60c-44a3-930a-f3fb6a99f60b","Comment":"","EndDate":"2017-02-10T00:00:00","IsHour":false,"StartDate":"2017-02-06T00:00:00","TypeId":2,"FullName":"newtwo  live","NoOfDays":5.00,"NoOfUnits":4.50,"Status":{"Name":"Approved","Code":4,"IsRequestedStatus":false,"Id":"2b5b7bf4-4115-4179-a9fe-90068d183ec7","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"HalfDayType":2,"AbsenceDetails":[]},{"Id":"2f1ce3f6-bd79-4023-82de-1d5664a0a071","AbsencesType":{"CompanyId":"00000000-0000-0000-0000-000000000000","TypeName":"Business Holiday","AbsenceCodeId":"00000000-0000-0000-0000-000000000000","AbsenceCode":null,"Color":null,"PictureId":null,"AbsenceSubType":null,"IsExample":false,"IsExampleFlag":false,"Id":"500c8e8b-6300-4cf4-9a27-8d3fd5fecb71","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"EmployeeId":"efbe68a2-d60c-44a3-930a-f3fb6a99f60b","Comment":"","EndDate":"2017-02-03T00:00:00","IsHour":false,"StartDate":"2017-02-01T00:00:00","TypeId":2,"FullName":"newtwo  live","NoOfDays":3.00,"NoOfUnits":2.50,"Status":{"Name":"Approved","Code":4,"IsRequestedStatus":false,"Id":"2b5b7bf4-4115-4179-a9fe-90068d183ec7","CreatedOn":"0001-01-01T00:00:00","ModifiedOn":"0001-01-01T00:00:00","CreatedBy":"00000000-0000-0000-0000-000000000000","ModifiedBy":"00000000-0000-0000-0000-000000000000","IsDeleted":false,"LCid":0,"Version":null,"Author":null,"Modifier":null},"HalfDayType":1,"AbsenceDetails":[]}]}],"PagingInfo":null,"OtherInfo":null}');

import { AeFilterItem } from '../../atlas-elements/common/models/ae-filter-item';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { AeFilterSearchMode } from '../../atlas-elements/common/ae-filter-searchmode.enum';
import { AeFilterControlType } from '../../atlas-elements/common/ae-filter-controltype.enum';

import { AeBadgeSize } from '../../atlas-elements/common/ae-badge-size.enum';
import { AeNavActionsOption } from '../../atlas-elements/common/models/ae-nav-actions-options';
import { Tristate } from "../../atlas-elements/common/tristate.enum";

const MOCK_USERS: any[] = [{ name: "Angular 2", id: 1 }, { name: "MVC", id: 2 }, { name: "Entityframework", id: 3 }, { name: "Node", id: 4 }, { name: "AngularJS", id: 5 }, { name: "Jasmine", id: 6 }, { name: "Observable", id: 7 }];

@Component({
    selector: 'app-root',
    templateUrl: './atlas-elements.component.html',
    styleUrls: ['./atlas-elements.component.scss'],
    providers: [ErrorService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AtlasElementsComponent extends BaseComponent implements OnInit {
    title = 'app works!';
    inputType = "text";
    messagetType = MessageType.Info;
    messagetType2 = MessageType.Alert;
    messagetType3 = MessageType.Warning;
    aelStyle = AeLabelStyle.Medium;
    imgOrientation = Orientation.Horizontal;
    aeBannerTheme = AeBannerTheme.Default;
    sampleForm: FormGroup;
    errors: any[] = [];
    _listItems = Immutable.List([{ name: "vijay" }, { name: "vijay" }, { name: "vijay" }, { name: "vijay" }]);
    _listStream = new BehaviorSubject<Object>(this._listItems)
    _visibility = new Subject<boolean>();
    _defaultNumber = 3;
    _cProps = ['name'];
    _imageAvatarSize = AeImageAvatarSize.big;
    _imgPreviewSrcUrl = 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcR70_sNJtkOp8hJVd9h08LdXk4uC9LbP1vGDGS8dzY_x-spiNJI';
    _imgPreviewEditIconSize: AeIconSize = AeIconSize.small; // AeIconSize.big; || AeIconSize.small; || AeIconSize.medium;
    _filesToUpload = [];
    showSlider = false;
    showDialog = false;
    //fullcalendar 
    events: CalendarEvent[];
    //fullcalendar end
    /**
     *
     */
    dataProvider: Array<any> = [];

    item: Object;

    rowHeight: number = 50;
    onSelectItem($event) {

        this.item = $event;

    }
    constructor(_localeService: LocaleService, _translationService: TranslationService, _cdRef: ChangeDetectorRef,
        private fb: FormBuilder, private errorService: ErrorService) {
        super(_localeService, _translationService, _cdRef);
        this.errorService.subscribeToError((error) => {
            this.errors.push(error);
        });
        this._visibility.subscribe();

        for (var i = 0; i < 100; i++) {

            this.dataProvider.push({

                label: 'item #' + i, value: i

            });
        }

    }

    validateForm() {       
    }

    onValueChanged(value: any) {       
    }

    onInputChange(val: Event) {       
    }

    // button component start
    onBtnClick(event: any) {       
    }
    lightClass: AeClassStyle = AeClassStyle.Light;
    darkClass: AeClassStyle = AeClassStyle.Dark;
    btnLeft: AePosition = AePosition.Left;
    btnRight: AePosition = AePosition.Right;
    // button component end

    // switch
    switchTextLeft: AeClassStyle = AeClassStyle.TextLeft;
    switchTextRight: AeClassStyle = AeClassStyle.TextRight;

    // Nav actions started

    // Nav actions position
    navActionListLeft: AeClassStyle = AeClassStyle.TextLeft;
    // Options
    navActionsOptions: any[] = [
        new AeNavActionsOption("To Do", this._getActOption(this.toDoAction), Tristate.False),
        new AeNavActionsOption("Inprogress", this._getActOption(this.inprogressAction), Tristate.False),
        new AeNavActionsOption("Complete", this._getActOption(this.CompleteAction), Tristate.False, true),
        new AeNavActionsOption("Update", this._getActOption(this.updateAction), Tristate.False),
        new AeNavActionsOption("Remove", this._getActOption(this.removeAction), Tristate.False)
    ];
    _getActOption(fn: Function) {
        let sub = new Subject();
        sub.subscribe((v) => {
            fn.call(v);
        })
        return sub;
    }

    _onNavActionClick(event: any) {        
    }
    toDoAction() {        
    }
    inprogressAction() {        
    }
    CompleteAction() {
        
    }
    updateAction() {
        
    }
    removeAction() {
        
    }

    // nav action end 

    // anchor component start
    onAncClick(event: any) {
        
    }

    // anchor component start
    onPrevious(event: any) {
        
    }

    // anchor component start
    onNext(event: any) {
        
    }

    forward: AeNav = AeNav.Forward;
    backward: AeNav = AeNav.Backward;
    // anchor component end

    // split button start
    // splitButtonOptions: any[] = [
    //     new AeSplitButtonOption(
    //         'Add',
    //             Rx.Subject.bind(() => {this
    //             .add})
    //     }),
    //     new AeSplitButtonOption({
    //         Text: 'Update', Command: () => {
    //             this.update();
    //         }
    //     }),
    //     new AeSplitButtonOption({
    //         Text: 'Delete', Command: () => {
    //             this.delete();
    //         }
    //     })
    // ];

    splitButtonOptions: any[] = [
        new AeSplitButtonOption("Add", this._getOption(this.add), false),
        new AeSplitButtonOption("Update", this._getOption(this.update), false),
        new AeSplitButtonOption("Delete", this._getOption(this.delete), false)
    ];

    _getOption(fn: Function) {
        let sub = new Subject();
        sub.subscribe((v) => {
            fn.call(v);
        })
        return sub;
    }

    _onSplitBtnClick(event: any) {
        
    }

    add() {
        
    }

    update() {
        
    }

    delete() {
        
    }

    // split button end

    ngOnInit(): void {
        // calendar events data (should be from api)        
        //this.events = EventsTestData.events;
        this.events = extractCalendarInformation(MOCK_CALENDAR_RESPONSE);
        this.sampleForm = this.fb.group({
            sampleInput: [{ value: this.modelIput, disabled: false }, Validators.required],
            sampleSelect: [{ value: this.modelValue, disabled: false }, Validators.required],
            sampleValidation: [false],
            sampleCheckbox: [{ value: this.modelCheckbox, disabled: false }, Validators.required],
            sampleSwitch: [{ value: this.modelSwitch, disabled: false }, Validators.required],
            sampleTextarea: [{ value: this.modelTextarea, disabled: false }, Validators.required],
            sampleRadioButton: [{ value: this.modelRadio, disabled: false }],
            sampleRadioButtonGroup: [{ value: this.modelRadio, disabled: false }]
        });


        this.sampleForm.valueChanges.subscribe(data => {            

        })

        this.sampleForm.get('sampleInput').valueChanges.forEach((value: any) => {            
            //let isValid = this.sampleForm.get('sampleInput').valid;            
            // this.sampleForm.get('sampleValidation').setValue(isValid);

        });

        this.sampleForm.get('sampleTextarea').valueChanges.forEach((value: any) => {            
        });

        this.sampleForm.get('sampleSelect').valueChanges.forEach((value: any) => {            
            let isValid = this.sampleForm.get('sampleSelect').valid;            
            this.sampleForm.get('sampleValidation').setValue(isValid);

        });
        this.sampleForm.get('sampleCheckbox').valueChanges.forEach((value: boolean) => {            
        });

        this.sampleForm.get('sampleSwitch').valueChanges.forEach((value: boolean) => {            

        });
        this.sampleForm.get('sampleRadioButton').valueChanges.forEach((value: any) => {            

        });

        this.sampleForm.get('sampleRadioButtonGroup').valueChanges.forEach((value: any) => {            
        });
    }

    ddlOptions = Immutable.List([{
        Text: "Group 1", Value: "", Childrens: [{ Text: "Option 1", Value: "opt1" },
        { Text: "Option 2", Value: "opt2", Disabled: true },
        { Text: "Option 3", Value: "opt3" }]
    },
    {
        Text: "Group 2", Value: "", Childrens: [{ Text: "Option 5", Value: "opt5" },
        { Text: "Option 6", Value: "opt6", Disabled: true },
        { Text: "Option 7", Value: "opt7" }]
    }]);
    modelValue: string = "opt1";
    modelIput: string = "some text";
    modelCheckbox: boolean = false;
    modelSwitch: boolean = false;
    modelTextarea: string = "sample text area";
    modelRadio: string = "0";
    radioOptions = [{ Text: "H&S", Value: 0, Disabled: false }, { Text: "EL", Value: 1, Disabled: true }, { Text: "Both", Value: 2, Disabled: false }];
    ctrlType: AeInputType = AeInputType.search;
    resizeStyle: AeTextareaResize = AeTextareaResize.None;
    /*Input Events*/
    onFocus(e) {        
    }

    onBlur(e) {        
    }

    _changeRadioOptions(e) {        
    }

    onChange(e) {                
    }
    /* Input Events End */
    liItems: Immutable.List<AeListItem> =
    Immutable.List([new AeListItem({ Text: "Item One Text Goes Here.", HasAction: true, ItemType: AeListStyle.UnRead, LinkText: "Click Here", OrderIndex: 0, IsClickable: true }),
    new AeListItem({ Text: "Item Two Text Goes Here.", HasAction: false, ItemType: AeListStyle.UnRead, LinkText: "Sample Text", OrderIndex: 1, IsClickable: false }),
    new AeListItem({ Text: "Item Three Text Goes Here.", HasAction: false, ItemType: AeListStyle.UnRead, LinkText: "Sample Text", OrderIndex: 2, IsClickable: true }),
    new AeListItem({ Text: "Item Four Text Goes Here.", HasAction: false, ItemType: AeListStyle.UnRead, LinkText: "Sample Text", OrderIndex: 3, IsClickable: false }),
    new AeListItem({ Text: "Item Five Text Goes Here.", HasAction: false, ItemType: AeListStyle.Normal, LinkText: "Sample Text", OrderIndex: 4, IsClickable: true })]);

    listAction(e) {        
    }

    iconOneSize: AeIconSize = AeIconSize.big;
    iconSmall: AeIconSize = AeIconSize.small;
    iconMedium: AeIconSize = AeIconSize.medium;
    videoSyle: AeVideoStyleMode = AeVideoStyleMode.Thumbnail;
    linkText: string = "Click to play youtube video";

    aecsItems: any[] = [];
    aecsSel: any[] = []; //[{id:1,name:"Karthik"}];
    filterAecs(e) {
        this.aecsItems = MOCK_USERS.filter((c) => {
            return c.name.toLowerCase().indexOf(e.query.toLowerCase()) != -1;
        });
    }
    onAecsSelect(e) {        
    }
    //----------------------
    aecmItems: any[] = [];
    aecmSel: any[] = [];
    filterAecm(e) {

        this.aecmItems = MOCK_USERS.filter((c) => {
            return c.name.toLowerCase().indexOf(e.query.toLowerCase()) != -1;
        });        
    }
    onAecmSelect(e) {        
    }

    //-------------

    aefsType: AeDatasourceType = AeDatasourceType.Local;
    aefsItems: any[] = [{ name: 'anusha', id: 1 }, { name: 'nihar', id: 2 }, { name: 'karthik', id: 3 }, { name: 'srinivas', id: 4 }, { name: 'mahesh d', id: 5 }, { name: 'shravan', id: 6 }];
    aefsSel: any[] = [];

    aefmItems: any[] = [{ name: 'anusha', id: 1 }, { name: 'nihar', id: 2 }, { name: 'karthik', id: 3 }, { name: 'srinivas', id: 4 }, { name: 'mahesh d', id: 5 }, { name: 'shravan', id: 6 }];
    aefmSel: any[] = [];

    _changeData() {
        this._listStream.next(Immutable.List([{ name: "Madhav" }, { name: "Daggumati" }, { name: "Reddy" }, { name: "vijay" }]));
        //   this._listItems = Immutable.List([{name:"Madhav"}, {name:"Daggumati"}, {name:"Reddy"}, {name:"vijay"}]);
    }

    bannerIconOptions = [{ Name: "icon-bank", Text: "H & S" }, { Name: "icon-bell", Text: "EL" }];

    changeInput(e) {        
    }

    _sendData() {
        this._listStream.next({ name: "Anil" });
    }

    _setVisibility(visible: boolean) {
        this._visibility.next(visible);
    }

    informationBarItems: Immutable.List<AeInformationBarItem> = Immutable.List(
        [
            new AeInformationBarItem(AeInformationBarItemType.DocumentsAwaiting, 50, "Absences Requested", true, "test tool tip1")
            , new AeInformationBarItem(AeInformationBarItemType.HolidayCountdown, 50, "Holidays Requested", false, "test tool tip2")
            , new AeInformationBarItem(AeInformationBarItemType.HolidaysAvailable, 50, "Holidays remaining", false, "test tool tip3")
            , new AeInformationBarItem(AeInformationBarItemType.TeamHolidays, 50, "policies to sign", false, "test tool tip4")
            , new AeInformationBarItem(AeInformationBarItemType.TrainingCourses, 50, "Sick days taken", true, "test tool tip5")
            , new AeInformationBarItem(AeInformationBarItemType.TasksToComplete, 50, "Sick days taken", true, "test tool tip5")
        ])

    informationItemSelected(item: AeInformationBarItem) {        

    }
    _modifyInformation() {
        this.informationBarItems = this.informationBarItems.set(0, new AeInformationBarItem(AeInformationBarItemType.DocumentsAwaiting, 99, "Changed value", true, "test tool tip1"));
        this.informationBarItems = this.informationBarItems.set(2, new AeInformationBarItem(AeInformationBarItemType.HolidayCountdown, 55, "Changed value", true, "test tool tip1"));
        //this.informationBarItems =
        //this.informationBarItems = this.informationBarItems;   
    }
    _addMoreInformation() {
        var newList = this.informationBarItems.insert(this.informationBarItems.size, new AeInformationBarItem(AeInformationBarItemType.HolidaysAvailable, 25, "New item added", true, "test tool tip1"));
        this.informationBarItems = newList;
    }
    _deleteInformation() {
        var newList = this.informationBarItems.delete(0);
        this.informationBarItems = newList;
    }
    _onSortListItemRemoved(event: any) {        
    }
    _onSortListitemLinkClicked(event: any) {        
    }
    _onSortListItemsReOrdered(event: any) {        
    }

    _onDateSelect = (val: Date) => {        
    }

    isDateValid: boolean = true;

    _isValidDate = function (val: boolean) {        
        this.isDateValid = val;
    }

    minDate: Date;
    maxDate: Date;


    sliderValue: number = 0;
    onSliderChange(event) {
        this.sliderValue = event.value;
    }
    _modalClosed(event: any) {
        this.showDialog = false;
    }
    _sliderClosed(event: any) {
        this.showSlider = false;
    }

    ImplicitSearchMode: AeFilterSearchMode = AeFilterSearchMode.Implicit;

    ddlItems: AeSelectItem<any>[] = [new AeSelectItem<any>("Option-1", "opt1", false), new AeSelectItem<any>("Option-2", "opt2", false), new AeSelectItem<any>("Option-3", "opt3", false)];

    testFilters = [new AeFilterItem(AeFilterControlType.TextBox, "txtEmployeeName", "txtEmployeeName", "Employee Name", "filterByEmployeeName", "filter By Employee Name", "srinivas", null)
        , new AeFilterItem(AeFilterControlType.Select, "ddlDepartment", "ddldepartment", "Department", "filterByDepartment", "All Department", "opt1", this.ddlItems)
        , new AeFilterItem(AeFilterControlType.Select, "ddlDepartment1", "ddldepartment1", null, "filterByDepartment1", "All Departments 1", "opt3", this.ddlItems)
        , new AeFilterItem(AeFilterControlType.TextBox, "txtEmployeeName1", "txtEmployeeName1", null, "filterByEmployeeName1", "filter By Employee Name one", null, null)
        , new AeFilterItem(AeFilterControlType.Select, "ddlDepartment2", "ddldepartment2", "Department 2", "filterByDepartment2", "All Departments 2", null, this.ddlItems)
    ];

    onSearch(event: any) {                
    }
    // badge size
    badgeLarge: AeBadgeSize = AeBadgeSize.large;
    badgeMedium: AeBadgeSize = AeBadgeSize.medium;
    // legend options
    legendOptions = [{ Text: "New", Class: "indicator--green" }, { Text: "Approved", Class: "indicator--yellow" }, { Text: "Cancelled", Class: "indicator--red" }, { Text: "Declined", Class: "indicator--purple" }, { Text: "Cancellation request", Class: "indicator--teal" }, { Text: "Change request", Class: "indicator--grey" }];
    iconLegendOptions = [{ Text: "Holiday approver", IconName: "icon-org-chart" }, { Text: "Email login", IconName: "icon-alert-envelope" }, { Text: "User login", IconName: "icon-employee" }, { Text: "Disabled", IconName: "icon-alert-cancel" }];
    // end of legend
    // loader type
    _loaderType: AeLoaderType = AeLoaderType.Bars;
    _squareIndicator: AeIndicatorStyle = AeIndicatorStyle.Square;
    _legendVertical: AeIndicatorStyle = AeIndicatorStyle.Vertical;
}