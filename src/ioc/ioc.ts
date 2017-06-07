import "reflect-metadata";

import * as bodyParser from 'body-parser';

import { Controller, InversifyExpressServer, TYPE, interfaces } from 'inversify-express-utils';
import { ICacheService, IPersistenceService, IScheduleService } from '../engine/core';
import { ScenarioHost, ScenarioPool } from '../engine/core';

import { Container } from 'inversify';
import { RedisCacheService } from '../engine/services/redis-cache-service';
import { RedisPersistenceService } from '../engine/services/redis-persistence-service';
import { ScenarioController } from '../api/scenario-controller';
import { ScheduleService } from '../engine/services/schedule-service';
import TAGS from './tags';
import TYPES from './types';

let container = new Container();

/* Controllers */
container.bind<interfaces.Controller>(TYPE.Controller).to(ScenarioController).whenTargetNamed(TAGS.ScenarioController);

/* Engine */
container.bind<ScenarioPool>(TYPES.ScenarioPool).to(ScenarioPool).inSingletonScope();
container.bind<ScenarioHost>(TYPES.ScenarioHost).to(ScenarioHost).inSingletonScope();
container.bind<ICacheService>(TYPES.CacheService).to(RedisCacheService).inSingletonScope();
container.bind<IScheduleService>(TYPES.ScheduleService).to(ScheduleService).inSingletonScope();
container.bind<IPersistenceService>(TYPES.PersistenceService).to(RedisPersistenceService).inSingletonScope();

export default container;
