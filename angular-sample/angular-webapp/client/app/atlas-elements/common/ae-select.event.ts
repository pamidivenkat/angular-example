import { AeSelectItem } from './models/ae-select-item';
export interface AeSelectEvent<T>{
    Event:Event,
    SelectedValue:string;
    SelectedItem:AeSelectItem<T>
}