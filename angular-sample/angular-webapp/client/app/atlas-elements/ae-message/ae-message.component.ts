import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { AeIconSize } from '../../atlas-elements/common/ae-icon-size.enum';
import { AeLabelComponent } from '../ae-label/ae-label.component';
import { MessageType } from '../common/ae-message.enum';

@Component({
    selector: 'ae-message',
    templateUrl: './ae-message.component.html',
    styleUrls: ['./ae-message.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeMessageComponent extends AeLabelComponent {
    // Private Fields
    /**
     *  variable to hold the message type value
     * @private
     * @type {MessageType}
     * @memberOf AeMessageComponent
     */
    private _messageType: MessageType = MessageType.Info;

    /**
     * variable to hold the class value based on the message type 
     * @private
     * @type {string}
     * @memberOf AeMessageComponent
     */
    private _messageTypeClass: string;

    /**
     * Member to assign icon size
     * 
     * @type {AeIconSize}
     * @memberOf AeMessageComponent
     */
    private _iconMedium: AeIconSize = AeIconSize.medium;
    private _showCloseIcon: boolean = true;
    // End of Private Fields

    // Public properties
    get iconMedium(): AeIconSize{
        return this._iconMedium;
    }
    /**
     *  property  message Type with getter and setter methods
     * @readonly
     * @type {MessageType}
     * @memberOf AeMessageComponent
     */
    @Input('messageType')
    get messageType(): MessageType {
        return this._messageType;
    }

    set messageType(messageType: MessageType) {
        this._messageType = messageType;
    }

    @Input('show-close-icon')
    get showCloseIcon(){
       return this._showCloseIcon;
    }
    set showCloseIcon(val: boolean){
        this._showCloseIcon = val;
    }
    // End of Public properties

    // Public Output bindings
    @Output('aeClose')
    private _aeCloseMessage: EventEmitter<any> = new EventEmitter<any>();
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bidnings

    // constructor
    constructor(public cdRef: ChangeDetectorRef) {
        super();
    }
    // End of constructor

    // Private methods
    /**
     * set the visibility of message info class
     * @returns {boolean} 
     * 
     * @memberOf AeMessageComponent
     */
    setVisibilityOfMessageInfoClass(): boolean {
        return this._messageType == MessageType.Info;
    }

    /**
     * set the visibility of message alert class
     * @returns {boolean} 
     * 
     * @memberOf AeMessageComponent
     */
    setVisibilityOfMessageAlertClass(): boolean {
        return this._messageType == MessageType.Alert;
    }

    /**
     *  set the visibility of message warning class
     * @returns {boolean} 
     * 
     * @memberOf AeMessageComponent
     */
    setVisibilityOfMessageWarningClass(): boolean {
        return this._messageType == MessageType.Warning;
    }

    closeMessage(e) {        
        this._aeCloseMessage.emit(e);
    }
    // End of private methods

    // Public Methos

    // End of public methods

}