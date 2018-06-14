import { TaskInformationBarComponent } from "./task-information-bar.component";
import { ComponentFixture, async, TestBed, tick, fakeAsync } from "@angular/core/testing";
import { RouterMock } from "../../shared/testing/mocks/router-stub";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { AtlasElementsModule } from "../../atlas-elements/atlas-elements.module";
import { AtlasSharedModule } from "../../shared/atlas-shared.module";
import { RouterModule, Router } from "@angular/router";
import { LocalizationModule, InjectorRef, LocaleService, TranslationService } from "angular-l10n";
import { CkEditorModule } from "../../atlas-elements/ck-editor/ck-editor.module";
import { StoreModule, Store } from "@ngrx/store";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BreadcrumbService } from "../../atlas-elements/common/services/breadcrumb-service";
import { LocaleServiceStub } from "../../shared/testing/mocks/locale-service-stub";
import { TranslationServiceStub } from "../../shared/testing/mocks/translation-service-stub";
import { LocalizationConfig } from "../../shared/localization-config";
import { LocalizationConfigStub } from "../../shared/testing/mocks/localization-config-stub";
import { FormBuilderService } from "../../shared/services/form-builder.service";
import { reducer } from "../../shared/reducers/index";
import { TaskListComponent } from "../../task/task-list/task-list.component";
import { TaskDetailsComponent } from "../../task/task-forms/task-details/task-details.component";
import { TaskModule } from "../../task/task.module";
import { TaskUpdateComponent } from "../../task/task-forms/task-update/task-update.component";
import { TaskAddComponent } from "../../task/task-forms/task-add/task-add.component";
import { LoadTaskHeadBannerAction, LoadTaskHeadBannerCompleteAction } from '../actions/task-information-bar.actions';
import { ClaimsHelperService } from "../../shared/helpers/claims-helper";
import { extractInformationBarItems } from "../../shared/helpers/extract-helpers";
import { By } from "@angular/platform-browser";
import { Component } from "@angular/core/src/metadata/directives";
import { AeInformationBarItem } from "../../atlas-elements/common/models/ae-informationbar-item";
import { AeInformationBarItemType } from "../../atlas-elements/common/ae-informationbar-itemtype.enum";
import { DebugElement } from "@angular/core";
import { ResponseOptions, Response } from "@angular/http";
import { getTasksInformationBarItems } from "../../task/effects/task-information-bar.effects.spec";

