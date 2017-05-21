import { IScheduleService } from '../core';
import { Action } from '../actions';
import { inject, injectable } from 'inversify';

@injectable()
export class ScheduleService implements IScheduleService {
    createJob(name: string, action: Action, date: Date) {
        console.log('${name} job created.');
    }
}