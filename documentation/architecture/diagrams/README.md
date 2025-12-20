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

### Feature Workflows

9. **[Prescription Workflow](09-prescription-workflow.md)** - Prescription creation to PDF
10. **[Invoice Creation & Payment](10-invoice-creation-payment.md)** - Invoicing workflow
11. **[Inventory Management](11-inventory-management.md)** - Stock management with WAC
12. **[Medical Record Creation](12-medical-record-creation.md)** - Clinical record workflow
13. **[Hospitalization Flow](18-hospitalization-flow.md)** - Patient admission to discharge
14. **[Lab Order Workflow](19-lab-order-workflow.md)** - Lab order to results

### State Machines

15. **[Appointment State Machine](13-appointment-state-machine.md)** - Appointment lifecycle
16. **[Invoice State Machine](14-invoice-state-machine.md)** - Invoice payment states

### API & System Architecture

17. **[API Request Lifecycle](15-api-request-lifecycle.md)** - Complete API request flow
18. **[Security Architecture](20-security-architecture.md)** - Multi-layer security
19. **[Error Handling Flow](25-error-handling-flow.md)** - Error processing
20. **[Server Action vs REST API](24-server-action-vs-rest-api.md)** - Decision tree

### User Journeys

21. **[Pet Owner Journey](16-user-journey-pet-owner.md)** - Complete owner experience
22. **[Veterinarian Journey](17-user-journey-veterinarian.md)** - Daily vet workflow

### Data Flow & Components

23. **[End-to-End Data Flow](22-data-flow-end-to-end.md)** - Complete data journey
24. **[Component Hierarchy - Booking](21-component-hierarchy-booking.md)** - React component structure
25. **[Vaccine Schedule Tracking](23-vaccine-schedule-tracking.md)** - Vaccine management

### Additional Workflows

26. **[Staff Invitation Flow](26-staff-invitation-flow.md)** - Inviting and onboarding staff
27. **[Messaging & Communication Flow](27-messaging-communication-flow.md)** - Multi-channel messaging
28. **[QR Tag Assignment Flow](28-qr-tag-assignment-flow.md)** - QR tag management
29. **[Store Shopping Flow](29-store-shopping-flow.md)** - Complete shopping journey
30. **[Admin User Journey](30-admin-user-journey.md)** - Administrator workflow

### System Architecture

31. **[Role-Based Access Control](31-role-based-access-control.md)** - RBAC permissions
32. **[Component Hierarchy - Dashboard](32-component-hierarchy-dashboard.md)** - Dashboard structure
33. **[Deployment & CI/CD Flow](33-deployment-ci-cd-flow.md)** - Deployment pipeline

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

