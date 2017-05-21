import 'reflect-metadata';
import { Scenario } from './scenario';
import { Log, LogType } from '../services/logger';
import * as _ from "lodash";

export const propertyMappings: Map<string, string[]> = new Map<string, string[]>();
export const triggerMappings: Map<string, string[]> = new Map<string, string[]>();

function addPropertyMapping(actionName: string, property: { name: string, type: string }) {
    if (propertyMappings[actionName] == null) {
        propertyMappings[actionName] = [];
    }

    if (_.indexOf(propertyMappings[actionName], property.name) < 0) {
        Log.info(LogType.Engine, `Adding metadata. Action: ${actionName}, Property: ${property.name}/${property.type}`);
        propertyMappings[actionName].push(property);
    }
}

export function property(target: any, key: string) {
    var t = Reflect.getMetadata("design:type", target, key);
    addPropertyMapping(target.constructor.name, { name: key, type: t.name });
}

export function triggers(scenarioId: string, ...triggerNames: string[]) {
    return function (constructor: Function) {
        triggerNames.forEach(t => {
            if (triggerMappings[t] == null) {
                triggerMappings[t] = [];
            }
            Log.info(LogType.Engine, `Adding scenario for trigger ${t}`);
            triggerMappings[t].push(scenarioId);
        });
    }
}

export function getScenarioIds(triggerId: string): string[] {
    return triggerMappings[triggerId];
}
