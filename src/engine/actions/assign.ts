import { Action } from './action';
import * as _ from "lodash";

export class AssignAction extends Action {

    to: string;
    value: any;

    run() {
        return new Promise(async (resolve, reject) => {
            if (_.indexOf(this.scenario.globalVariableNames, this.to) > -1) {
                this.scenario[this.to] = this.value;
                await this.scenario.cacheService.set(this.to, this.value);
                return resolve();
            }
            if (_.indexOf(this.scenario.actorVariableNames, this.to) > -1) {
                this.scenario[this.to] = this.value;
                await this.scenario.cacheService.set(`${this.scenario.uniqueId}_${this.to}`, this.value);
                return resolve();
            }
            resolve();
        });
    }
}