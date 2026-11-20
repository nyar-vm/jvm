import type {LocaleCatalog} from '@vmz/commander';

/** JVM CLI English catalog (`commander.*` entries fall back to the framework). */
export const JVM_CLI_CATALOG: LocaleCatalog = {
    'cli.intro': 'JVM CLI — inspect `class` files and jar archives',
    'cli.cmd.version': 'Print package version and binding protocol',
    'cli.cmd.host-info': 'Print the resolved platform collect and binding metadata',
    'cli.cmd.inspect': 'Inspect a standalone `.class` file',
    'cli.cmd.jar': 'Jar archive helpers',
    'cli.cmd.jar.list': 'List internal class names in a jar archive',
    'cli.cmd.jar.class': 'Inspect one class inside a jar archive',
    'cli.opt.class': 'Path to a `.class` file',
    'cli.opt.jar': 'Path to a jar archive',
    'cli.opt.name': 'Internal class name, e.g. `demo/Main`',
};
