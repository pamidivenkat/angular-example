import { StringHelper } from '../../../shared/helpers/string-helper';
import { AeListStyle } from '../ae-list-style.enum';

export class AeListItem {

    /**
     * Represents Title of list item. 
     * 
     * @type {string}
     * @memberOf AeListItem
     */
    Text: string;


    /**
     * Represents order index of list item. 
     * 
     * @type {Number}
     * @memberOf AeListItem
     */
    OrderIndex: number;

    /**
     * Whether to show action link for a list item.
     * 
     * @type {boolean}
     * @memberOf AeListItem
     */
    HasAction: boolean;

     /**
     * Whether to decide item can be clicked or not
     * 
     * @type {boolean}
     * @memberOf AeListItem
     */
    IsClickable: boolean;


    /**
     * Represnts type of a list item. It can be 'normal' 'notification'
     * 
     * @type {AeListStyle}
     * @memberOf AeListItem
     */
    ItemType: AeListStyle;    


    /**
     * Represents title of action link.
     * 
     * @type {string}
     * @memberOf AeListItem
     */
    LinkText:string;


    /**
     * Creates an instance of AeListItem. It will accept partial object representation of AeListItem class as a parameter.
     * Here current instance's properties will be overwritten by provided partial object's properties   
     * @param {*} [init] 
     * 
     * @memberOf AeListItem
     */
    constructor(init?:any){
        this.HasAction=false;
        this.ItemType=AeListStyle.Normal;
        this.LinkText="Go Somewhere";        
        Object.assign(this, init);
    }


    /**
     * To check whether a list item is of type 'Notification' 
     * 
     * get property
     * 
     * @type {boolean}     * 
     * @memberOf AeListItem
     */
    get requireBoarderColor(){
        return this.ItemType == AeListStyle.Read || this.ItemType == AeListStyle.UnRead;
    }
}