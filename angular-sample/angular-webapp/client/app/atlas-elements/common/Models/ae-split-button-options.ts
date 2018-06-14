import { Subject } from 'rxjs/Rx';
export class AeSplitButtonOption<T> {

    /**
     * Creates an instance of AeSplitButtonOptions. It will be overwritten by provided partial objects properties.
     * @param {*} init 
     * 
     * @memberOf AeSplitButtonOptions
     */
    constructor(text: string, command: Subject<T>, disabled: boolean, separator?: boolean) {
        this.Text = text;
        this.Command = command;
        this.Disabled = disabled;
        this.Separator = separator;
    }


    /**
     * It represents text of the split button
     * 
     * @type {string}
     * @memberOf AeSplitButtonOptions
     */
    Text: string;

    /**
     * It represents click event of the split button
     * 
     * @type {Subject<T>}
     * @memberOf AeSplitButtonOptions
     */
    Command: Subject<T>;


    /**
     * It represents of disabled feature of split button
     * 
     * @type {boolean}
     * @memberOf AeSplitButtonOptions
     */
    Disabled: boolean = false;

    /**
     * Memeber to add 'separator' class of split button
     * 
     * @type {boolean}
     * @memberOf AeSplitButtonOptions
     */
    Separator: boolean = false;
}
