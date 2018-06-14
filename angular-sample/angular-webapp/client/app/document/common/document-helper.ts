import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import * as Immutable from 'immutable';

export function getDocumentActionStatus(): Immutable.List<AeSelectItem<string>> {
    return Immutable.List([new AeSelectItem<string>('Awaiting Action','1'), new AeSelectItem<string>('Actioned','2'),])
}