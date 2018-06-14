import { BreadcrumbGroup } from './common/models/ae-breadcrumb-group';
import { AeRichTextEditorComponent } from './ae-editor/ae-editor.component';
import { AeChartComponent } from './ae-chart/ae-chart.component';
import { RouterModule } from '@angular/router';
import { AeLegendComponent } from './ae-legend/ae-legend.component';
import { AeIndicatorComponent } from './ae-indicator/ae-indicator.component';
import { AeBadgeComponent } from './ae-badge/ae-badge.component';
import { IBreadcrumb } from './common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './common/services/breadcrumb-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorHandler, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AeInputComponent } from './ae-input/ae-input.component';
import { AeCheckboxComponent } from './ae-checkbox/ae-checkbox.component';
import { AtlasErrorHandler } from '../shared/error-handling/atlas-error-handler';
import { AeButtonComponent } from './ae-button/ae-button.component';
import { AeSelectComponent } from './ae-select/ae-select.component';
import { AeLabelComponent } from './ae-label/ae-label.component';
import { AeAnchorComponent } from './ae-anchor/ae-anchor.component';
import { AeSwitchComponent } from './ae-switch/ae-switch.component';
import { AeLoaderComponent } from './ae-loader/ae-loader.component';
import { AeTextareaComponent } from './ae-textarea/ae-textarea.component';
import { AeListComponent } from './ae-list/ae-list.component';
import { AeIconComponent } from './ae-icon/ae-icon.component';
import { AeStatisticComponent } from './ae-statistic/ae-statistic.component';
import { AeRadioButtonComponent } from './ae-radiobutton/ae-radiobutton.component';
import { AePaginationComponent } from './ae-pagination/ae-pagination.component';
import { AeRadioGroupComponent } from './ae-radio-group/ae-radio-group.component';
import { AeBannerComponent } from './ae-banner/ae-banner.component';
import { AeSplitbuttonComponent } from './ae-splitbutton/ae-splitbutton.component';
import { AePopoverComponent } from './ae-popover/ae-popover.component';
import { AeTabComponent } from './ae-tab/ae-tab.component';
import { AeTabStripComponent } from './ae-tabstrip/ae-tabstrip.component';
import { AeAutocompleteComponent } from './ae-autocomplete/ae-autocomplete.component';
import { AeHighlighttextPipe } from './common/ae-highlighttext.pipe';
import { AeDatetimePickerComponent } from './ae-datetime-picker/ae-datetime-picker.component';
import { AeFileComponent } from './ae-file/ae-file.component';
import { AeDatatableComponent } from './ae-datatable/ae-datatable.component';
import { AeColumnComponent } from './ae-datatable/ae-column/ae-column.component';
import { AeTemplateComponent } from './ae-template/ae-template.component';
import { AeVirtualListComponent } from './ae-virtual-list/ae-virtual-list.component';
import { AeVirtualScrollComponent } from './ae-virtual-scroll/ae-virtual-scroll.component';
import { AeTemplateLoaderComponent } from './ae-template-loader/ae-template-loader.component';
import { AeTabItemComponent } from './ae-tab/ae-tab-item/ae-tab-item.component';
import { AeTabStripItemComponent } from './ae-tabstrip/ae-tabstrip-item/ae-tabstrip-item.component';
import { AeMessageComponent } from './ae-message/ae-message.component';
import { AeScrollDirective } from './ae-scroll/ae-scroll.directive';
import { AeInformationbarComponent } from './ae-informationbar/ae-informationbar.component';
import { AeModalDialogComponent } from './ae-modal-dialog/ae-modal-dialog.component';
import { AeVideoComponent } from './ae-video/ae-video.component';
import { AeSortListComponent } from './ae-sort-list/ae-sort-list.component';
import { AeFullcalendarComponent } from './ae-fullcalendar/ae-fullcalendar.component';
import { AeCalendarDayViewComponent } from './ae-fullcalendar/ae-calendar-day-view/ae-calendar-day-view.component';
import { AeCalendarMonthViewComponent } from './ae-fullcalendar/ae-calendar-month-view/ae-calendar-month-view.component';
import { AeCalendarWeekViewComponent } from './ae-fullcalendar/ae-calendar-week-view/ae-calendar-week-view.component';
import { AeCalendarMonthEventsViewComponent } from './ae-fullcalendar/ae-calendar-month-view/ae-calendar-month-events-view/ae-calendar-month-events-view.component';
import { AeCalendarMonthCellViewComponent } from './ae-fullcalendar/ae-calendar-month-view/ae-calendar-month-cell-view/ae-calendar-month-cell-view.component';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { AeSliderComponent } from './ae-slider/ae-slider.component';
import { AeCardComponent } from './ae-card/ae-card.component';
import { AeImageAvatarComponent } from './ae-image-avatar/ae-image-avatar.component';
import { AeSlideOutComponent } from './ae-slideout/ae-slideout.component';
import { AeBreadcrumbComponent } from './ae-breadcrumb/ae-breadcrumb.component';
import { Ae2BreadcrumbComponent } from './Ae2-breadcrumb/Ae2-breadcrumb.component';
import { AeFormComponent } from './ae-form/ae-form.component';
import { AeListItemComponent } from './ae-list-item/ae-list-item.component';
import { AeNavActionsComponent } from './ae-nav-actions/ae-nav-actions.component';
import { AeTimeSelectorComponent } from './ae-time-selector/ae-time-selector.component';
import { AeSnackbarComponent } from './ae-snackbar/ae-snackbar.component';
import { AeSignatureComponent } from './ae-signature/ae-signature.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { AeNotificationComponent } from './ae-notification/ae-notification.component';
import { AeNumericStepperComponent } from './ae-numeric-stepper/ae-numeric-stepper.component';
import { AePopoverDirective } from './ae-popover/ae-popover.directive';
import { AeElementDirective } from './ae-element/ae-element.directive';
import { AeCarouselComponent } from './ae-carousel/ae-carousel.component';
import { AeWizardComponent } from './ae-wizard/ae-wizard.component';
import { AePixelPipe } from './ae-pixel-pipe/ae-pixel.pipe';
import { AeOrgChartComponent } from './ae-org-chart/ae-org-chart.component';
import { AeOrgChartNodeComponent } from './ae-org-chart/ae-org-chart-node/ae-org-chart-node.component';
import { DndModule } from 'ng2-dnd';
import { AeAddressComponent } from './ae-address/ae-address.component';
import { AeStampComponent } from './ae-stamp/ae-stamp.component';
import { AeDragDropModule } from './ae-drag-drop/ae-drag-drop.module';
import { AeOrgChartService } from './ae-org-chart/services/ae-org-chart.service';
import { AeAccordionComponent } from './ae-accordion/ae-accordion.component';
import { TruncatePipe } from "./ae-truncate.pipe";
import { CkEditorModule } from './ck-editor/ck-editor.module';
import { AeGroupCheckboxComponent } from './ae-group-checkbox/ae-group-checkbox.component';

