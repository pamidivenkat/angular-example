import { BaseElement } from '../common/base-element';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ae-accordion',
  templateUrl: './ae-accordion.component.html',
  styleUrls: ['./ae-accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeAccordionComponent extends BaseElement implements OnInit {

  private _titleText: string = "Title Text";

  /**
   * Holds banner title text.
   * 
   * get/setter property
   * 
   * @memberOf AeBannerComponent
   */
  @Input('titleText')
  get titleText() {
    return this._titleText;
  }
  set titleText(val: string) {
    this._titleText = val;
  }

  ngOnInit() {
  }

}
