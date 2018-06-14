import { Subject } from 'rxjs/Rx';
import { AeNavActionsOption } from "./ae-nav-actions-options";
import { Tristate } from "../tristate.enum";
import { isNullOrUndefined } from 'util';

export class AeDataTableAction {
    // Private Fields
    private _command: Subject<any>;
    private _dataTableCommand: Subject<any>;
    private _navActionsOption: AeNavActionsOption<any>;
    private _selectorFn: (val: any) => Tristate;
    // End of Private Fields

    // Public Properties
    get command() {
        return this._command;
    }

    get dtCommand() {
        return this._dataTableCommand;
    }

    get navActionsOption() {
        return this._navActionsOption;
    }

    get selectorFn() {
        return this._selectorFn;
    }
    // End of Public Properties

    // Constructors
    /**
     *
     */
    constructor(actionName: string, command: Subject<any>, separator?: boolean, inputSelectorFn?: (val: any) => Tristate) {
        this._command = command;
        this._dataTableCommand = new Subject();
        this._navActionsOption = new AeNavActionsOption(actionName, this._dataTableCommand, Tristate.True, separator);
        if (!isNullOrUndefined(inputSelectorFn)) {
            this._selectorFn = inputSelectorFn;
        } else {
            this._selectorFn = (val) => Tristate.True;
        }

    }
    // End of Constructors
}