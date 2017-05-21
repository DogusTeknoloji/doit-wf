export interface ICacheService {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
}