import { Action } from './action';
import { property } from '../core';

export class LoopAction extends Action {

    @property
    condition: () => boolean;

    @property
    child: Action;

    async run() {
        while (this.condition()) {
            await this.child.run();
        }
        return Promise.resolve();
    }
}