import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../shared/base-component';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output
} from '@angular/core';
import { AeInformationBarItem } from '../common/models/ae-informationbar-item';
import { BaseElement } from '../common/base-element';
import { AeIconSize } from '../common/ae-icon-size.enum';
import * as Immutable from 'immutable';
import { StringHelper } from '../../shared/helpers/string-helper';

@Component({
	selector: 'ae-informationbar',
	templateUrl: './ae-informationbar.component.html',
	styleUrls: ['./ae-informationbar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class AeInformationbarComponent extends BaseComponent implements OnInit {

	// Private Fields
	private _items: Immutable.List<AeInformationBarItem>;
	private _iconSize: AeIconSize = AeIconSize.medium;
	private _color: string = '#009494';
	private _titleColour: string = '#3d3d3d';
	private _numberColour: string = '#3d3d3d';

	// End of Private Fields

	// Public properties

	@Input('items')
	set items(value: Immutable.List<AeInformationBarItem>) {
		this._items = value;
	}
	get items() {
		return this._items;
	}


	set iconSize(value: AeIconSize) {
		this._iconSize = value;
	}
	get iconSize() {
		return this._iconSize;
	}


	get color() {
		return this._color;
	}
	set color(value: string) {
		this._color = value;
	}

	get titleColour() {
		return this._titleColour;
	}
	set titleColour(value: string) {
		this._titleColour = value;
	}


	get numberColour() {
		return this._numberColour;
	}
	set numberColour(value: string) {
		this._numberColour = value;
	}

	// End of Public properties

	// Public Output bindings
	// End of Public Output bindings

	// Public ViewChild bindings
	// End of Public ViewChild bindings

	// Public ViewContent bindings
	// End of Public ViewContent bindings

	// Constructor
	constructor(protected _localeService: LocaleService, protected _translationService: TranslationService, protected _cdRef: ChangeDetectorRef) {
		super(_localeService, _translationService, _cdRef);
	}
	// End of constructor

	// Private methods

	requireNotification(item: AeInformationBarItem): boolean {
		return item.RequireNotification;
	}
	ngOnInit() {
		//super.ngOnInit();
	}
	// End of private methods

	// Public methods	
	@Output()
	aeClick: EventEmitter<any> = new EventEmitter<any>()

	onClick(item: AeInformationBarItem) {
		if (item.Clickable) {
			this.aeClick.emit(item);
		}
	}

	getToolTip(tooltip: string): string {
		return this.translation.translate(tooltip);
	}

	hasNoAction(val: boolean) {
		return !StringHelper.coerceBooleanProperty(val) ? true : null;
	}
	// End of public methods
}
