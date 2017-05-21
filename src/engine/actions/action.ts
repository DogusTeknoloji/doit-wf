import { Scenario } from '../core';

export abstract class Action {
    constructor(protected scenario: Scenario) { }
    abstract run(input?: any): Promise<any>;
}