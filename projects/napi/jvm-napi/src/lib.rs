//! Node-API bindings for JVM class and jar inspection.
//!
//! This crate only decodes artifacts and renders a stable JSON view: the class/jar
//! models are owned by the `jvm` facade. No instruction is executed here and no
//! constant-pool entry is interpreted outside the format layer.

#![deny(missing_docs)]

use std::{fs, path::Path};

use jvm::class::JvmClassFile;
use jvm::jar::JvmJarPackage;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde_json::{Value, json};

/// Host protocol id shared with the TypeScript wrapper.
pub const JVM_HOST_PROTOCOL: &str = "jvm/0";

/// Binding identity exposed to the host.
#[napi(object)]
pub struct JvmBindingInfo {
    /// Binding crate name.
    pub binding: String,
    /// Host protocol id.
    pub protocol: String,
}

/// Return binding identity.
#[napi]
pub fn jvm_binding_info() -> JvmBindingInfo {
    JvmBindingInfo { binding: "jvm-napi".to_string(), protocol: JVM_HOST_PROTOCOL.to_string() }
}

fn describe(class: &JvmClassFile) -> Value {
    let methods = class
        .methods
        .iter()
        .map(|method| {
            json!({
                "name": method.name,
                "descriptor": method.descriptor.to_string(),
                "accessFlags": method.access_flags,
                "parameterSlots": method.descriptor.parameter_slot_count(),
                "returnType": method.descriptor.return_type.to_string(),
                "hasCode": method.code.is_some(),
            })
        })
        .collect::<Vec<_>>();
    let fields = class
        .fields
        .iter()
        .map(|field| {
            json!({
                "name": field.name,
                "descriptor": field.descriptor.to_string(),
                "accessFlags": field.access_flags,
            })
        })
        .collect::<Vec<_>>();
    json!({
        "internalName": class.internal_name,
        "superName": class.super_name,
        "majorVersion": class.major_version,
        "minorVersion": class.minor_version,
        "accessFlags": class.access_flags,
        "interfaces": class.interfaces,
        "methods": methods,
        "fields": fields,
    })
}

fn to_json_string(value: &Value) -> Result<String> {
    serde_json::to_string(value).map_err(|error| Error::from_reason(format!("encode json: {error}")))
}

fn load_jar(jar_path: &Path) -> Result<JvmJarPackage> {
    let bytes = fs::read(jar_path).map_err(|error| Error::from_reason(format!("read jar `{}`: {error}", jar_path.display())))?;
    let file_name = jar_path.file_name().and_then(|name| name.to_str()).unwrap_or("archive.jar");
    JvmJarPackage::from_bytes(file_name, &bytes).map_err(|error| Error::from_reason(format!("decode jar `{}`: {error}", jar_path.display())))
}

/// Inspect a standalone `.class` file and return its JSON description.
#[napi]
pub fn jvm_inspect_class(class_path: String) -> Result<String> {
    let path = Path::new(&class_path);
    let bytes = fs::read(path).map_err(|error| Error::from_reason(format!("read class `{}`: {error}", path.display())))?;
    let class = JvmClassFile::from_bytes(&bytes).map_err(|error| Error::from_reason(format!("decode class `{}`: {error}", path.display())))?;
    to_json_string(&describe(&class))
}

/// List internal names of every class entry in a jar archive.
#[napi]
pub fn jvm_list_jar_classes(jar_path: String) -> Result<Vec<String>> {
    let jar = load_jar(Path::new(&jar_path))?;
    Ok(jar.iter_classes().map(|(path, _)| path.trim_end_matches(".class").to_string()).collect())
}

/// Inspect one class inside a jar archive and return its JSON description.
#[napi]
pub fn jvm_read_jar_class(jar_path: String, internal_name: String) -> Result<String> {
    let jar = load_jar(Path::new(&jar_path))?;
    let class = jar
        .read_class(&internal_name)
        .map_err(|error| Error::from_reason(format!("decode class `{internal_name}`: {error}")))?
        .ok_or_else(|| Error::from_reason(format!("class `{internal_name}` not found in `{jar_path}`")))?;
    to_json_string(&describe(&class))
}
