
import { AeLoaderType } from '../common/ae-loader-type.enum';
import { AePosition } from '../common/ae-position.enum';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ae-loader',
  templateUrl: './ae-loader.component.html',
  styleUrls: ['./ae-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeLoaderComponent implements OnInit {

  private _loaderType: AeLoaderType = AeLoaderType.Spinner;

  /**
   * Memeber to pass loader type, by default spinner
   * 
   * @returns {boolean} 
   * 
   * @memberOf AeLoaderComponent
   */
  @Input('loaderType')
  get loaderType() {
    return this._loaderType;
  }
  set loaderType(val: AeLoaderType) {
    this._loaderType = val;
  }
  // loader type spinner return
  isSpinner(): boolean {
    return this._loaderType == AeLoaderType.Spinner;
  }
  // loader type bars return
  isBars(): boolean {
    return this._loaderType == AeLoaderType.Bars;
  }

  constructor() { }

  ngOnInit() {
  }

}