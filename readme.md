# jvm

Standard JVM artifact (`class` / `jar`) parsing, encoding and slot-accurate execution
substrate for `jvm.rs`.

## Crates

| Path                         | Role                                                          |
|:-----------------------------|:--------------------------------------------------------------|
| `projects/runtime/jvm`       | `jvm` facade: re-exports `class` / `jar` models and the VM substrate |
| `projects/napi/jvm-napi`     | Node-API binding: class/archive inspection                    |

## Layering

- `class` files are decoded into a typed model (constant pool, methods, fields) and re-encoded
  byte-for-byte; instruction decoding is exposed but not interpreted by the format layer.
- The execution substrate accepts **decoded** instructions only. It implements slot-correct
  locals and operand stack, a bounded interpreter loop and the native host boundary. Exceptions,
  `invokedynamic`, class initialization and full verifier data-flow are out of scope and
  explicitly rejected rather than silently approximated.
- Managed heap and JIT are separate substrates and are not rebuilt here.

## Build

```bash
cargo test --workspace
node scripts/build.mjs napi
pnpm install && pnpm test
```

## CLI

```bash
node projects/ts/emulators/jvm/bin/jvm.js inspect --class ./demo/Main.class
node projects/ts/emulators/jvm/bin/jvm.js jar list --jar ./demo.jar
node projects/ts/emulators/jvm/bin/jvm.js jar class --jar ./demo.jar --name demo/Main
```

## License

MIT
