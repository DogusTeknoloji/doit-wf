import { Action } from './action';
import { property } from '../core';

export class OutputAction extends Action {

    @property
    key: string;

    @property
    variableNames: string[];

    run(): Promise<any> {
        let result = this.variableNames.reduce((acc, curr) => {
            if (this.scenario[curr]) {
                acc[curr] = this.scenario[curr];
            }
            return acc;
        }, {})
        this.scenario.outputs.set(this.key, result);
        return Promise.resolve();
    }
}