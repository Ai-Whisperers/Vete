# ADR-003: Implement Multi-Tenancy
## Status
Accepted

## Context
We need to implement multi-tenancy in our web application. This will allow us to support multiple tenants with separate data and configurations.

## Decision
We will implement multi-tenancy using a separate database schema for each tenant.

## Consequences
Implementing multi-tenancy will provide us with a lot of benefits, including:
* Separate data and configurations for each tenant
* Improved security and isolation

However, it may also introduce some complexity and require additional setup.