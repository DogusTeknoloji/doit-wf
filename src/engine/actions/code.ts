import { Action } from './action';
import { property } from '../core';

export class CodeAction extends Action {

    @property
    code: () => Promise<any>;

    run(input?: any) {
        return this.code();
    }
}