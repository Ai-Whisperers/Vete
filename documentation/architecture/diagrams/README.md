# Architecture Diagrams

This directory contains Mermaid diagrams visualizing the Vete platform architecture, flows, and interactions.

## Available Diagrams

### Core Architecture

1. **[System Architecture](01-system-architecture.md)** - High-level system overview
2. **[Multi-Tenant Isolation](02-multi-tenant-isolation.md)** - How tenants are isolated

### User Flows

3. **[Appointment Booking Flow](03-appointment-booking-flow.md)** - Complete booking process
4. **[Checkout Flow](04-checkout-flow.md)** - E-commerce checkout with stock validation

### Security & Data

5. **[RLS Isolation Flow](05-rls-isolation-flow.md)** - Row-Level Security enforcement
6. **[Authentication Flow](06-authentication-flow.md)** - Login and session management

### System Processes

7. **[Page Load Flow](07-page-load-flow.md)** - How pages are rendered
8. **[Entity Relationship Diagram](08-entity-relationship.md)** - Database schema relationships

## Viewing Diagrams

### In Cursor

The `markdown-mermaid` extension is installed. Diagrams will render automatically in:
- Markdown preview
- Hover tooltips
- Documentation views

### Online

Copy Mermaid code to [Mermaid Live Editor](https://mermaid.live/) for interactive viewing.

### VS Code

Install the [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) extension.

## Creating New Diagrams

1. **Start Small**: Begin with a single feature or component
2. **Use Templates**: Reference existing diagrams for structure
3. **Follow Naming**: Use `##-description.md` format
4. **Add Context**: Include explanation of what the diagram shows
5. **Update README**: Add new diagrams to this list

## Diagram Types Used

- **flowchart TD/LR**: Process flows, decision trees
- **sequenceDiagram**: Time-based interactions
- **graph TB/LR**: Component relationships
- **erDiagram**: Database entity relationships
- **stateDiagram-v2**: State machines (future)

## Reference

- [Mermaid Documentation](https://mermaid.js.org/)
- [Cursor Mermaid Cookbook](https://cursor.com/docs/cookbook/mermaid-diagrams)
- [Diagram Analysis](../DIAGRAMS_ANALYSIS.md) - Complete list of all possible diagrams

