import { AeNav } from '../common/ae-nav.enum';
import { AeSelectEvent } from '../common/ae-select.event';
import { AeSelectItem } from '../common/models/ae-select-item';
import { AeInputComponent } from '../ae-input/ae-input.component';
import { AeInputType } from '../common/ae-input-type.enum';
import { AeClassStyle } from '../common/ae-class-style.enum';
import { BaseElementGeneric } from '../common/base-element-generic';
import { AbstractControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    animate,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
    Renderer,
    state,
    style,
    transition,
    trigger,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';

export const CALENDAR_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AeDatetimePickerComponent),
    multi: true
};

export const CALENDAR_VALIDATOR: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => AeDatetimePickerComponent),
    multi: true
};

export interface LocaleSettings {
    firstDayOfWeek?: number;
    dayNames: string[];
    dayNamesShort: string[];
    dayNamesMin: string[];
    monthNames: string[];
    monthNamesShort: string[];
}

@Component({
    selector: 'ae-datetime-picker',
    templateUrl: './ae-datetime-picker.component.html',
    styleUrls: ['./ae-datetime-picker.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('overlayState', [
            state('hidden', style({
                opacity: 0
            })),
            state('visible', style({
                opacity: 1
            })),
            transition('visible => hidden', animate('400ms ease-in')),
            transition('hidden => visible', animate('400ms ease-out'))
        ])
    ],
    host: {
        '[class.ui-inputwrapper-filled]': 'filled',
        '[class.ui-inputwrapper-focus]': 'focus'
    },
    providers: [CALENDAR_VALUE_ACCESSOR, CALENDAR_VALIDATOR],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AeDatetimePickerComponent<T> extends BaseElementGeneric<Date> implements OnInit {

    // Private Fields
    //
    private _defaultDate: Date;
    private _placeholder: string = 'dd/mm/yyyy';
    private _dateFormat: string = 'dd/mm/yy';
    private _inline: boolean = false;
    private _showOtherMonths: boolean = true;
    private _selectOtherMonths: boolean = true;
    private _showIcon: boolean;
    private _appendTo: any;
    private _readonlyInput: boolean;
    private _shortYearCutoff: any = '+10';
    private _monthNavigator: boolean;
    private _yearNavigator: boolean;
    private _yearRange: string = "1950:2050";
    private _showTime: boolean;
    private _hourFormat: string = '24';
    private _timeOnly: boolean;
    private _stepHour: number = 1;
    private _stepMinute: number = 1;
    private _stepSecond: number = 1;
    private _showSeconds: boolean = false;
    private _tabindex: number;
    private _showOnFocus: boolean = true;
    private _dataType: string = 'date';
    private _minDate: Date;
    private _maxDate: Date;
    private _isValid: boolean = true;
    private _locale: LocaleSettings = {
        firstDayOfWeek: 0,
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    };
    private _monthOptions: Immutable.List<AeSelectItem<string>> = Immutable.fromJS([]);
    private _value: Date;
    private _dates: any[];
    private _weekDays: string[] = [];
    private _currentMonthText: string;
    private _currentMonth: number;
    private _currentYear: number;
    private _currentHour: number;
    private _currentMinute: number;
    private _currentSecond: number;
    private _pm: boolean;
    private _overlay: HTMLDivElement;
    private _overlayVisible: boolean;
    private _closeOverlay: boolean = true;
    private _dateClick: boolean;
    private _documentClickListener: any;
    private _ticksTo1970: number;
    private _yearOptions: Immutable.List<AeSelectItem<number>>;
    private _focus: boolean;
    private _filled: boolean;
    private _inputFieldValue: string = null;
    private _forward: AeNav = AeNav.Forward;
    private _backward: AeNav = AeNav.Backward;
    private _idInc: number = 0;

    private _inputType: AeInputType = AeInputType.text;
    private _inputDisabled: boolean = false;
    //
    // End of Private Fields

    // Private Input bindings
    //
    get backward(): AeNav {
        return this._backward;
    }

    get inputType(): AeInputType {
        return this._inputType;
    }

    get forward(): AeNav {
        return this._forward;
    }

    get inputFieldValue(): string {
        return this._inputFieldValue;
    }

    get currentMonthText(): string {
        return this._currentMonthText;
    }

    get currentMonth(): number {
        return this._currentMonth;
    }

    get currentYear(): number {
        return this._currentYear;
    }

    get currentHour(): number {
        return this._currentHour;
    }

    get currentSecond(): number {
        return this._currentSecond;
    }

    get currentMinute(): number {
        return this._currentMinute;
    }

    get yearOptions(): Immutable.List<AeSelectItem<number>> {
        return this._yearOptions;
    }

    get monthOptions(): Immutable.List<AeSelectItem<string>> {
        return this._monthOptions;
    }

    get weekDays(): string[] {
        return this._weekDays;
    }

    get dates(): any[] {
        return this._dates;
    }
    /**
     * Method to Set the date to highlight on first opening if the field is blank.
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('defaultDate')
    get defaultDate() { return this._defaultDate; }
    set defaultDate(val: Date) { this._defaultDate = val; }


    /**
     * Method to add Placeholder text for the input.
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('placeholder')
    get placeholder() { return this._placeholder; }
    set placeholder(val: string) { this._placeholder = val; }


    /**
     * Method to disables the component when specified
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('disabled')
    get disabled() { return this._disabled; }
    set disabled(val: any) { this._disabled = val; }

    /**
     * Method to input text field disables the component when specified
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('inputDisabled')
    get inputDisabled() { return this._inputDisabled; }
    set inputDisabled(val: boolean) { this._inputDisabled = val; }

    /**
     * Method to add format of the date.
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('dateFormat')
    get dateFormat() { return this._dateFormat; }
    set dateFormat(val: string) { this._dateFormat = val; }


    /**
     * Method to displays the calendar as inline when enabled, Default is false for popup mode.
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('inline')
    get inline() { return this._inline; }
    set inline(val: boolean) { this._inline = val; }

    //   @Input()
    //   get showOtherMonths(){ return this._showOtherMonths; }
    //   set showOtherMonths(val: boolean){ this._showOtherMonths = val; }

    @Input()
    get selectOtherMonths() { return this._selectOtherMonths; }
    set selectOtherMonths(val: boolean) { this._selectOtherMonths = val; }

    /**
     * Method to displays a button with icon next to input when enabled.
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('showIcon')
    get showIcon() { return this._showIcon; }
    set showIcon(val: boolean) { this._showIcon = val; }

    //@Input() icon: string = 'fa-calendar';


    /**
     * Target element to attach the overlay, valid values are "body" or a local template variable of another element.
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input()
    get appendTo() { return this._appendTo; }
    set appendTo(val: any) { this._appendTo = val; }


    /**
     * When specified, prevents entering the date manually with keyboard.
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('readonlyInput')
    get readonlyInput() { return this._readonlyInput; }
    set readonlyInput(val: boolean) { this._readonlyInput = val; }


    /**
     * Whether the month should be rendered as a dropdown instead of text.
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('monthNavigator')
    get monthNavigator() { return this._monthNavigator; }
    set monthNavigator(val: boolean) { this._monthNavigator = val; }


    /**
     * Whether the year should be rendered as a dropdown instead of text.
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('yearNavigator')
    get yearNavigator() { return this._yearNavigator; }
    set yearNavigator(val: boolean) { this._yearNavigator = val; }


    /**
     * The range of years displayed in the year drop-down in (nnnn:nnnn) format such as (2000:2020).
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('yearRange')
    get yearRange() { return this._yearRange; }
    set yearRange(val: string) { this._yearRange = val; }


    /**
     * Whether to display timepicker.
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('showTime')
    get showTime() { return this._showTime; }
    set showTime(val: boolean) { this._showTime = val; }


    /**
     * Specifies 12 or 24 hour format.
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('hourFormat')
    get hourFormat() { return this._hourFormat; }
    set hourFormat(val: string) { this._hourFormat = val; }


    /**
     * Whether to display timepicker only.
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('timeOnly')
    get timeOnly() { return this._timeOnly; }
    set timeOnly(val: boolean) { this._timeOnly = val; }


    /**
     * Whether to show the seconds in time picker.
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('showSeconds')
    get showSeconds() { return this._showSeconds; }
    set showSeconds(val: boolean) { this._showSeconds = val; }


    /**
     * Method to add required for input field
     * 
     * @private
     * @type {boolean}
     * @memberOf AeDatetimePickerComponent
     */
    @Input('required')
    private _required: boolean;
    get required() { return this._required; }
    set required(val: boolean) { this._required = val; }


    /**
     * Method to add tab index for date field
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('tabindex')
    get tabindex() { return this._tabindex; }
    set tabindex(val: number) { this._tabindex = val; }


    /**
     * Method to restrict datepicker by min date
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('minDate')
    get minDate() { return this._minDate; }
    set minDate(date: Date) {
        this._minDate = date;
        this.createMonth(this._currentMonth, this._currentYear);
    }


    /**
     * Method to add restrict datepicker by max date
     * 
     * @readonly
     * 
     * @memberOf AeDatetimePickerComponent
     */
    @Input('maxDate')
    get maxDate() { return this._maxDate; }
    set maxDate(date: Date) {
        this._maxDate = date;
        this.createMonth(this._currentMonth, this._currentYear);
    }
    // 
    // End of Private Input bindings

    // Public Output bindings
    //
    @Output()
    aeFocus: EventEmitter<any> = new EventEmitter();

    @Output()
    aeBlur: EventEmitter<any> = new EventEmitter();

    @Output()
    aeSelect: EventEmitter<any> = new EventEmitter();

    //
    // End of Public Output bindings

    // Public ViewChild bindings  
    //
    @ViewChild('datepicker') overlayViewChild: ElementRef;
    //
    // End of Public ViewChild bindings  

    // Constructor
    //
    constructor(public el: ElementRef, public renderer: Renderer, protected cdr: ChangeDetectorRef) { super(cdr); }
    //
    // End of Constructor

    // Private Methods
    //
    private _onModelChange: Function = () => { };
    private _onModelTouched: Function = () => { };
    //
    // End of Private Methods

    ngOnInit() {
        let date = this._defaultDate || new Date();
        let dayIndex = this._locale.firstDayOfWeek;
        for (let i = 0; i < 7; i++) {
            this._weekDays.push(this._locale.dayNamesMin[dayIndex]);
            dayIndex = (dayIndex == 6) ? 0 : ++dayIndex;
        }

        this._currentMonth = date.getMonth();
        this._currentYear = date.getFullYear();
        if (this._showTime) {
            this._currentMinute = date.getMinutes();
            this._currentSecond = date.getSeconds();
            this._pm = date.getHours() > 11;
            if (this._hourFormat == '12')
                this._currentHour = date.getHours() == 0 ? 12 : date.getHours() % 12;
            else
                this._currentHour = date.getHours();
        }
        else if (this._timeOnly) {
            this._currentMinute = 0;
            this._currentHour = 0;
            this._currentSecond = 0;
        }

        this.createMonth(this._currentMonth, this._currentYear);

        this._ticksTo1970 = (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
            Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000);

        if (this._yearNavigator && this._yearRange) {

            let years = this._yearRange.split(':'),
                yearStart = parseInt(years[0]),
                yearEnd = parseInt(years[1]);

            this._yearOptions = Immutable.Range(yearStart, yearEnd).map(m => {
                let item = new AeSelectItem<number>(m.toString(), m);
                return item;
            }).toList();
        }

        if (this._monthNavigator) {
            this._monthOptions = Immutable.List<AeSelectItem<string>>(this._locale.monthNames.map((monthName, i) => {
                let item = new AeSelectItem<string>(monthName, i.toString());
                return item;
            }));
        }

        if (!isNullOrUndefined(this._defaultDate)) {
            this._value = this._defaultDate;
            this.updateInputfield();
        }
    }

    ngAfterViewInit() {
        this._overlay = <HTMLDivElement>this.overlayViewChild.nativeElement;

        if (!this._inline && this.appendTo) {
            if (this.appendTo === 'body')
                document.body.appendChild(this._overlay);
            // else
            //   this.domHandler.appendChild(this._overlay, this.appendTo);
        }
    }

    // Public methods
    //

    createMonth(month: number, year: number) {
        this._dates = [];
        this._currentMonth = month;
        this._currentYear = year;
        this._currentMonthText = this._locale.monthNames[month];
        let firstDay = this.getFirstDayOfMonthIndex(month, year);
        let daysLength = this.getDaysCountInMonth(month, year);
        let prevMonthDaysLength = this.getDaysCountInPrevMonth(month, year);
        let sundayIndex = this.getSundayIndex();
        let dayNo = 1;
        let today = new Date();

        for (let i = 0; i < 6; i++) {
            let week = [];
            if (i == 0) {
                for (let j = (prevMonthDaysLength - firstDay + 1); j <= prevMonthDaysLength; j++) {
                    let prev = this.getPreviousMonthAndYear(month, year);
                    week.push({
                        day: j, month: prev.month, year: prev.year, otherMonth: true,
                        today: this.isToday(today, j, prev.month, prev.year), selectable: this.isSelectable(j, prev.month, prev.year)
                    });
                }
                let remainingDaysLength = 7 - week.length;
                for (let j = 0; j < remainingDaysLength; j++) {
                    week.push({
                        day: dayNo, month: month, year: year, today: this.isToday(today, dayNo, month, year),
                        selectable: this.isSelectable(dayNo, month, year)
                    });
                    dayNo++;
                }
            }
            else {
                for (let j = 0; j < 7; j++) {
                    if (dayNo > daysLength) {
                        let next = this.getNextMonthAndYear(month, year);
                        week.push({
                            day: dayNo - daysLength, month: next.month, year: next.year, otherMonth: true,
                            today: this.isToday(today, dayNo - daysLength, next.month, next.year),
                            selectable: this.isSelectable((dayNo - daysLength), next.month, next.year)
                        });
                    }
                    else {
                        week.push({
                            day: dayNo, month: month, year: year, today: this.isToday(today, dayNo, month, year),
                            selectable: this.isSelectable(dayNo, month, year)
                        });
                    }
                    dayNo++;
                }
            }
            this._dates.push(week);
        }
    }

    prevMonth(event) {
        if (this._disabled) {
            event.preventDefault();
            return;
        }
        if (this._currentMonth === 0) {
            this._currentMonth = 11;
            this._currentYear--;
        }
        else {
            this._currentMonth--;
        }
        this.createMonth(this._currentMonth, this._currentYear);
        event.preventDefault();
    }

    nextMonth(event) {
        if (this._disabled) {
            event.preventDefault();
            return;
        }
        if (this._currentMonth === 11) {
            this._currentMonth = 0;
            this._currentYear++;
        }
        else {
            this._currentMonth++;
        }
        this.createMonth(this._currentMonth, this._currentYear);
        event.preventDefault();
    }

    onDateSelect(event, dateMeta) {
        if (this._disabled || !dateMeta.selectable) {
            event.preventDefault();
            return;
        }

        if (dateMeta.otherMonth) {
            if (this._selectOtherMonths)
                this.selectDate(dateMeta);
        }
        else {
            this.selectDate(dateMeta);
        }
        this._dateClick = true;
        this._overlayVisible = false;
        this.updateInputfield();
        event.preventDefault();
    }

    updateInputfield() {
        let currentTime = new Date();
        if (this._value) {
            if (!this._showTime) {
                this._value.setHours(currentTime.getHours(),
                    currentTime.getMinutes(),
                    currentTime.getMinutes());
            }
            let formattedValue;
            if (this._timeOnly) {
                formattedValue = this.formatTime(this._value);
            }
            else {
                formattedValue = this.formatDate(this._value, this._dateFormat);
                if (this._showTime) {
                    this._pm = this._value.getHours() > 11;
                    formattedValue += ' ' + this.formatTime(this._value);
                }
            }
            this._inputFieldValue = formattedValue;
        }
        else {
            this._inputFieldValue = '';
        }
        this.cdr.markForCheck();
        this.updateFilledState();
    }

    selectDate(dateMeta) {
        let currentTime = new Date();// Always consider current time when user selects date in datepicker
        this._value = new Date(
            dateMeta.year,
            dateMeta.month,
            dateMeta.day,
            currentTime.getHours(),
            currentTime.getMinutes(),
            currentTime.getMinutes()
        );
        if (this._showTime) {
            if (this._hourFormat === '12' && this._pm && this._currentHour != 12)
                this._value.setHours(this._currentHour + 12);
            else
                this._value.setHours(this._currentHour);

            this._value.setMinutes(this._currentMinute);
            this._value.setSeconds(this._currentSecond);
        }
        this._isValid = true;
        this.updateModel();
        this.aeSelect.emit(this._value);
    }

    updateModel() {
        if (this._dataType == 'date') {
            this._onModelChange(this._value);
        }
        else if (this._dataType == 'string') {
            if (this._timeOnly)
                this._onModelChange(this.formatTime(this._value));
            else
                this._onModelChange(this.formatDate(this._value, this._dateFormat));
        }
    }

    getFirstDayOfMonthIndex(month: number, year: number) {
        let day = new Date();
        day.setDate(1);
        day.setMonth(month);
        day.setFullYear(year);
        let dayIndex = day.getDay() + this.getSundayIndex();
        return dayIndex >= 7 ? dayIndex - 7 : dayIndex;
    }

    getDaysCountInMonth(month: number, year: number) {
        return 32 - this.daylightSavingAdjust(new Date(year, month, 32)).getDate();
    }

    getDaysCountInPrevMonth(month: number, year: number) {
        let prev = this.getPreviousMonthAndYear(month, year);
        return this.getDaysCountInMonth(prev.month, prev.year);
    }

    getPreviousMonthAndYear(month: number, year: number) {
        let m, y;
        if (month === 0) {
            m = 11;
            y = year - 1;
        }
        else {
            m = month - 1;
            y = year;
        }
        return { 'month': m, 'year': y };
    }

    getNextMonthAndYear(month: number, year: number) {
        let m, y;
        if (month === 11) {
            m = 0;
            y = year + 1;
        }
        else {
            m = month + 1;
            y = year;
        }
        return { 'month': m, 'year': y };
    }

    getSundayIndex() {
        return this._locale.firstDayOfWeek > 0 ? 7 - this._locale.firstDayOfWeek : 0;
    }

    isSelected(dateMeta): boolean {
        if (this._value)
            return this._value.getDate() === dateMeta.day && this._value.getMonth() === dateMeta.month && this._value.getFullYear() === dateMeta.year;
        else
            return false;
    }

    isToday(today, day, month, year): boolean {
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    }

    isSelectable(day, month, year): boolean {
        let validMin = true;
        let validMax = true;
        if (this._minDate) {
            if (this._minDate.getFullYear() > year) {
                validMin = false;
            }
            else if (this._minDate.getFullYear() === year) {
                if (this._minDate.getMonth() > month) {
                    validMin = false;
                }
                else if (this._minDate.getMonth() === month) {
                    if (this._minDate.getDate() > day) {
                        validMin = false;
                    }
                }
            }
        }

        if (this._maxDate) {
            if (this._maxDate.getFullYear() < year) {
                validMax = false;
            }
            else if (this._maxDate.getFullYear() === year) {
                if (this._maxDate.getMonth() < month) {
                    validMax = false;
                }
                else if (this._maxDate.getMonth() === month) {
                    if (this._maxDate.getDate() < day) {
                        validMax = false;
                    }
                }
            }
        }
        return validMin && validMax;
    }

    // onInputFocus(inputfield, event) {
    //     this._focus = true;
    //     if (this._showOnFocus) {
    //         this.showOverlay(inputfield);
    //     }
    //     this.aeFocus.emit(event);
    // }

    onInputBlur(event) {
        this._focus = false;
        this.aeBlur.emit(this._isValid);
        this._onModelTouched();
        this.updateInputfield();
    }

    onButtonClick(event, inputfield: AeInputComponent<Date>) {
        this._closeOverlay = false;
        if (!this._overlay.offsetParent) {
            inputfield.setfoucs();
            this.showOverlay(inputfield);
        }
        else
            this._closeOverlay = true;
    }

    onInputKeydown(event) {
        if (event.keyCode === 9) {
            this._overlayVisible = false;
        }
    }

    onMonthDropdownChange($event: AeSelectEvent<string>) {
        this._currentMonth = parseInt($event.SelectedValue);
        this.createMonth(this._currentMonth, this._currentYear);
    }

    onYearDropdownChange($event: AeSelectEvent<string>) {
        this._currentYear = parseInt($event.SelectedValue);
        this.createMonth(this._currentMonth, this._currentYear);
    }

    incrementHour(event) {
        let newHour = this._currentHour + this._stepHour;
        if (this._hourFormat == '24')
            this._currentHour = (newHour >= 24) ? (newHour - 24) : newHour;
        else if (this._hourFormat == '12')
            this._currentHour = (newHour >= 13) ? (newHour - 12) : newHour;

        this.updateTime();
        event.preventDefault();
    }

    decrementHour(event) {
        let newHour = this._currentHour - this._stepHour;
        if (this._hourFormat == '24')
            this._currentHour = (newHour < 0) ? (24 + newHour) : newHour;
        else if (this._hourFormat == '12')
            this._currentHour = (newHour <= 0) ? (12 + newHour) : newHour;

        this.updateTime();
        event.preventDefault();
    }

    incrementMinute(event) {
        let newMinute = this._currentMinute + this._stepMinute;
        this._currentMinute = (newMinute > 59) ? newMinute - 60 : newMinute;
        this.updateTime();
        event.preventDefault();
    }

    decrementMinute(event) {
        let newMinute = this._currentMinute - this._stepMinute;
        this._currentMinute = (newMinute < 0) ? 60 + newMinute : newMinute;
        this.updateTime();
        event.preventDefault();
    }

    incrementSecond(event) {
        let newSecond = this._currentSecond + this._stepSecond;
        this._currentSecond = (newSecond > 59) ? newSecond - 60 : newSecond;
        this.updateTime();
        event.preventDefault();
    }

    decrementSecond(event) {
        let newSecond = this._currentSecond - this._stepSecond;
        this._currentSecond = (newSecond < 0) ? 60 + newSecond : newSecond;
        this.updateTime();
        event.preventDefault();
    }

    updateTime() {
        this._value = this._value || new Date();
        if (this._hourFormat === '12' && this._pm && this._currentHour != 12)
            this._value.setHours(this._currentHour + 12);
        else if (this._currentHour == 12 && !this._pm) {
            this._value.setHours(this._currentHour - 12);
        }
        else {
            this._value.setHours(this._currentHour);
        }

        this._value.setMinutes(this._currentMinute);
        this._value.setSeconds(this._currentSecond);
        this.updateModel();
        this.aeSelect.emit(this._value);
        this.updateInputfield();
        //this.aeBlur.emit(this._isValid);
    }

    toggleAMPM(event) {
        this._pm = !this._pm;
        this.updateTime();
        event.preventDefault();
    }

    onInput(event) {
        if (!event.event.target.value && event.event.inputType != 'deleteContentBackward') {
            return;
        }

        try {
            this._value = this.parseValueFromString(event.event.target.value);
            this.updateUI();
            this._isValid = true;
        }
        catch (err) {
            //invalid date
            this._value = null;
            this._isValid = false;
        }
        this.updateModel();
        this.updateFilledState();
    }

    parseValueFromString(text: string): Date {
        let dateValue;
        let parts: string[] = text.split(' ');

        if (this._timeOnly) {
            dateValue = new Date();
            this.populateTime(dateValue, parts[0], parts[1]);
        }
        else {
            if (this._showTime) {
                dateValue = this.parseDate(parts[0], this._dateFormat);
                this.populateTime(dateValue, parts[1], parts[2]);
            }
            else {
                dateValue = this.parseDate(text, this._dateFormat);
            }
        }
        return dateValue;
    }

    populateTime(value, timeString, ampm) {
        if (this._hourFormat == '12' && !ampm) {
            throw 'Invalid Time';
        }

        this._pm = (ampm === 'PM' || ampm === 'pm');
        let time = this.parseTime(timeString);
        value.setHours(time.hour);
        value.setMinutes(time.minute);
        value.setSeconds(time.second);
    }

    updateUI() {
        let val = this._value || this._defaultDate || new Date();
        this.createMonth(val.getMonth(), val.getFullYear());
        if (this._showTime || this._timeOnly) {
            let hours = val.getHours();
            if (this._hourFormat === '12') {
                if (hours >= 12) {
                    this._currentHour = (hours == 12) ? 12 : hours - 12;
                }
                else {
                    this._currentHour = (hours == 0) ? 12 : hours;
                }
            }
            else {
                this._currentHour = val.getHours();
            }

            this._currentMinute = val.getMinutes();
            this._currentSecond = val.getSeconds();
        }
    }

    onDatePickerClick(event) {
        if (this._dateClick) {
            this._closeOverlay = true;
        }
        else {
            this._closeOverlay = false;
        }
    }

    showOverlay(inputfield) {
        // if(this.appendTo)
        //     this.domHandler.absolutePosition(this._overlay, inputfield);
        // else
        //     this.domHandler.relativePosition(this._overlay, inputfield);

        this._overlayVisible = true;
        //this._overlay.style.zIndex = String(++DomHandler.zindex);

        this.bindDocumentClickListener();
    }

    writeValue(value: Date): void {
        this._value = value;
        if (this._value && typeof this._value === 'string') {
            this._value = this.parseValueFromString(this._value);
        }

        this.updateInputfield();
        this.updateUI();
    }

    registerOnChange(fn: Function): void {
        this._onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this._onModelTouched = fn;
    }

    setDisabledState(val: boolean): void {
        this._disabled = val;
    }

    // Ported from jquery-ui datepicker formatDate    
    formatDate(date, format) {
        if (!date) {
            return "";
        }

        let iFormat,
            lookAhead = (match) => {
                let matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                if (matches) {
                    iFormat++;
                }
                return matches;
            },
            formatNumber = (match, value, len) => {
                let num = "" + value;
                if (lookAhead(match)) {
                    while (num.length < len) {
                        num = "0" + num;
                    }
                }
                return num;
            },
            formatName = (match, value, shortNames, longNames) => {
                return (lookAhead(match) ? longNames[value] : shortNames[value]);
            },
            output = "",
            literal = false;

        if (date) {
            for (iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) === "'" && !lookAhead("'"))
                        literal = false;
                    else
                        output += format.charAt(iFormat);
                }
                else {
                    switch (format.charAt(iFormat)) {
                        case "d":
                            output += formatNumber("d", date.getDate(), 2);
                            break;
                        case "D":
                            output += formatName("D", date.getDay(), this._locale.dayNamesShort, this._locale.dayNames);
                            break;
                        case "o":
                            output += formatNumber("o",
                                Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
                            break;
                        case "m":
                            output += formatNumber("m", date.getMonth() + 1, 2);
                            break;
                        case "M":
                            output += formatName("M", date.getMonth(), this._locale.monthNamesShort, this._locale.monthNames);
                            break;
                        case "y":
                            output += (lookAhead("y") ? date.getFullYear() :
                                (date.getFullYear() % 100 < 10 ? "0" : "") + date.getFullYear() % 100);
                            break;
                        case "@":
                            output += date.getTime();
                            break;
                        case "!":
                            output += date.getTime() * 10000 + this._ticksTo1970;
                            break;
                        case "'":
                            if (lookAhead("'"))
                                output += "'";
                            else
                                literal = true;

                            break;
                        default:
                            output += format.charAt(iFormat);
                    }
                }
            }
        }
        return output;
    }

    formatTime(date) {
        if (!date) {
            return '';
        }

        let output = '';
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        if (this._hourFormat == '12' && this._pm && hours != 12) {
            hours -= 12;
            hours = hours < 0 ? hours * -1 : hours;
        }

        output += (hours < 10) ? '0' + hours : hours;
        output += ':';
        output += (minutes < 10) ? '0' + minutes : minutes;

        if (this._showSeconds) {
            output += ':';
            output += (seconds < 10) ? '0' + seconds : seconds;
        }

        if (this._hourFormat == '12') {
            output += this._pm ? ' PM' : ' AM';
        }
        return output;
    }

    parseTime(value) {
        let tokens: string[] = value.split(':');
        let validTokenLength = this._showSeconds ? 3 : 2;

        if (tokens.length !== validTokenLength) {
            throw "Invalid time";
        }

        let h = parseInt(tokens[0]);
        let m = parseInt(tokens[1]);
        let s = this._showSeconds ? parseInt(tokens[2]) : null;

        if (isNaN(h) || isNaN(m) || h > 23 || m > 59 || (this._hourFormat == '12' && h > 12) || (this._showSeconds && (isNaN(s) || s > 59))) {
            throw "Invalid time";
        }
        else {
            if (this._hourFormat == '12' && h !== 12 && this._pm) {
                h += 12;
            }

            return { hour: h, minute: m, second: s };
        }
    }

    // Ported from jquery-ui datepicker parseDate 
    parseDate(value, format) {
        if (format == null || value == null) {
            throw "Invalid arguments";
        }

        value = (typeof value === "object" ? value.toString() : value + "");
        if (value === "") {
            return null;
        }

        let iFormat, dim, extra,
            iValue = 0,
            shortYearCutoff = (typeof this._shortYearCutoff !== "string" ? this._shortYearCutoff : new Date().getFullYear() % 100 + parseInt(this._shortYearCutoff, 10)),
            year = -1,
            month = -1,
            day = -1,
            doy = -1,
            literal = false,
            date,
            lookAhead = (match) => {
                let matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                if (matches) {
                    iFormat++;
                }
                return matches;
            },
            getNumber = (match) => {
                let isDoubled = lookAhead(match),
                    size = (match === "@" ? 14 : (match === "!" ? 20 :
                        (match === "y" && isDoubled ? 4 : (match === "o" ? 3 : 2)))),
                    minSize = (match === "y" ? size : 1),
                    digits = new RegExp("^\\d{" + minSize + "," + size + "}"),
                    num = value.substring(iValue).match(digits);
                if (!num) {
                    throw "Missing number at position " + iValue;
                }
                iValue += num[0].length;
                return parseInt(num[0], 10);
            },
            getName = (match, shortNames, longNames) => {
                let index = -1;
                let arr = lookAhead(match) ? longNames : shortNames;
                let names = [];

                for (let i = 0; i < arr.length; i++) {
                    names.push([i, arr[i]]);
                }
                names.sort((a, b) => {
                    return -(a[1].length - b[1].length);
                });

                for (let i = 0; i < names.length; i++) {
                    let name = names[i][1];
                    if (value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
                        index = names[i][0];
                        iValue += name.length;
                        break;
                    }
                }

                if (index !== -1) {
                    return index + 1;
                } else {
                    throw "Unknown name at position " + iValue;
                }
            },
            checkLiteral = () => {
                if (value.charAt(iValue) !== format.charAt(iFormat)) {
                    throw "Unexpected literal at position " + iValue;
                }
                iValue++;
            };

        for (iFormat = 0; iFormat < format.length; iFormat++) {
            if (literal) {
                if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                    literal = false;
                } else {
                    checkLiteral();
                }
            } else {
                switch (format.charAt(iFormat)) {
                    case "d":
                        day = getNumber("d");
                        break;
                    case "D":
                        getName("D", this._locale.dayNamesShort, this._locale.dayNames);
                        break;
                    case "o":
                        doy = getNumber("o");
                        break;
                    case "m":
                        month = getNumber("m");
                        break;
                    case "M":
                        month = getName("M", this._locale.monthNamesShort, this._locale.monthNames);
                        break;
                    case "y":
                        year = getNumber("y");
                        break;
                    case "@":
                        date = new Date(getNumber("@"));
                        year = date.getFullYear();
                        month = date.getMonth() + 1;
                        day = date.getDate();
                        break;
                    case "!":
                        date = new Date((getNumber("!") - this._ticksTo1970) / 10000);
                        year = date.getFullYear();
                        month = date.getMonth() + 1;
                        day = date.getDate();
                        break;
                    case "'":
                        if (lookAhead("'")) {
                            checkLiteral();
                        } else {
                            literal = true;
                        }
                        break;
                    default:
                        checkLiteral();
                }
            }
        }

        if (iValue < value.length) {
            extra = value.substr(iValue);
            if (!/^\s+/.test(extra)) {
                throw "Extra/unparsed characters found in date: " + extra;
            }
        }

        if (year === -1) {
            year = new Date().getFullYear();
        } else if (year < 100) {
            year += new Date().getFullYear() - new Date().getFullYear() % 100 + (year <= shortYearCutoff ? 0 : -100);
        }

        if (doy > -1) {
            month = 1;
            day = doy;
            do {
                dim = this.getDaysCountInMonth(year, month - 1);
                if (day <= dim) {
                    break;
                }
                month++;
                day -= dim;
            } while (true);
        }

        date = this.daylightSavingAdjust(new Date(year, month - 1, day));
        if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            throw "Invalid date"; // E.g. 31/02/00
        }
        return date;
    }

    daylightSavingAdjust(date) {
        if (!date) {
            return null;
        }
        date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
        return date;
    }

    updateFilledState() {
        this._filled = this._inputFieldValue && this._inputFieldValue != '';
    }

    bindDocumentClickListener() {
        if (!this._documentClickListener) {
            this._documentClickListener = this.renderer.listenGlobal('body', 'click', () => {
                if (this._closeOverlay) {
                    this._overlayVisible = false;
                }

                this._closeOverlay = true;
                this._dateClick = false;
                this.cdr.markForCheck();
            });
        }
    }

    unbindDocumentClickListener() {
        if (this._documentClickListener) {
            this._documentClickListener();
        }
    }

    ngOnDestroy() {
        this.unbindDocumentClickListener();

        if (!this._inline && this.appendTo) {
            this.el.nativeElement.appendChild(this._overlay);
        }
    }

    validate(c: AbstractControl) {
        if (!this._isValid) {
            return { invalidDate: true };
        }

        return null;
    }

    isRequired() {
        return this._required;
    }

    isReadonly() {
        return this._readonlyInput;
    }

    isShowIcon() {
        return this._showIcon;
    }

    isInline() {
        return this._inline;
    }

    isNotInline() {
        return !this.inline;
    }

    isDisabled() {
        return this._disabled;
    }

    isInputDisabled() {
        return this._inputDisabled;
    }

    isTimeOnly() {
        return this._timeOnly;
    }

    isNotTimeOnly() {
        return !this._timeOnly;
    }

    isOverlayVisible() {
        return this._overlayVisible;
    }

    isMonthNavigator() {
        return this._monthNavigator;
    }

    isNotMonthNavigator() {
        return !this._monthNavigator;
    }

    isYearNavigator() {
        return this._yearNavigator;
    }

    isNotYearNavigator() {
        return !this._yearNavigator;
    }

    isShowOtherMonths() {
        return this._showOtherMonths;
    }

    isShowTime() {
        return this._showTime;
    }

    isShowSeconds() {
        return this._showSeconds;
    }

    is12hourClock() {
        return this._hourFormat == '12';
    }

    isOtherMonth(date) {
        return date.otherMonth;
    }

    isNotOtherMonthDate(date) {
        return date.otherMonth ? this._showOtherMonths : true;
    }

    isTodayDate(date) {
        return date.today;
    }

    isDateNotSelectable(date) {
        return !date.selectable;
    }

    setDatesStyle() {
        return this.isInline() ? 'inline-block' : (this.isOverlayVisible() ? 'block' : 'none');
        //return "{'display':" + datesStyle + "}";
    }

    setTimeStyle(val) {
        return val < 10 ? 'inline' : 'none';
    }

    setMeridian() {
        return this._pm ? 'PM' : 'AM';
    }

    datesOverlayState() {
        return this.isInline() ? 'visible' : (this.isOverlayVisible() ? 'visible' : 'hidden');
    }

    getSelectedMonth(monthIndex) {
        return monthIndex == this._currentMonth;
    }

    getSelectedYear(year) {
        return year == this._currentYear;
    }

    openOverlay() {
        this._closeOverlay = false;
    }

    isShowOverlay() {
        return this.isNotTimeOnly() && (this.isOverlayVisible() || this.isInline());
    }

    //
    // End of Public methods
};
