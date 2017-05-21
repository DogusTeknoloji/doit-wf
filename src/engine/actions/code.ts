import { Action } from './action';
import { property } from '../core';

export class CodeAction extends Action {

    @property
    code: () => Promise<any>;

    @property
    test: string;

    run(input?: any) {
        return this.code();
    }
}