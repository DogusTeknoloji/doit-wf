import { Action } from './action';
import * as _ from "lodash";

export class AssignAction extends Action {

    to: string;
    value: any;

    run() {
        return new Promise(async (resolve, reject) => {
            let key: string;
            if (_.indexOf(this.scenario.globalVariableNames, this.to) > -1) {
                key = this.to;
            } else if (_.indexOf(this.scenario.actorVariableNames, this.to) > -1) {
                key = `${this.scenario.uniqueId}_${this.to}`;
            } else {
                return reject(`No variable with the name ${this.to} found.`);
            }
            this.scenario[this.to] = this.value;
            await this.scenario.cacheService.set(this.to, this.value);
            resolve();
        });
    }
}