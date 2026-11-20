# AGENTS

本文件面向在该仓库工作的 AI Agents。人类请先读 [readme.md](./readme.md)。

## 仓库定位

`jvm` 是 JVM 制品（`class` / `jar`）格式模型与执行基座的独立仓：

- `projects/runtime/jvm`：Rust 门面，`pub use data_binary_jvm::{class, jar};` + 执行基座再导出，不持有实现。
- `projects/napi/jvm-napi`：Node-API 绑定，只做制品解码与稳定 JSON 视图渲染，不执行指令。
- `projects/ts/emulators/jvm`：`@nyar/jvm` CLI 与 TypeScript 入口。
- `projects/ts/platforms/jvm-<platform>`：按平台打包的 `jvm.<triple>.node`。

## 依赖边界

- `class` / `jar` 格式模型归 `data-binary-jvm`（Boost），以 git `rev` 固定；本仓不得复制常量池或指令集实现。
- 执行基座归 `interpreter-vm-jvm`：只接受**已解码**指令，槽宽正确的局部变量与操作数栈、有界解释循环与 native 宿主边界；异常表、`invokedynamic`、类初始化与完整验证器数据流不签收，超出子集必须显式拒绝。
- 托管堆与 GC 归 `interpreter-gc`，JIT 归 `interpreter-jit`；本仓不重建。
- 本仓不得导入任何语言的 AST、解析器或编译流水线。

## 硬性约束

1. 主分支固定为 `master`；`dev` 仅作开发跟踪分支。
2. 所有跨仓 Cargo 依赖固定完整 40 位 `rev`；本机路径只写在 `.cargo/config.toml`（gitignored），示例在 `.cargo/config.example.toml`。
3. 集成测试放在 crate 的 `tests/` 目录，不在 `Cargo.toml` 声明 `[[test]]`。
4. `jvm-napi` 只解码与描述制品，不得执行字节码，也不得为不完整的执行子集补旁路。
5. 提交 subject 以恰好一个 gitmoji 开头、英文祈使句、标识符用反引号，不带 semver；提交前运行 `git diff --check` 与对应测试。
6. npm 发布只允许 GitHub Actions Trusted Publisher/OIDC（工作流 `publish-npm.yml`，environment `NPM_PUBLISH`）；禁止本地 `npm publish`、token/OTP 旁路。
7. 不使用 `git clean`、`rmdir /s /q` 等宽泛清理；删除必须精确指定目标。

## 常用命令

```bash
cargo test --workspace                 # Rust
node scripts/build.mjs napi            # 构建宿主原生插件到平台包
pnpm install && pnpm test              # TypeScript 与 CLI 测试
node scripts/prepare-npm-publish.mjs   # 同步发布用 README.md
```
