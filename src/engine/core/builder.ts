import * as Handlebars from 'handlebars';
import fs = require('fs');
import path = require('path');
import * as _ from 'lodash';

export class ScenarioBuilder {

    private static templatesCompiled: boolean;
    private static loadTemplates() {
        if (ScenarioBuilder.templatesCompiled) return;

        const folder = path.join(__dirname, '..', '..', 'templates');
        const files = _(fs.readdirSync(folder))
            .filter(f => _.startsWith(path.parse(f).name, '_') && _.endsWith(f, '.hbs'))
            .each(f => {
                const name = path.parse(f).name;
                const contents = fs.readFileSync(path.join(folder, f), 'utf-8');
                Handlebars.registerPartial(name.replace('_', ''), contents);
            });

        ScenarioBuilder.templatesCompiled = true;
    }

    build(json: any) {
        ScenarioBuilder.loadTemplates();
        const fileName = path.join(__dirname, '..', '..', 'templates', 'template.hbs');
        const templateString = fs.readFileSync(fileName, 'utf-8');
        const template = Handlebars.compile(templateString);
        const result = template(json);
        return result;
    }
}

Handlebars.registerHelper('defaultValue', (name: string, type: string, defaultValue: string) => {
    if (type == 'string') {
        defaultValue = `'${defaultValue}'`;
    }
    return new Handlebars.SafeString(` = ${defaultValue}`);
});

Handlebars.registerHelper("toStringArray", (array: Array<string>) => {
    return new Handlebars.SafeString(array.map(i => `'${i}'`).join(', '));
});

Handlebars.registerHelper("propertyNamesToStringArray", (array: Array<any>, property: string, quoted: boolean) => {
    let values = _.map(array, property);
    if (quoted) {
        values = values.map(v => `'${v}'`);
    }
    return new Handlebars.SafeString(values.join(','));
});
