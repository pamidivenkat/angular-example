import { MessageStatus } from '../common/models/message-event.enum';
import { SnackbarModel } from '../common/models/snackbar-model';
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MessageType } from '../common/ae-message.enum';
import { Observable } from 'rxjs';

@Component({
  selector: 'ae-snackbar',
  templateUrl: './ae-snackbar.component.html',
  styleUrls: ['./ae-snackbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AeSnackbarComponent implements OnInit {
  private _iserror: boolean;
  private _messageType: MessageType = MessageType.Info;
  private _snackbarModel: SnackbarModel;

  @Output()
  aeClose: EventEmitter<SnackbarModel> = new EventEmitter();

  @Input('snackbarModel')
  set snackbarModel(val: SnackbarModel) {
    this._snackbarModel = val;
  }
  get snackbarModel() {
    return this._snackbarModel;
  }
  

  close() {
    this.aeClose.emit(this._snackbarModel);
  }

  snackbarMessageType(): string {
    return `${MessageType[this._snackbarModel.MessageType]}`;
  }

  checkSnackbarType(type: string): boolean {
    return this.snackbarMessageType() === type;
  }

  constructor() { }

  ngOnInit() {
    if (this._snackbarModel.MessageStatus !== MessageStatus.InProgress) {
      Observable.timer(3000).first().subscribe(t => {
        this.close();
      });
    }
  }
}