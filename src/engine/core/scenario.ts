import container from '../../ioc/ioc';
import { inject } from 'inversify';
import TYPES from '../../ioc/types';
import { State } from './state';
import { Trigger } from './trigger';
import * as _ from "lodash";
import { ICacheService } from './interfaces/cache-service';
import { IScheduleService } from './interfaces/schedule-service';
import { IPersistenceService } from './interfaces/persistence-service';

export interface ScenarioConstructor { }

export interface ScenarioConstructable {
    new (uniqueId: string, 
        cacheService: ICacheService, 
        scheduleService: IScheduleService, 
        persistenceService: IPersistenceService): ScenarioConstructor;
}

export abstract class Scenario implements ScenarioConstructor {
    id: string;
    version: number;
    currentState: State;
    triggerIds: string[];

    // TODO: Only instantiate if there's an output action in the flow
    outputs: Map<string, any> = new Map<string, any>();

    public globalVariableNames: Array<string> = [];
    public actorVariableNames: Array<string> = [];
    public scenarioVariableNames: Array<string> = [];
    protected states: Array<State>;
    protected triggers: Array<Trigger>;

    constructor(public uniqueId: string,
        public cacheService: ICacheService, 
        public scheduleService: IScheduleService, 
        public persistenceService: IPersistenceService) { }

    abstract build(): void;

    async fire(triggerId: string, inputs: Map<string, any>): Promise<any> {
        // Clear output parameters
        this.outputs.clear()

        // Load all cached variables TODO: Run before actions only if needed.
        await this.loadVariables();

        // Store parameters in scenario variables if the names exist
        if (inputs != null && inputs.size > 0) {
            inputs.forEach((v, k) => {
                if (_.has(this, k)) {
                    this[k] = v;
                }
            });
        }

        return await this.fireInternal(triggerId);
    }

    private async fireInternal(triggerId: string) {
        let trigger = _.find(this.triggers, t => t.id == triggerId);

        if (trigger == null) return Promise.reject(`No trigger found with the id: ${triggerId}`);

        if (trigger.source === this.currentState) {

            try {
                if (trigger.source.exit) {
                    await trigger.source.exit.run();
                }

                await trigger.fire();
                this.currentState = trigger.target;

                if (trigger.target.entry) {
                    await trigger.target.entry.run();
                }

            } catch (error) {
                return Promise.reject(`Error executing action for ${trigger.description}`);
            }

            if (this.outputs.size > 0) {
                const output = {};
                for (const [k, v] of this.outputs) {
                    output[k] = v;
                }
                return Promise.resolve(output);
            } else {
                return Promise.resolve();
            }
        }

        return Promise.reject(`Invalid transition to ${trigger.target.description}`);
    }

    getPersistenceData() {
        return {
            state: this.currentState.id,
            scenarioVariables: this.scenarioVariableNames.map(n => ({ name: n, value: this[n] }))
        };
    }

    loadPersistenceData(data: any) {
        _.each(data.scenarioVariables, v => {
            this[v.name] = v.value;
        });
        this.currentState = _.find(this.states, s => s.id == data.state);
    }

    async loadVariables(): Promise<any> {
        await Promise.all(_.concat(
            this.globalVariableNames.map(async v => this[v] = await this.cacheService.get(v)),
            this.actorVariableNames.map(async v => this[v] = await this.cacheService.get(`${this.uniqueId}_${v}`))
        ));
    }
}