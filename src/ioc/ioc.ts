import { Container } from 'inversify';
import { interfaces, Controller, InversifyExpressServer, TYPE } from 'inversify-express-utils';
import "reflect-metadata";
import * as bodyParser from 'body-parser';
import TYPES from './types';
import TAGS from './tags';
import { ScenarioController } from '../api/scenario-controller';
import { ICacheService, IScheduleService, IPersistenceService } from '../engine/core';
import { RedisCacheService } from '../engine/services/redis-cache-service';
import { ScheduleService } from '../engine/services/schedule-service';
import { RedisPersistenceService } from '../engine/services/redis-persistence-service';
import { ScenarioHost } from '../engine/core';

let container = new Container();

/* Controllers */
container.bind<interfaces.Controller>(TYPE.Controller).to(ScenarioController).whenTargetNamed(TAGS.ScenarioController);

/* Engine */
container.bind<ScenarioHost>(TYPES.ScenarioHost).to(ScenarioHost).inSingletonScope();
container.bind<ICacheService>(TYPES.CacheService).to(RedisCacheService).inSingletonScope();
container.bind<IScheduleService>(TYPES.ScheduleService).to(ScheduleService).inSingletonScope();
container.bind<IPersistenceService>(TYPES.PersistenceService).to(RedisPersistenceService).inSingletonScope();

export default container;
