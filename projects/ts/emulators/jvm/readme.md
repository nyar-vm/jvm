# @nyar/jvm

Class and jar inspection for JVM artifacts. Decoding is done by the `jvm` crate
(`data-binary-jvm`); the Node-API binding is built from this repository's `jvm-napi` crate.

## CLI

```bash
jvm version
jvm host-info
jvm inspect --class ./demo/Main.class
jvm jar list --jar ./demo.jar
jvm jar class --jar ./demo.jar --name demo/Main
```

## Programmatic surface

```typescript
import {inspectClass, listJarClasses, readJarClass} from '@nyar/jvm';

const cls = inspectClass('/path/to/Main.class');
const names = listJarClasses('/path/to/demo.jar');
const entry = readJarClass('/path/to/demo.jar', names[0]);

console.log(cls.internalName, cls.methods.map((m) => `${m.name}${m.descriptor}`));
```

Inspected fields include the internal name, super name, class version, access flags,
interfaces, methods (name, descriptor, access flags, parameter slot width, return type,
whether a `Code` attribute exists) and fields.

Platform collects (`jvm-win32-x64`, `jvm-linux-x64`, `jvm-darwin-*`) are optional dependencies:
the host picks the collect matching the current OS/arch and reports a clear error when none is
installed.

## License

MIT
