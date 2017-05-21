import { Action } from '../actions';
import { State } from './state';

export class Trigger {
    condition: () => boolean;
    action: Action;
    source: State;
    target: State;

    constructor(public id: string, public description: string) { }

    fire(): Promise<any> {
        if (this.condition()) {
            if (this.action) {
                return this.action.run();
            }
            else {
                return Promise.resolve();
            }
        }
    }
}