#![deny(missing_docs)]
#![forbid(unsafe_code)]

//! JVM artifact and execution facade.
//!
//! The crate owns nothing itself: it re-exports the two concrete layers so that
//! consumers depend on one name.
//!
//! - [`class`] / [`jar`] — `class` file model and `jar` archive model, including
//!   constant-pool access, instruction decoding and byte-exact re-encoding.
//! - the execution substrate — slot-accurate local variables and operand stack,
//!   a bounded interpreter loop and the native host boundary. It deliberately
//!   accepts **decoded** instructions only; it is not a complete JVM.
//!
//! Format parsing and execution stay separate: this facade never re-implements
//! constant-pool handling or the instruction set.

pub use data_binary_jvm::{class, jar};
pub use interpreter_vm_jvm::*;
