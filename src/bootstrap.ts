import { InversifyExpressServer } from 'inversify-express-utils';
import * as bodyParser from 'body-parser';
import container from './ioc/ioc';
import TYPES from './ioc/types';
import { ScenarioHost } from './engine/core';

const scenarioHost = container.get<ScenarioHost>(TYPES.ScenarioHost);
scenarioHost.start();


let server = new InversifyExpressServer(container);

server.setConfig((app) => {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
});

let app = server.build();
app.listen(3000);