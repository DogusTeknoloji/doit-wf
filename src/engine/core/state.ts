import { Action } from '../actions';
import { Trigger } from './trigger';

export class State {
    entry: Action;
    exit: Action;

    constructor(public id:string, public description: string) { }
}