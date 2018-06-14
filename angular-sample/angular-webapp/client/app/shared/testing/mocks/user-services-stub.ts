import { UserList } from '../../models/lookup.models';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { extractUserSelectOptionListData } from '../../helpers/extract-helpers';
import { MockStoreProviderFactory } from './mock-store-provider-factory';

@Injectable()
export class UserServiceStub {
    private getFilteredUserData(query: string): Observable<AeSelectItem<string>[]> {
        let items = this.extractUserSelectOptionListData(MockStoreProviderFactory.getUsersStub())
        return Observable.of(items);
    }

    private extractUserSelectOptionListData(response: any): AeSelectItem<string>[] {
        let salaryJobTitle = Array.from(response.Entities) as UserList[];
        return salaryJobTitle.map((keyValuePair) => {
            let aeSelectItem = new AeSelectItem<string>(keyValuePair.FirstName + ' ' + keyValuePair.LastName, keyValuePair.Id, false);
            aeSelectItem.Childrens = null;
            return aeSelectItem;
        });
    }
}
