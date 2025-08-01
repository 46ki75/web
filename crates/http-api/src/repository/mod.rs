//! # Repository
//!
//! Repositories have methods that depend on external services.
//! This module defines and implements traits for both real and stub implementations.
//! Repositories are injected into the Service layer.

pub mod blog;
pub mod talk;
pub mod web_config;
