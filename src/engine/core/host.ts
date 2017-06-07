import * as Async from 'async';
import * as Metadata from './metadata';
import * as _ from 'lodash';
import * as config from 'config';

import { Log, LogType } from '../services/logger';
import { Scenario, ScenarioConstructable } from '../core';
import { inject, injectable } from 'inversify';

import { ICacheService } from './interfaces/cache-service';
import { IPersistenceService } from './interfaces/persistence-service';
import { IScheduleService } from './interfaces/schedule-service';
import { ScenarioPool } from './pool';
import TYPES from '../../ioc/types';
import container from '../../ioc/ioc';

import fs = require('fs');
import path = require('path');

@injectable()
export class ScenarioHost {
    private activeScenarios: Map<string, Array<Scenario>> = new Map<string, Array<Scenario>>();

    constructor( @inject(TYPES.CacheService) public cacheService: ICacheService,
        @inject(TYPES.ScheduleService) public scheduleService: IScheduleService,
        @inject(TYPES.PersistenceService) public persistenceService: IPersistenceService,
        @inject(TYPES.ScenarioPool) public scenarioPool: ScenarioPool) { }

    fire(triggerId: string, uniqueId: string, inputs: Map<string, any>): Promise<any> {
        return new Promise((resolve, reject) => {
            const scenarioIds = Metadata.triggerMappings.get(triggerId);

            Async.map(scenarioIds, async (id, cb) => {
                const data = await this.persistenceService.load(id, uniqueId);
                const instance = this.scenarioPool.acquire(id);
                instance.uniqueId = uniqueId;
                if (data != null) instance.loadPersistenceData(data);
                cb(null, instance);
            }, (err, instances: Scenario[]) => {
                if (err) {
                    return reject('Error executing scenarios.');
                }

                const results = Promise.all(_.map(instances, async instance => {
                    const id = instance.id;
                    const result = await instance.fire(triggerId, inputs);
                    console.log(result);
                    await this.persistenceService.save(instance.id, instance.uniqueId, instance.getPersistenceData());
                    this.scenarioPool.release(instance);
                    return {
                        scenarioId: id,
                        output: result || []
                    };
                }));
                instances = [];
                resolve(results);
            });
        });
    }

    suspend(id: string): Promise<boolean> {
        return null;
    }

    resume(id: string): Promise<boolean> {
        return null;
    }

    terminate(id: string): Promise<boolean> {
        return null;
    }
}