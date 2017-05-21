import { ICacheService } from '../core';

export class InMemoryCacheService implements ICacheService {
    get(key: string): Promise<any> {
        return Promise.resolve();
    }

    set(key: string, value: any): Promise<void> {
        console.log(`Set ${key}.`);
        return Promise.resolve();
    }
}