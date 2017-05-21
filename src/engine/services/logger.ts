import * as Winston from 'winston';
import * as _ from 'lodash';

export enum LogType {
    Api,
    Actions,
    Builders,
    Cache,
    Engine
}

Winston.loggers.add('Api', { console: { colorize: true, label: 'Api' } });
Winston.loggers.add('Actions', { console: { colorize: true, label: 'Actions' } });
Winston.loggers.add('Builders', { console: { colorize: true, label: 'Builders' } });
Winston.loggers.add('Cache', { console: { colorize: true, label: 'Cache' } });
Winston.loggers.add('Engine', { console: { colorize: true, label: 'Engine' } });

export class Log {
    static info(type: LogType, msg: string) {
        Winston.loggers.get(LogType[type]).info(msg);
    }

    static warn(type, msg: string) {
        Winston.loggers.get(LogType[type]).warn(msg);
    }

    static error(type, msg: string) {
        Winston.loggers.get(LogType[type]).error(msg);
    }
}
