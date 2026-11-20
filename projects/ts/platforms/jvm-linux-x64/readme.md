# @nyar/jvm-linux-x64

Prebuilt **native JVM sidecar** for Linux x64. **Not a public import target.**

This package is pulled automatically when installing `@nyar/jvm` on a matching host.

## Example

Application code imports the main package only:

```typescript
import { inspectClass, listJarClasses } from "@nyar/jvm";

const cls = inspectClass("/path/to/Main.class");
const names = listJarClasses("/path/to/demo.jar");
```

Build and publish pipelines are documented for maintainers in the repository; they are not repeated here.