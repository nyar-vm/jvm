use jvm::class::{JvmClassFile, JvmMethodDescriptor, JvmMethodSignature, JvmTypeDescriptor};
use jvm::jar::JvmJarPackage;

/// `ACC_PUBLIC | ACC_STATIC`; the format crate keeps its flag constants private.
const PUBLIC_STATIC: u16 = 0x0001 | 0x0008;

fn demo_class() -> JvmClassFile {
    let mut class = JvmClassFile::new("demo/Main");
    class.methods.push(JvmMethodSignature {
        name: "main".to_string(),
        descriptor: JvmMethodDescriptor::new(
            vec![JvmTypeDescriptor::array(JvmTypeDescriptor::Object("java/lang/String".to_string()))],
            JvmTypeDescriptor::Void,
        ),
        access_flags: PUBLIC_STATIC,
        code: None,
    });
    class
}

#[test]
fn class_roundtrip_preserves_method_signature() {
    let class = demo_class();
    let bytes = class.to_bytes().expect("encode class");
    let decoded = JvmClassFile::from_bytes(&bytes).expect("decode class");

    assert_eq!(decoded.internal_name, "demo/Main");
    assert_eq!(decoded.super_name, "java/lang/Object");
    assert_eq!(decoded.methods.len(), 1);
    assert_eq!(decoded.methods[0].name, "main");
    assert_eq!(decoded.methods[0].descriptor.to_string(), "([Ljava/lang/String;)V");
}

#[test]
fn jar_roundtrip_reads_pushed_class() {
    let class = demo_class();
    let mut jar = JvmJarPackage::new("demo.jar");
    jar.push_class(&class).expect("push class");
    let bytes = jar.to_bytes().expect("encode jar");

    let decoded = JvmJarPackage::from_bytes("demo.jar", &bytes).expect("decode jar");
    let entry = decoded.read_class("demo/Main").expect("read class").expect("class present");
    assert_eq!(entry.internal_name, "demo/Main");
    assert_eq!(entry.methods[0].descriptor.parameter_slot_count(), 1);
}

#[test]
fn method_descriptor_parses_slot_widths() {
    let descriptor = JvmMethodDescriptor::parse("(IJ)[Ljava/lang/Object;").expect("parse descriptor");
    assert_eq!(descriptor.parameter_slot_count(), 3);
    assert_eq!(descriptor.return_type.to_string(), "[Ljava/lang/Object;");
}
