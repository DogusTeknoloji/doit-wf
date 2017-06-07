import { IPersistenceService, Scenario, Variable, PersistenceData } from '../core';
import { injectable } from 'inversify';
import * as Redis from 'redis';

@injectable()
export class RedisPersistenceService implements IPersistenceService {
    private client: Redis.RedisClient;

    constructor() {
        this.client = Redis.createClient();
    }

    save(scenarioId: string, uniqueId: string, data: PersistenceData): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const key = `${scenarioId}_${uniqueId}`;
            this.client.set(key, JSON.stringify(data), (e, r) => {
                if (e != null) {
                    reject(e.message);
                }
                resolve();
            });
        });
    }

    load(scenarioId: string, uniqueId: string): Promise<PersistenceData> {
        return new Promise<PersistenceData>(async (resolve, reject) => {
            const key = `${scenarioId}_${uniqueId}`;
            this.client.get(key, (e, r) => {
                if (e != null) {
                    reject(e.message);
                }
                const value = JSON.parse(r);
                resolve(value);
            });
        });
    }
}