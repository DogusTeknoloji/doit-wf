import { Action } from './action';
import { property } from '../core';

export class PersistAction extends Action {

    run(input?: any) {
        return Promise.resolve();
    }
}