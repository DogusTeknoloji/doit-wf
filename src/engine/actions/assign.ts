import { Action } from './action';

export class AssignAction extends Action {

    to: string;
    value: any;

    run() {
        this.scenario[this.to] = this.value;
        return Promise.resolve();
    }
}