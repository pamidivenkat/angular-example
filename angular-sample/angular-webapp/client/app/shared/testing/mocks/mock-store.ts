import { Action, Store } from "@ngrx/store";
import { Subject } from "rxjs/Subject";

export function MockStore<T>({
  actions = new Subject<Action>(),
    states = new Subject<T>()
}: {
        actions?: Subject<Action>,
        states?: Subject<T>
    }): Store<T> {

    let result = states as any;
    result.dispatch = (action: Action) => actions.next(action);
    return result;
}