import { Action } from './action';
import * as _ from "lodash";

export class ParallelAction extends Action {
    children: Array<Action>;

    run(): Promise<any> {
        const promises = this.children.map(c => c.run);
        return Promise.all(promises);
    }
}