@NgModule({

    imports: [
        CommonModule
        , FormsModule
        , ReactiveFormsModule
        , DragulaModule
        , ReactiveFormsModule
        , RouterModule
        , SignaturePadModule
        , AeDragDropModule
        , DndModule.forRoot()
        , CkEditorModule
    ],
    declarations: [
        AeInputComponent
        , AeCheckboxComponent
        , AeSelectComponent
        , AeLabelComponent
        , AeButtonComponent
        , AeAnchorComponent
        , AeSwitchComponent
        , AeLoaderComponent
        , AeTextareaComponent
        , AeListComponent
        , AeIconComponent
        , AeStatisticComponent
        , AeRadioButtonComponent
        , AePaginationComponent
        , AeRadioGroupComponent
        , AeBannerComponent
        , AeSplitbuttonComponent
        , AeTabComponent
        , AeTabStripComponent
        , AeDatatableComponent
        , AeColumnComponent
        , AeTemplateComponent
        , AeLoaderComponent
        , AeVirtualListComponent
        , AeVirtualScrollComponent
        , AeTemplateLoaderComponent
        , AeTabItemComponent
        , AeTabStripItemComponent
        , AeMessageComponent
        , AeScrollDirective
        , AePopoverComponent
        , AeFileComponent
        , AeInformationbarComponent
        , AeModalDialogComponent
        , AeVideoComponent
        , AeSortListComponent
        , AeCalendarMonthCellViewComponent
        , AeCalendarMonthEventsViewComponent
        , AeCalendarWeekViewComponent
        , AeCalendarMonthViewComponent
        , AeCalendarDayViewComponent
        , AeFullcalendarComponent
        , AeDatetimePickerComponent
        , AeSliderComponent
        , AeCardComponent
        , AeAutocompleteComponent
        , AeHighlighttextPipe
        , AeImageAvatarComponent
        , AeSlideOutComponent
        , AeBreadcrumbComponent
        , AeFormComponent
        , Ae2BreadcrumbComponent
        , AeIndicatorComponent
        , AeLegendComponent
        , AeBadgeComponent
        , AeListItemComponent
        , AeNavActionsComponent
        , AeTimeSelectorComponent
        , AeChartComponent
        , AeSnackbarComponent
        , AeSignatureComponent
        , AeNotificationComponent
        , AePopoverDirective
        , AeCarouselComponent
        , AeNumericStepperComponent
        , AePopoverDirective
        , AeElementDirective
        , AeWizardComponent
        , AeOrgChartComponent
        , AeOrgChartNodeComponent
        , AePixelPipe
        , AeAddressComponent
        , AeRichTextEditorComponent
        , AeStampComponent
        , AeAccordionComponent
        , TruncatePipe
        , AeGroupCheckboxComponent
    ],

    entryComponents: [
        AeOrgChartNodeComponent
    ],

    exports: [
        AeInputComponent
        , AeSelectComponent
        , AeLabelComponent
        , AeButtonComponent
        , AeAnchorComponent
        , AeCheckboxComponent
        , AeSwitchComponent
        , AeLoaderComponent
        , AeTextareaComponent
        , AeListComponent
        , AeIconComponent
        , AeStatisticComponent
        , AeRadioButtonComponent
        , AePaginationComponent
        , AeRadioGroupComponent
        , AeBannerComponent
        , AeSplitbuttonComponent
        , AeTabComponent
        , AeTabStripComponent
        , AeColumnComponent
        , AeDatatableComponent
        , AeVirtualListComponent
        , AeTemplateComponent
        , AeTabItemComponent
        , AeTabStripItemComponent
        , AeMessageComponent
        , AeScrollDirective
        , AePopoverComponent
        , AeFileComponent
        , AeInformationbarComponent
        , AeModalDialogComponent
        , AeVideoComponent
        , AeSortListComponent
        , AeCalendarMonthCellViewComponent
        , AeCalendarMonthEventsViewComponent
        , AeCalendarWeekViewComponent
        , AeCalendarMonthViewComponent
        , AeCalendarDayViewComponent
        , AeFullcalendarComponent
        , AeDatetimePickerComponent
        , AeSliderComponent
        , AeCardComponent
        , AeAutocompleteComponent
        , AeHighlighttextPipe
        , AeImageAvatarComponent
        , AeSlideOutComponent
        , AeBreadcrumbComponent
        , Ae2BreadcrumbComponent
        , AeIndicatorComponent
        , AeLegendComponent
        , AeChartComponent
        , AeBadgeComponent
        , AeNavActionsComponent
        , AeTimeSelectorComponent
        , AeSnackbarComponent
        , AeSignatureComponent
        , AeNotificationComponent
        , AeNumericStepperComponent
        , AeFormComponent
        , AePopoverDirective
        , AeCarouselComponent
        , AeWizardComponent
        , AeOrgChartNodeComponent
        , AeOrgChartComponent
        , AeAddressComponent
        , AeRichTextEditorComponent
        , AeStampComponent
        , AeAccordionComponent
        , TruncatePipe
        , AeGroupCheckboxComponent
    ],
    providers: [
        { provide: ErrorHandler, useClass: AtlasErrorHandler }
        , DragulaService
        , AeOrgChartService
    ]
})
export class AtlasElementsModule implements OnInit {
    private _elementsBC: IBreadcrumb;
    constructor(private _brcrumbService: BreadcrumbService) {
    }
    ngOnInit(): void {
        this._elementsBC = { isGroupRoot: true, group: BreadcrumbGroup.Elements, label: 'Elements', url: '/design' };
        this._brcrumbService.add(this._elementsBC);
    }
}
