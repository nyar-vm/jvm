import {createRequire} from 'node:module';
import path from 'node:path';

import type {Cli, ParsedOptions} from '@vmz/commander';
import {createCli} from '@vmz/commander';

import {JVM_CLI_CATALOG} from './catalog.ts';
import {bindingInfo, inspectClass, listJarClasses, readJarClass} from '../native.ts';
import {hostPlatformKey, resolveCollect} from '../platform.ts';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json') as {version: string};

function requireString(options: ParsedOptions, key: string): string {
    const value = options[key];
    if (typeof value !== 'string' || !value) {
        throw new Error(`missing required --${key}`);
    }
    return value;
}

function buildCli(): Cli {
    const cli = createCli('jvm').catalog(() => JVM_CLI_CATALOG).intro('cli.intro');

    cli.command('version', 'cli.cmd.version').action(() => {
        const info = bindingInfo();
        console.log(`@nyar/jvm ${pkg.version}`);
        console.log(`${info.protocol} (${info.binding})`);
        return 0;
    });

    cli.command('host-info', 'cli.cmd.host-info').action(() => {
        console.log(
            JSON.stringify(
                {
                    version: pkg.version,
                    host: hostPlatformKey(),
                    collect: resolveCollect(),
                    binding: bindingInfo(),
                },
                null,
                2,
            ),
        );
        return 0;
    });

    cli.command('inspect', 'cli.cmd.inspect')
        .option('--class <path>', 'cli.opt.class')
        .action((options: ParsedOptions) => {
            console.log(JSON.stringify(inspectClass(path.resolve(requireString(options, 'class'))), null, 2));
            return 0;
        });

    const jar = cli.command('jar', 'cli.cmd.jar');

    jar.command('list', 'cli.cmd.jar.list')
        .option('--jar <path>', 'cli.opt.jar')
        .action((options: ParsedOptions) => {
            for (const name of listJarClasses(path.resolve(requireString(options, 'jar')))) {
                console.log(name);
            }
            return 0;
        });

    jar.command('class', 'cli.cmd.jar.class')
        .option('--jar <path>', 'cli.opt.jar')
        .option('--name <name>', 'cli.opt.name')
        .action((options: ParsedOptions) => {
            const jarPath = path.resolve(requireString(options, 'jar'));
            const name = requireString(options, 'name');
            console.log(JSON.stringify(readJarClass(jarPath, name), null, 2));
            return 0;
        });

    return cli;
}

/** Parse argv and run the JVM CLI (orchestration via `@vmz/commander`, decoding via `jvm-napi`). */
export async function runCli(argv: string[] = process.argv.slice(2)): Promise<number> {
    return buildCli().parse(argv);
}
