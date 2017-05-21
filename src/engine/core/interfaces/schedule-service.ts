import { Action } from '../../actions';

export interface IScheduleService {
    createJob(name: string, action: Action, date: Date);
}