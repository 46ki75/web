//! # Resolver
//!
//! Resolvers return graphql objects.
//! The service layer is injected into resolvers, and resolvers call methods on service instances.
//! Services are injected via the graphql context at the entory point.

#[allow(missing_docs)]
pub mod blog;
#[allow(missing_docs)]
pub mod web_config;
