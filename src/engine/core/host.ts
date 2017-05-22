import { inject, injectable } from 'inversify';
import { Scenario, ScenarioConstructable } from '../core';
import { ICacheService } from './interfaces/cache-service';
import { IScheduleService } from './interfaces/schedule-service';
import { IPersistenceService } from './interfaces/persistence-service';
import { LogType, Log } from '../services/logger';
import * as Metadata from './metadata';
import container from '../../ioc/ioc';
import TYPES from '../../ioc/types';
import fs = require('fs');
import path = require('path');
import * as _ from 'lodash';

@injectable()
export class ScenarioHost {
    private scenarioConstructors: Map<string, ScenarioConstructable> = new Map<string, ScenarioConstructable>();
    private activeScenarios: Map<string, Array<Scenario>> = new Map<string, Array<Scenario>>();

    constructor( @inject(TYPES.CacheService) public cacheService: ICacheService,
        @inject(TYPES.ScheduleService) public scheduleService: IScheduleService,
        @inject(TYPES.PersistenceService) public persistenceService: IPersistenceService) { }

    start() {
        this.loadScenarios();
    }

    stop() {
    }

    loadScenarios() {
        const folder = path.join(__dirname, '..', '..', 'scenarios');
        if (!fs.existsSync(folder)) return;

        const files = _(fs.readdirSync(folder))
            .filter(f => _.endsWith(f, '.js'))
            .each(f => {
                const name = path.parse(f).name;
                const scenario = require(path.join(folder, f)).Scenario as ScenarioConstructable;
                this.scenarioConstructors.set(name, scenario);
                Log.info(LogType.Engine, `Scenario ${name} loaded.`);
            });
    }

    fire(triggerId: string, uniqueId: string, inputs: Map<string, any>): Promise<any> {
        const key = `${triggerId}_${uniqueId}`;

        let instances = this.activeScenarios.get(key);
        if (instances == null) {
            this.activeScenarios.set(key, instances = []);
        }

        const scenarioIds = Metadata.triggerMappings[triggerId];
        _.each(scenarioIds, id => {
            if (!_.find(instances, i => i.id === id)) {
                const cstr = this.scenarioConstructors.get(id);
                const instance = new cstr(uniqueId, this.cacheService, this.scheduleService, this.persistenceService) as Scenario;
                instance.build();
                this.activeScenarios.get(key).push(instance);
                instances = this.activeScenarios.get(key);
            }
        });

        const results = Promise.all(_.map(instances, async instance => {
            const result = await instance.fire(triggerId, inputs);
            return {
                scenarioId: instance.id,
                output: result || []
            };
        }));
        return results;
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