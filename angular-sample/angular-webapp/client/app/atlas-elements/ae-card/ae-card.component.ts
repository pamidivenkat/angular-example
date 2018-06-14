import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ae-card',
  templateUrl: './ae-card.component.html',
  styleUrls: ['./ae-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class AeCardComponent implements OnInit {

  /**
   * By default shadow and border displayed to card
   * 
   * @private
   * @type {boolean}
   * @memberOf AeCardComponent
   */
  private _isShadow: boolean = true;
  
  /**
   * Member to pass input vale true/false
   * 
   * @readonly
   * 
   * @memberOf AeCardComponent
   */
  @Input('isShadow')
  get isShadow() {return this._isShadow; }
  set isShadow(val: boolean) { this._isShadow = val; }

  ngOnInit() {
  }

  /**
   * Member to return value 
   * 
   * @private
   * @returns 
   * 
   * @memberOf AeCardComponent
   */
  private _shadowClass(){
    return this._isShadow;
  }
}
