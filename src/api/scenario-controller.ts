import { Controller, Get, Post, Put, Delete } from 'inversify-express-utils';
import { injectable, inject } from 'inversify';
import { Request } from 'express';
import { ScenarioHost } from '../engine/core';
import { ScenarioBuilder } from '../engine/core/builder';
import { ScenarioCompiler } from '../engine/core/compiler';
import TYPES from '../ioc/types';
import * as _ from 'lodash';
import fs = require('fs');
import path = require('path');

@injectable()
@Controller('/scenario')
export class ScenarioController {

  constructor( @inject(TYPES.ScenarioHost) private scenarioHost: ScenarioHost) { }

  @Post('/build')
  public build(request: Request): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const builder = new ScenarioBuilder();
      const source = builder.build(request.body);

      const compiler = new ScenarioCompiler();
      const results = await compiler.compile(request.body.id, source);
      if (results.length > 0) {
        return reject({ success: false, message: results });
      }

      this.scenarioHost.loadScenarios();
      
      return resolve({ success: true });
    });
  }

  @Post('/fire/:triggerId')
  public fire(request: Request): Promise<any> {
    const map = new Map<string, any>();
    _.each(_.keys(request.body), k => map.set(k, request.body[k]));
    return this.scenarioHost.fire(request.params.triggerId, request.body.uniqueId, map);
  }
}