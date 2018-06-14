import { AeFilterControlType } from '../ae-filter-controltype.enum';
import { AeSelectItem } from '../models/ae-select-item';
import { StringHelper } from '../../../shared/helpers/string-helper';


/**
 * 
 * 
 * @export
 * @class AeFilterItem
 * @template T 
 */
export class AeFilterItem {

constructor(type:AeFilterControlType,controlId:string, controlName:string, displayName:string, filterkeyName:string, placeHolder:string, defaultFilterValue:any = null, filterOptions:AeSelectItem<any>[] = null){
this.Type = type;
this.ControlId = controlId;
this.ControlName = controlName;
this.DisplayName = displayName;
this.FilterkeyName = filterkeyName;
this.PlaceHolder = placeHolder;
this.DefaultFilterValue = defaultFilterValue;
this.FilterOptions = filterOptions;
} 

private _canDisplayLabel : boolean = true;

 get CanDisplayLabel():boolean { return !StringHelper.isNullOrUndefinedOrEmpty(this.DisplayName) }
  
/**
 * Control type to be rendered , for example text box, select box, multi select box, date time
 * 
 * @type {AeFilterControlType}
 * @memberOf AeFilterItem
 */
Type : AeFilterControlType;



/**
 * Control id to be rendered for the filter item
 * 
 * @type {string}
 * @memberOf AeFilterItem
 */
ControlId : string;


/**
 * Control Name to be rendered for the filter item
 * 
 * @type {string}
 * @memberOf AeFilterItem
 */
ControlName : string;


/**
 * Used as label name to be displayed against the filter
 * 
 * @type {string}
 * @memberOf AeFilterItem
 */
DisplayName : string;

/**
 * This is the filter key used to raise API call while filtering a particular entity data
 * 
 * @type {string}
 * @memberOf AeFilterItem
 */
FilterkeyName : string;


/**
 * Placeholder text to be used in fitler control , the same will be used as first value in the select items
 * 
 * @type {string}
 * @memberOf AeFilterItem
 */
PlaceHolder : string;


/**
 * Default fitler value that should be applied for this filter item, mostly applicable to select filter type scenarios
 * 
 * @type {string}
 * @memberOf AeFilterItem
 */
DefaultFilterValue : any;

FilterOptions : AeSelectItem<any>[]

}