import { AeIconComponent } from '../ae-icon/ae-icon.component';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';

/**
 * Statistic component contains Statistic Icons, Statistic count and Statistic Name. We are using it in dashbard sections
 * Have Options to change Statistic Icon, Statistic Count value and Statistic color, Statistic Name and Statistic Name color.
 * 
 * @export
 * @class AeStatisticComponent
 * @extends {AeIconComponent}
 */
@Component({
  selector: 'ae-statistic',
  templateUrl: './ae-statistic.component.html',
  styleUrls: ['./ae-statistic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AeStatisticComponent extends AeIconComponent {


  // Private Fields
  private _numbercolor: string;
  private _iconColor: string;
  private _numberVal: number = 18;
  private _nameVal = 'Statistic name';
  private _tooltip: string;
  // End of Private Fields

  // Public properties
  /**
  * Input value for Statistic count color
  * 
  * @type string
  * get/set property
  * 
  * @memberOf AeStatisticComponent
  */
  @Input('numbercolor')
  get numbercolor() { 
    return this._numbercolor; 
  }
  set numbercolor(value: string) { 
    this._numbercolor = value;
   }

  /**
  * Input value for Statistic name color
  * 
  * @type string
  * get/set property
  * 
  * @memberOf AeStatisticComponent
  */
  @Input('iconColor')
  get iconColor() { 
    return this._iconColor; 
  }
  set iconColor(value: string) { 
    this._iconColor = value; 
  }

  /**
  * Input value for Statistic count value
  * 
  * @type number
  * get/set property
  * 
  * @memberOf AeStatisticComponent
  */
  @Input('numberval')
  get numberText() { 
    return this._numberVal;
   }
  set numberText(value: number) { 
    this._numberVal = value;
   }

  /**
  * Input value for Statistic name value
  * 
  * @type string
  * get/set property
  * 
  * @memberOf AeStatisticComponent
  */
  @Input('nametext')
  get nameText() { 
    return this._nameVal; 
  }
  set nameText(value: string) { 
    this._nameVal = value;
   }

  @Input('tooltip')
  get tooltip() { 
    return this._tooltip;
   }
  set tooltip(value: string) { 
    this._tooltip = value; 
  }

  @Output()
  aeClick: EventEmitter<any> = new EventEmitter<any>()
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ViewContent bindings
  // End of Public ViewContent bindings

  // Constructor
  // End of constructor

  // Private methods
  onClick(event) {  
    this.aeClick.emit(event);
  // End of private methods

  // Public methods
  // End of public methods

  }
 
}
