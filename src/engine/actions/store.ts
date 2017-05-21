import { Action } from './action';
import { LogType, Log } from '../services/logger';

export enum StoreType {
    global,
    actor
}

export class StoreAction extends Action {
    key: string;
    type: StoreType;

    run() {
        switch (this.type) {
            case StoreType.global:
                return this.scenario.cacheService.set(this.key, this.scenario[this.key]);
            case StoreType.actor:
                return this.scenario.cacheService.set(`${this.scenario.uniqueId}_${this.key}`, this.scenario[this.key]);
        }
        return Promise.resolve();
    }
}