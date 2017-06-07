import * as bodyParser from 'body-parser';

import { InversifyExpressServer } from 'inversify-express-utils';
import { ScenarioPool } from './engine/core';
import TYPES from './ioc/types';
import container from './ioc/ioc';

let server = new InversifyExpressServer(container);

server.setConfig((app) => {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
});

let app = server.build();
app.listen(3000);