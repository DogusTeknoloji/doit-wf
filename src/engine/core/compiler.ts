import { Log, LogType } from '../services/logger';
import * as ts from "typescript";
import * as _ from 'lodash';
import fs = require('fs');
import path = require('path');

export class ScenarioCompiler {

    compile(id: string, source: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const fileName = path.join(__dirname, '..', '..', 'scenarios', `${id}.ts`);
            fs.writeFile(fileName, source, { encoding: 'utf-8' }, error => {
                if (error != null) {
                    return reject([error.message]);
                }

                const compiler = new ScenarioCompiler();
                const diagnostics = this.compileFiles([fileName]);

                if (diagnostics.length > 0) {
                    return reject(diagnostics);
                }

                resolve([]);
            });
        });
    }

    compileFiles(fileNames: string[]): string[] {
        Log.info(LogType.Builders, `Compiling: ${fileNames[0]}`);

        const program = ts.createProgram(fileNames, {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2016,
            noImplicitAny: false,
            declaration: true,
            sourceMap: false,
            typeRoots: ["node_modules/@types"],
            experimentalDecorators: true,
            emitDecoratorMetadata: true
        });
        const emitResult = program.emit();
        const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

        return _.map(allDiagnostics, diagnostic => {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            const item = `(${line + 1},${character + 1}): ${message}`;
            Log.error(LogType.Builders, item);
            return item;
        });
    }
}