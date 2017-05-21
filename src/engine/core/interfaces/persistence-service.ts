import { Scenario } from '../scenario';

export interface IPersistenceService {
    save(scenario: Scenario): Promise<any>;
    load(scenarioId: string, uniqueId: string): Promise<any>;
}