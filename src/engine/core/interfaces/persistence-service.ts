import { Scenario } from '../scenario';
import { Variable, PersistenceData } from './persistence-data';

export interface IPersistenceService {
    save(scenarioId: string, uniqueId: string, data: PersistenceData): Promise<void>;
    load(scenarioId: string, uniqueId: string): Promise<PersistenceData>;
}