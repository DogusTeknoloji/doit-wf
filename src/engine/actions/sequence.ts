import { Action } from './action';
import * as _ from "lodash";

export class SequenceAction extends Action {
    children: Array<Action>;

    run(): Promise<any> {
        return new Promise((resolve, reject) => {
            const tasks = this.children.map(c => c.run);
            tasks.reduce((cur, next) => {
                return cur.then(next);
            }, Promise.resolve()).then(() => {
                resolve();
            }).catch(() => reject());
        });
    }
}