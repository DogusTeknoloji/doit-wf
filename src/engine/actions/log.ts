import { Action } from './action';
import { Log, LogType } from '../services/logger';

export class LogAction extends Action {
    message: string;

    run(): Promise<any> {
        Log.info(LogType.Actions, this.message);
        return Promise.resolve();
    }
}