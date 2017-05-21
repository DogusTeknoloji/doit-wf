import { Action } from './action';
import { property } from '../core';
import humanInterval = require('human-interval');
import * as moment from 'moment';

export enum AsyncScheduleType {
    now,
    interval,
    date
}

export class AsyncAction extends Action {

    @property
    scheduleType: AsyncScheduleType;

    @property
    interval: string;

    @property
    date: Date;

    @property
    child: Action;

    run() {
        return new Promise(async (resolve, reject) => {
            switch (this.scheduleType) {
                case AsyncScheduleType.now:
                    resolve();
                    await this.child.run();
                    break;

                case AsyncScheduleType.interval:
                    setTimeout(async () => {
                        await this.child.run();
                    }, humanInterval(this.interval))
                    resolve();
                    break;

                case AsyncScheduleType.date:
                    const interval = moment().subtract(moment(this.date)).milliseconds;
                    setTimeout(async () => {
                        await this.child.run();
                    }, humanInterval(interval))
                    resolve();
                    break;
            }
        });
    }
}