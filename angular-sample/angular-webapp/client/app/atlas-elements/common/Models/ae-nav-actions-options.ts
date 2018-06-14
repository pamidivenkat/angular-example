import { Subject } from 'rxjs/Rx';
import { Tristate } from "../tristate.enum";
export class AeNavActionsOption<T> {

    /**
     * Creates an instance of AeNavActionsOption. It will be overwritten by provided partial objects properties.
     * @param {*} init 
     * 
     * @memberOf AeNavActionsOption
     */
    constructor(text: string, command: Subject<T>, disabled: Tristate, separator?: boolean) {
        this.Text = text;
        this.Command = command;
        this.Disabled = disabled;
        this.Separator = separator;
    }


    /**
     * It represents text of the nav actions
     * 
     * @type {string}
     * @memberOf AeNavActionsOption
     */
    Text: string;

    /**
     * It represents click event of the nav actions
     * 
     * @type {Subject<T>}
     * @memberOf AeNavActionsOption
     */
    Command: Subject<T>;


    /**
     * It represents of disabled feature of nav actions
     * 
     * @type {boolean}
     * @memberOf AeNavActionsOption
     */
    Disabled: Tristate = Tristate.False;

    /**
     * Memeber to add 'separator' class of split button
     * 
     * @type {boolean}
     * @memberOf AeNavActionsOption
     */
    Separator: boolean = false;
}