describe('Task information bar component', () => {
    let component: TaskInformationBarComponent;
    let fixture: ComponentFixture<TaskInformationBarComponent>;
    let store: any;
    let breadCumServiceStub: any;
    let localeServiceStub: any;
    let translationServiceStub: any;
    let localizationConfigStub: any;
    let routerMock: RouterMock;
    let activatedRouteStub: any;
    let dispatchSpy: any;
    let items = [];
    let routerStub: any;
    let claimsHelperServiceStub: any;
    let routeParamsStub: any;
    let locationService: any;
    let datePipe: any;

    beforeEach(async(() => {
        routerStub = new RouterMock();

        TestBed.configureTestingModule({
            imports: [
                CommonModule
                , ReactiveFormsModule
                , AtlasElementsModule
                , AtlasSharedModule
                , RouterModule.forChild([])
                , LocalizationModule
                , CkEditorModule
                , StoreModule.provideStore(reducer)
                , BrowserAnimationsModule
            ],
            declarations: [
                TaskListComponent
                , TaskInformationBarComponent
                , TaskDetailsComponent
                , TaskUpdateComponent
                , TaskAddComponent
            ],
            providers: [
                InjectorRef,
                BreadcrumbService
                , { provide: Router, useValue: routerStub }
                , { provide: LocaleService, useClass: LocaleServiceStub }
                , { provide: TranslationService, useClass: TranslationServiceStub }
                , { provide: LocalizationConfig, useClass: LocalizationConfigStub }
                , { provide: ClaimsHelperService, useValue: jasmine.createSpyObj('claimsHelperServiceStub', ['IsPublicUser']) }
                , FormBuilderService
            ]
        }).overrideComponent(TaskInformationBarComponent, { set: { host: { "(click)": "dummy" } } })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskInformationBarComponent);
        component = fixture.componentInstance;
        store = fixture.debugElement.injector.get(Store);
        localeServiceStub = fixture.debugElement.injector.get(LocaleService);
        translationServiceStub = fixture.debugElement.injector.get(TranslationService);
        localizationConfigStub = fixture.debugElement.injector.get(LocalizationConfig);
        dispatchSpy = spyOn(store, 'dispatch');
        dispatchSpy.and.callThrough();
        component.id = "taskInformationBar";
        component.name = "taskInformationBar";
        let options = new ResponseOptions({ body: getTasksInformationBarItems() });
        let informationBarItemsResponse = new Response(options);
        let taskInformationBarItems = extractInformationBarItems(informationBarItemsResponse);
        store.dispatch(new LoadTaskHeadBannerCompleteAction(taskInformationBarItems));
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
        fixture.detectChanges();
    });

    it('component must be launched', () => {
        expect(component).toBeTruthy();
    });

    it('should have 6 information bar components', () => {
        expect(dispatchSpy).toHaveBeenCalledWith(new LoadTaskHeadBannerAction(true));
        expect(component.taskInformationBarItems.length).toEqual(6);
        let firstComponent = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_div_0')).nativeElement;
        let secondComponent = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_div_1')).nativeElement;
        let thirdComponent = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_div_2')).nativeElement;
        let fourthComponent = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_div_3')).nativeElement;
        let fifthComponent = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_div_4')).nativeElement;
        let sixthComponent = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_div_5')).nativeElement;

        expect(firstComponent).toBeDefined();
        expect(secondComponent).toBeDefined();
        expect(thirdComponent).toBeDefined();
        expect(fourthComponent).toBeDefined();
        expect(fifthComponent).toBeDefined();
        expect(sixthComponent).toBeDefined();
    });

    it('each information bar component should have agreed title,icon,tooltip and count as per atlas design', () => {
        let items = component.taskInformationBarItems;
        let newTasksComponent = fixture.debugElement.query(By.css('#informationBar_aestat_0_icondiv')).componentInstance;
        let overDueTasksComponent = fixture.debugElement.query(By.css('#informationBar_aestat_1_icondiv')).componentInstance;
        let incompleteTasksComponent = fixture.debugElement.query(By.css('#informationBar_aestat_2_icondiv')).componentInstance;
        let dueTodayComponent = fixture.debugElement.query(By.css('#informationBar_aestat_3_icondiv')).componentInstance;
        let dueThisWeekComponent = fixture.debugElement.query(By.css('#informationBar_aestat_4_icondiv')).componentInstance;
        let dueNextweekComponent = fixture.debugElement.query(By.css('#informationBar_aestat_5_icondiv')).componentInstance;

        let newTasksComponentCount = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_aestat_0_countdiv_num')).nativeElement;
        let overDueTasksComponentCount = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_aestat_1_countdiv_num')).nativeElement;
        let incompleteTasksComponentCount = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_aestat_2_countdiv_num')).nativeElement;
        let dueTodayComponentCount = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_aestat_3_countdiv_num')).nativeElement;
        let dueThisWeekComponentCount = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_aestat_4_countdiv_num')).nativeElement;
        let dueNextweekComponentCount = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_aestat_5_countdiv_num')).nativeElement;

        let newTasksComponentTitle = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_aestat_0_countdiv_name')).nativeElement;
        let overDueTasksComponentTitle = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_aestat_1_countdiv_name')).nativeElement;
        let incompleteTasksComponentTitle = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_aestat_2_countdiv_name')).nativeElement;
        let dueTodayComponentTitle = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_aestat_3_countdiv_name')).nativeElement;
        let dueThisWeekComponentTitle = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_aestat_4_countdiv_name')).nativeElement;
        let dueNextweekComponentTitle = <HTMLElement>fixture.debugElement.query(By.css('#informationBar_aestat_5_countdiv_name')).nativeElement;

        expect(newTasksComponentTitle.innerText).toEqual(items[0].Title);
        expect(overDueTasksComponentTitle.innerText).toEqual(items[1].Title);
        expect(incompleteTasksComponentTitle.innerText).toEqual(items[2].Title);
        expect(dueTodayComponentTitle.innerText).toEqual(items[3].Title);
        expect(dueThisWeekComponentTitle.innerText).toEqual(items[4].Title);
        expect(dueNextweekComponentTitle.innerText).toEqual(items[5].Title);

        expect(newTasksComponentCount.innerText).toEqual(items[0].Count.toString());
        expect(overDueTasksComponentCount.innerText).toEqual(items[1].Count.toString());
        expect(incompleteTasksComponentCount.innerText).toEqual(items[2].Count.toString());
        expect(dueTodayComponentCount.innerText).toEqual(items[3].Count.toString());
        expect(dueThisWeekComponentCount.innerText).toEqual(items[4].Count.toString());
        expect(dueNextweekComponentCount.innerText).toEqual(items[5].Count.toString());

        expect(newTasksComponent.iconName).toEqual(items[0].IconName);
        expect(overDueTasksComponent.iconName).toEqual(items[1].IconName);
        expect(incompleteTasksComponent.iconName).toEqual(items[2].IconName);
        expect(dueTodayComponent.iconName).toEqual(items[3].IconName);
        expect(dueThisWeekComponent.iconName).toEqual(items[4].IconName);
        expect(dueNextweekComponent.iconName).toEqual(items[5].IconName);

        expect(newTasksComponent.tooltip).toEqual(items[0].ToolTip);
        expect(overDueTasksComponent.tooltip).toEqual(items[1].ToolTip);
        expect(incompleteTasksComponent.tooltip).toEqual(items[2].ToolTip);
        expect(dueTodayComponent.tooltip).toEqual(items[3].ToolTip);
        expect(dueThisWeekComponent.tooltip).toEqual(items[4].ToolTip);
        expect(dueNextweekComponent.tooltip).toEqual(items[5].ToolTip);
    });

    describe('verify click event of each information bar component', () => {
        it('`New Tasks` component', fakeAsync(() => {
            let clickSpy = spyOn(component, 'informationItemSelected').and.callThrough();
            spyOn(component.taskComponentItemClick, 'emit');
            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[0].query(By.css('div.statistic'));
            (<HTMLElement>statElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();
            expect(clickSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalledWith(component.taskInformationBarItems[0]);
            expect(component.taskComponentItemClick.emit).toHaveBeenCalled();
            expect(component.taskComponentItemClick.emit).toHaveBeenCalledWith(component.taskInformationBarItems[0].Type);
        }));

        it('`Overdue Tasks` component', fakeAsync(() => {
            let clickSpy = spyOn(component, 'informationItemSelected').and.callThrough();
            spyOn(component.taskComponentItemClick, 'emit');
            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[1].query(By.css('div.statistic'));
            (<HTMLElement>statElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();
            expect(clickSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalledWith(component.taskInformationBarItems[1]);
            expect(component.taskComponentItemClick.emit).toHaveBeenCalled();
            expect(component.taskComponentItemClick.emit).toHaveBeenCalledWith(component.taskInformationBarItems[1].Type);
        }));

        it('`Incomplete Tasks` component', fakeAsync(() => {
            let clickSpy = spyOn(component, 'informationItemSelected').and.callThrough();
            spyOn(component.taskComponentItemClick, 'emit');
            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[2].query(By.css('div.statistic'));
            (<HTMLElement>statElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();
            expect(clickSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalledWith(component.taskInformationBarItems[2]);
            expect(component.taskComponentItemClick.emit).toHaveBeenCalled();
            expect(component.taskComponentItemClick.emit).toHaveBeenCalledWith(component.taskInformationBarItems[2].Type);
        }));

        it('`Due Today` component', fakeAsync(() => {
            let clickSpy = spyOn(component, 'informationItemSelected').and.callThrough();
            spyOn(component.taskComponentItemClick, 'emit');
            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[3].query(By.css('div.statistic'));
            (<HTMLElement>statElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();
            expect(clickSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalledWith(component.taskInformationBarItems[3]);
            expect(component.taskComponentItemClick.emit).toHaveBeenCalled();
            expect(component.taskComponentItemClick.emit).toHaveBeenCalledWith(component.taskInformationBarItems[3].Type);
        }));

        it('`Due this week` component', fakeAsync(() => {
            let clickSpy = spyOn(component, 'informationItemSelected').and.callThrough();
            spyOn(component.taskComponentItemClick, 'emit');
            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[4].query(By.css('div.statistic'));
            (<HTMLElement>statElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();
            expect(clickSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalledWith(component.taskInformationBarItems[4]);
            expect(component.taskComponentItemClick.emit).toHaveBeenCalled();
            expect(component.taskComponentItemClick.emit).toHaveBeenCalledWith(component.taskInformationBarItems[4].Type);
        }));

        it('`Due next week` component', fakeAsync(() => {
            let clickSpy = spyOn(component, 'informationItemSelected').and.callThrough();
            spyOn(component.taskComponentItemClick, 'emit');
            let statElement: DebugElement = fixture.debugElement.queryAll(By.css('ae-statistic'))[5].query(By.css('div.statistic'));
            (<HTMLElement>statElement.nativeElement).click();
            tick(60);
            fixture.detectChanges();
            expect(clickSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalledWith(component.taskInformationBarItems[5]);
            expect(component.taskComponentItemClick.emit).toHaveBeenCalled();
            expect(component.taskComponentItemClick.emit).toHaveBeenCalledWith(component.taskInformationBarItems[5].Type);
        }));
    });

    describe('verifying banner', () => {
        it('should display banner below the information bar', () => {
            let banner = fixture.debugElement.query(By.css('.banner'));
            expect(banner).toBeDefined();
        });

        it('should display banner Title as `Tasks`', () => {
            let bannerTitle = fixture.debugElement.query(By.css('.banner__title')).nativeElement;
            expect(bannerTitle.innerText).toEqual('TASKS_TEXT');
        });

        it('should display Add task Button', () => {
            let addTaskButton = fixture.debugElement.query(By.css('#testslider_aeButton_1')).nativeElement;
            expect(addTaskButton).toBeDefined();
            expect(addTaskButton.innerText).toEqual('ADD_TASK');
        });

        it('should display banner image as per atlas design', () => {
            let bannerImage = fixture.debugElement.query(By.css('.banner__background')).componentInstance;
            expect(bannerImage.backgroundImage).toEqual("/assets/images/lp-tasks.jpg");
        });
    });
});

