import * as _ from 'lodash';

import { Log, LogType } from '../services/logger';
import { Scenario, ScenarioConstructable } from '../core';
import { inject, injectable } from 'inversify';

import { ICacheService } from './interfaces/cache-service';
import { IPersistenceService } from './interfaces/persistence-service';
import { IScheduleService } from './interfaces/schedule-service';
import TYPES from '../../ioc/types';
import container from '../../ioc/ioc';

import fs = require('fs');
import path = require('path');

class Pool {
    private freeObjects: Array<Scenario>;
    private expansion = 1;

    public get freeObjectCount() {
        return this.freeObjects.length;
    }

    constructor(private scenarioId: string,
        private scenarioConstructor: ScenarioConstructable,
        initialSize: number,
        private cacheService: ICacheService,
        private scheduleService: IScheduleService,
        private persistenceService: IPersistenceService) {
        this.freeObjects = new Array<Scenario>();
        this.fill(initialSize);
    }

    private fill(size) {
        _.times(size, () => {
            const scenario = <Scenario>new this.scenarioConstructor('', this.cacheService, this.scheduleService, this.persistenceService);
            this.freeObjects.push(scenario);
        });
    }

    acquire() {
        if (this.freeObjects.length <= 0) {
            this.expansion = Math.round(this.expansion * 1.2) + 1;
            this.fill(this.expansion);
        }

        return this.freeObjects.pop();
    }

    release(scenario: Scenario) {
        this.freeObjects.push(scenario);
    }
}

@injectable()
export class ScenarioPool {
    // TODO: Get all parameters from dynamic configuration
    private MINIMUM_POOL_SIZE = 10;

    private constructors: Map<string, ScenarioConstructable> = new Map<string, ScenarioConstructable>();
    private pools: Map<string, Pool> = new Map<string, Pool>();

    constructor( @inject(TYPES.CacheService) public cacheService: ICacheService,
        @inject(TYPES.ScheduleService) public scheduleService: IScheduleService,
        @inject(TYPES.PersistenceService) public persistenceService: IPersistenceService) {

        const folder = path.join(__dirname, '..', '..', 'scenarios');
        if (!fs.existsSync(folder)) return;

        const files = _(fs.readdirSync(folder))
            .filter(f => _.endsWith(f, '.js'))
            .each(f => {
                const name = path.parse(f).name;
                const scenario = <ScenarioConstructable>require(path.join(folder, f)).Scenario;
                this.constructors.set(name, scenario);

                const pool = new Pool(name, scenario, this.MINIMUM_POOL_SIZE, this.cacheService, this.scheduleService, this.persistenceService);
                this.pools.set(name, pool);
            });
    }

    acquire(scenarioId: string) {
        const scenario = this.pools.get(scenarioId).acquire();
        return scenario;
    }

    release(scenario: Scenario) {
        this.pools.get(scenario.id).release(scenario);
    }
}