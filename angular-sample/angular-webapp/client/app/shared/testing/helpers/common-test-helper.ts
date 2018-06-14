import { By } from '@angular/platform-browser';
import { EventListener, DebugElement } from '@angular/core/src/debug/debug_node';
import { isNullOrUndefined } from 'util';
import { AeDataTableAction } from './../../../atlas-elements/common/models/ae-data-table-action';

export class CommonTestHelper {
    static hasGivenButton(btnArray: Array<AeDataTableAction>, btnTxt: string) {
        let btn = btnArray.filter(obj => !isNullOrUndefined(obj.navActionsOption.Text) && obj.navActionsOption.Text.toLowerCase() == btnTxt.toLowerCase());
        if (!isNullOrUndefined(btn) && btn.length == 1)
            return true;
        else
            false;

    }
    static getGivenButton(btnArray: Array<AeDataTableAction>, btnTxt: string) {
        let btn = btnArray.filter(obj => !isNullOrUndefined(obj.navActionsOption.Text) && obj.navActionsOption.Text.toLowerCase() == btnTxt.toLowerCase());
        if (!isNullOrUndefined(btn) && btn.length == 1)
            return btn[0];
        else
            null;

    }
    static hasGivenEvent(eventArray: Array<EventListener>, eventName: string) {
        let btn = eventArray.filter(obj => !isNullOrUndefined(obj.name) && obj.name.toLowerCase() == eventName.toLowerCase());
        if (!isNullOrUndefined(btn) && btn.length == 1)
            return true;
        else
            false;

    }
    static prepareObjectWithGivenkeys(keys: Array<string>) {
        let contextItem = Object.create(null);
        keys.forEach((val, key) => {
            contextItem[val] = null;
        });
        return contextItem;
    }

    static copyObject(sourceObject: any, destinationObject: any) {
        for (var property in destinationObject) {
            destinationObject[property] = sourceObject[property];
            // if (destinationObject.hasOwnProperty(property)) {
            //     if (typeof destinationObject[property] == "object")
            //         CommonTestHelper.copyObject(sourceObject[property], destinationObject[property]);
            //     else

            // }
        }
        return destinationObject;
    }


    static columnAssertFun(columnDivArray: DebugElement[], columnIndex: number, columnNameKey: string, hasSort: boolean, sortKey: string) {
        let divHeader = columnDivArray[columnIndex];
        let spanHeader: HTMLSpanElement = divHeader.query(By.css('span')).nativeElement;
        expect(spanHeader.innerHTML).toEqual(columnNameKey);
        let divHeaderNative = <HTMLDivElement>divHeader.nativeElement;
        if (hasSort) {
            expect(divHeaderNative.classList).toContain('js-sortable');
            let divDataAttr: HTMLDivElement = divHeader.query(By.css('div')).nativeElement
            let att: NamedNodeMap = divDataAttr.attributes;
            expect((att.getNamedItem('data-sortable').value).trim()).toEqual('true');
            expect(att.getNamedItem('data-sortKey').value.toLowerCase()).toEqual(sortKey.toLowerCase());
        }
    }

}
