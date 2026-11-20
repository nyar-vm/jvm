import {createRequire} from 'node:module';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {hostPlatformKey, requireOptionalPackage, resolveCollect} from './platform.ts';
import {nativeBinaryName, platformShort, platformTriple} from './platform-triple.ts';

/** Host protocol id (mirrors `JVM_HOST_PROTOCOL` in `jvm-napi`). */
export const BINDING_PROTOCOL = 'jvm/0';

export type BindingInfo = {
    binding: string;
    protocol: string;
};

export type JvmMethodView = {
    name: string;
    descriptor: string;
    accessFlags: number;
    parameterSlots: number;
    returnType: string;
    hasCode: boolean;
};

export type JvmFieldView = {
    name: string;
    descriptor: string;
    accessFlags: number;
};

export type JvmClassView = {
    internalName: string;
    superName: string;
    majorVersion: number;
    minorVersion: number;
    accessFlags: number;
    interfaces: string[];
    methods: JvmMethodView[];
    fields: JvmFieldView[];
};

type JvmNativeAddon = {
    jvmBindingInfo(): BindingInfo;
    jvmInspectClass(classPath: string): string;
    jvmListJarClasses(jarPath: string): string[];
    jvmReadJarClass(jarPath: string, internalName: string): string;
};

const pkgRoot = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

/**
 * Resolve the native `.node` through the platform optionalDependency
 * (`@nyar/jvm-<short>`), falling back to the sibling workspace tree.
 *
 * `JVM_NATIVE` overrides the resolved path so a locally built addon can be
 * exercised without reinstalling the platform package.
 */
export function resolveNativePath(): string {
    const override = process.env.JVM_NATIVE;
    if (override && override.trim().length > 0) return override;

    const triple = platformTriple();
    const short = platformShort(triple);
    const packageName = resolveCollect().packageName;
    const binary = nativeBinaryName(triple);
    const candidates: string[] = [];

    const pkgJson = requireOptionalPackage(packageName);
    if (pkgJson) {
        const pkgDir = path.dirname(pkgJson);
        candidates.push(path.join(pkgDir, 'lib', binary));
        candidates.push(path.join(pkgDir, binary));
    }

    candidates.push(path.join(pkgRoot, '..', '..', 'platforms', `jvm-${short}`, 'lib', binary));
    candidates.push(path.join(pkgRoot, '..', '..', 'platforms', `jvm-${short}`, binary));
    candidates.push(path.join(pkgRoot, '..', 'node_modules', packageName, 'lib', binary));
    candidates.push(path.join(pkgRoot, 'node_modules', packageName, 'lib', binary));

    for (const candidate of candidates) {
        if (existsSync(candidate)) return candidate;
    }

    throw new Error(
        `jvm native addon not found for ${packageName}. Run: node scripts/build.mjs napi\n` +
        `Looked in:\n${candidates.map((c) => `  - ${c}`).join('\n')}\n` +
        `(host ${hostPlatformKey()})`,
    );
}

let nativeAddon: JvmNativeAddon | undefined;

/** Load the host `jvm-napi` binding. */
export function loadNative(): JvmNativeAddon {
    if (nativeAddon) return nativeAddon;
    nativeAddon = require(resolveNativePath()) as JvmNativeAddon;
    return nativeAddon;
}

/** Binding identity and host protocol. */
export function bindingInfo(): BindingInfo {
    return loadNative().jvmBindingInfo();
}

/** Inspect a standalone `.class` file. */
export function inspectClass(classPath: string): JvmClassView {
    return JSON.parse(loadNative().jvmInspectClass(classPath)) as JvmClassView;
}

/** List internal names of every class entry in a jar archive. */
export function listJarClasses(jarPath: string): string[] {
    return loadNative().jvmListJarClasses(jarPath);
}

/** Inspect one class inside a jar archive. */
export function readJarClass(jarPath: string, internalName: string): JvmClassView {
    return JSON.parse(loadNative().jvmReadJarClass(jarPath, internalName)) as JvmClassView;
}
