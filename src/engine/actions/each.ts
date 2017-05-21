import { Action } from './action';
import { property } from '../core';
import * as _ from "lodash";

export enum EachExecutionMode {
    sequential,
    parallel
}

export class EachAction extends Action {

    @property
    itemsSource: any;

    @property
    child: Action;

    @property
    executionMode: EachExecutionMode;

    run() {
        const items = this.scenario[this.itemsSource];
        if (items == null) return Promise.reject('Items source could not be found.');

        if (this.executionMode == EachExecutionMode.sequential) {
            _.each(this.itemsSource, async i => {
                await this.child.run(i);
            });
            return Promise.resolve();
        }

        const promises = _.map(this.itemsSource, i => this.child.run(i));
        return Promise.all(promises);
    }
}