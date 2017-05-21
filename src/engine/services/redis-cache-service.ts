import { injectable } from 'inversify';
import { ICacheService } from '../core';
import { LogType, Log } from '../services/logger';
import * as Redis from 'redis';

@injectable()
export class RedisCacheService implements ICacheService {
    private client: Redis.RedisClient;

    constructor() {
        this.client = Redis.createClient();
    }

    get(key: string): Promise<any> {
        return new Promise<void>(async (resolve, reject) => {
            this.client.get(key, (e, r) => {
                if (e != null) {
                    reject(e.message);
                }
                const value = JSON.parse(r);
                resolve(value);
            });
        });
    }

    set(key: string, value: any): Promise<void> {
        if (value == null) return Promise.resolve();
        
        return new Promise<void>(async (resolve, reject) => {
            Log.info(LogType.Cache, `Set ${key}.`);
            this.client.set(key, JSON.stringify(value), (e, r) => {
                if (e != null) {
                    reject(e.message);
                }
                resolve();
            });
        });
    }
}