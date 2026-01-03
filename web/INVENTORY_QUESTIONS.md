# Inventory & Store Management - Detailed Questions

Based on analysis of your current system, I need your input on the following areas to properly implement the clinic inventory management screens.

---

## 1. CLINIC INVENTORY vs GLOBAL CATALOG

### Current State:

- You have a **global catalog** (products available to all clinics)
- Each clinic has its own **local inventory** (products they actually stock)
- Clinics can also create their **own products** not in the global catalog

### Questions:

**1.1 Global Catalog Access**

- [ ] Should clinics be able to browse and add products from the global catalog to their inventory? YES
- [ ] If yes, can they set their own sale prices for global products? YES
- [ ] Should they see the suggested retail price from the catalog? YES
- [ ] Can clinics request new products be added to the global catalog? YES WHEN THEY ADD A NEW PRODUCT IT GETS ADDED TO THE GLOBAL CATALOG BUT HIDDEN TO ALL CLINICS ONLY THE GLOBAL ADMIN CAN SEE IT AND APPROVE IT

**1.2 Clinic-Specific Products**

- [ ] When a clinic creates their own product, should it stay private or be suggested to other clinics? IT SHOULD STAY HIDDEN TO OTHER CLINICS
- [ ] Should clinic-created products go through an approval process before being added to global catalog? YES

**1.3 Inventory Display**

```
Which view do you prefer for the main inventory screen?

A) Combined View: All products (global + local) in one list with source indicator
B) Separate Tabs: "My Products" | "From Catalog" | "All"
C) Filter-Based: Single list with filter dropdown for source
```

    B

---

## 2. INVENTORY MANAGEMENT WORKFLOW

### Questions:

**2.1 Stock Entry**

```
How do clinics typically receive new stock?

A) Manual entry (one product at a time)
B) Bulk import (Excel/CSV upload) - ALREADY IMPLEMENTED
C) Purchase orders to suppliers
D) Combination of above
```

    B

**2.2 Stock Adjustments**

- [ ] Should stock adjustments require a reason? (damage, theft, expired, count correction) YES
- [ ] Should adjustments require supervisor approval for large quantities? NO
- [ ] What's the threshold for "large quantity" if approval needed? **\_** units

**2.3 Low Stock Alerts**

```
How should low stock be handled?

A) Visual indicator only (red badge)
B) Email notification to clinic admin
C) Automatic reorder suggestion
D) WhatsApp notification
E) All of the above
```

    A,B,C,D

**2.4 Expiry Date Tracking**

- [ ] Do clinics track product expiry dates? YES
- [ ] If yes, how far in advance should they be warned? 30 days, 15 days, 7 days , 3 days, 1 day, 0 days
- [ ] Should expired products be auto-hidden from store? YES

---

## 3. EXPORT & IMPORT FUNCTIONALITY

### Current State:

- Excel export with full template (instructions, examples)
- Excel/CSV import with bilingual support (Spanish/English)
- Supports: new products, purchases, sales, adjustments, damage, theft, returns

### Questions:

**3.1 Export Format**

```
What should be included in inventory export?

A) Full catalog with all details (current implementation)
B) Simplified list (name, SKU, stock, price only)
C) Both options available
D) Custom column selection by user
```

    A

**3.2 Import Frequency**

```
How often do clinics import inventory data?

A) Daily (high-volume operations)
B) Weekly (regular updates)
C) Monthly (periodic reconciliation)
D) Rarely (prefer manual entry)
```

D
**3.3 Import Validation**

- [ ] Should imports fail the entire batch if one row has errors? YES
- [ ] Or should it process valid rows and report errors for invalid ones? (current behavior)
- [ ] Should there be a preview/dry-run option before committing imports? YES

---

## 4. PRICING & MARGINS

### Questions:

**4.1 Price Display**

```
What prices should staff see on inventory screens?

A) Only sale price (customer-facing)
B) Sale price + cost price
C) Sale price + cost + margin percentage
D) All above with profit per unit
```

    C

**4.2 Price Changes**

- [ ] Should price changes require admin approval? YES
- [ ] Should there be a price change history visible to staff? no
- [ ] Can any staff member change prices, or only admins? ANY STAFF CAN CHANGE PRICES

**4.3 Bulk Price Updates**

- [ ] Should there be a "apply X% markup to all products" feature? YES
- [ ] Category-based price updates (e.g., increase all medications by 5%)?
      PRICE UPDATE WILL BE DONE WITH EXCEL IMPORT AND UPDATE OF CURRENT INVENTORY

---

## 5. COUPONS & DISCOUNTS

### Current State:

- Coupon system exists in database but NO management UI
- Supports: percentage, fixed amount, free shipping
- Has usage limits, min purchase, product restrictions

### Questions:

**5.1 Coupon Management**

```
Who should be able to create/manage coupons?

A) Only platform admin (you)
B) Clinic admins only
C) Any staff member
D) Separate "marketing" role
```

C

**5.2 Coupon Types Needed**

- [x] Percentage discount (e.g., 10% off)
- [x] Fixed amount (e.g., 50,000 Gs off)
- [ ] Free shipping
- [x] Buy X Get Y free (BOGO)
- [x] Bundle discounts
- [x] First-time customer discount
- [x] Loyalty member exclusive

**5.3 Coupon Restrictions**

- [x] Limit to specific products?
- [x] Limit to specific categories?
- [x] Limit to specific customer segments?
- [ ] Exclude sale items?
- [ ] One coupon per order?
- [ ] Stackable coupons?

**5.4 Coupon Distribution**

```
How will coupons be distributed to customers?

A) Manual code entry at checkout
B) Auto-apply based on cart conditions
C) Email campaigns
D) WhatsApp broadcast
E) Printed on receipts
F) QR codes in clinic
```

A

---

## 6. CAMPAIGNS & PROMOTIONS

### Current State:

- Campaign system exists in database but NO management UI
- Types: sale, bogo, bundle, flash, seasonal

### Questions:

**6.1 Campaign Types Needed**

- [x] Seasonal sales (Christmas, Black Friday, etc.)
- [x] Flash sales (24-hour deals)
- [x] Category sales (all food 20% off)
- [x] Bundle deals (buy shampoo + conditioner, save 15%)
- [x] BOGO (buy one get one)
- [x] Clearance (auto-discount expiring products)

**6.2 Campaign Visibility**

```
How should active campaigns appear on the store?

A) Banner on homepage only
B) Badge on each product in campaign
C) Dedicated "Sales" category
D) Filter by "On Sale"
E) All of the above
```

E

**6.3 Campaign Scheduling**

- [ ] Should campaigns auto-start and auto-end based on dates? YES
- [ ] Should there be a campaign calendar view? YES
- [ ] Can multiple campaigns run simultaneously? YES

---

## 7. ORDER MANAGEMENT (Staff Side)

### Current State:

- Order table exists but no staff management UI
- Only prescription order review is partially implemented

### Questions:

**7.1 Order Workflow**

```
What order statuses do you need?

[x] Pending (just placed)
[x] Confirmed (accepted by clinic)
[x] Processing (being prepared)
[x] Ready for Pickup
[x] Shipped (if delivery)
[x] Delivered
[x] Cancelled
[ ] Refunded
```

**7.2 Order Actions**

- [ ] Can staff edit order items after placement? NO
- [ ] Can staff change order prices after placement? NO
- [ ] Can staff split orders? NO
- [ ] Can staff merge orders? NO

**7.3 Prescription Orders**

```
For products requiring prescription:

A) Customer uploads prescription, vet reviews, then order proceeds
B) Customer places order, then brings prescription to pickup
C) Order blocked until prescription verified
D) Option for customer to choose A or B
```

D

**7.4 Payment Handling**

```
How are payments processed?

A) Cash on pickup only
B) Cash + card on pickup
C) Online payment (integration with payment gateway)
D) Store credit / loyalty points
E) Insurance claims
```

## A,B,C,D

## 8. SUPPLIER MANAGEMENT

### Current State:

- Supplier table exists but no UI
  no UI needed

## 9. ANALYTICS & REPORTING

### Questions:

**9.1 Inventory Reports Needed**

- [x] Current stock levels by category
- [x] Low stock alerts report
- [x] Expiring products report
- [x] Stock movement history
- [x] Inventory valuation (total cost of inventory)
- [x] Dead stock (products not selling)

**9.2 Sales Reports Needed**

- [x] Sales by product
- [x] Sales by category
- [x] Sales by time period (daily/weekly/monthly)
- [x] Top selling products
- [x] Sales by customer
- [x] Profit margin analysis

**9.3 Report Export**

- [x] PDF export
- [x] Excel export
- [ ] Email scheduled reports
- [ ] Dashboard widgets

---

## 10. MOBILE / TABLET CONSIDERATIONS

### Questions:

**10.1 Device Usage**

```
What devices do staff use for inventory management?

A) Desktop/laptop only
B) Tablet (iPad, Android tablet)
C) Smartphone
D) Mix of above
```

A, B
**10.2 Barcode Scanning**

- [ ] Do you use barcode scanners?
- [ ] Should products have auto-generated barcodes?
- [x] Mobile camera barcode scanning?

**10.3 Mobile Priority Features**

```
Which features are most important on mobile?

A) Stock lookup (check if product in stock)
B) Quick stock update (add/subtract quantity)
C) Price lookup
D) Product search
E) Order management
```

A, B, C, D

---

## 11. IMPLEMENTATION PRIORITY

### Please rank these features (1 = highest priority, 10 = lowest):

| Feature                                     | Priority (1-10) |
| ------------------------------------------- | --------------- |
| Clinic inventory list (their products only) | \_\_\_          |
| Global catalog browser (add to inventory)   | \_\_\_          |
| Import/Export improvements                  | \_\_\_          |
| Coupon management UI                        | \_\_\_          |
| Campaign/promotion management               | \_\_\_          |
| Order management (staff side)               | \_\_\_          |
| Supplier management                         | \_\_\_          |
| Analytics dashboard                         | \_\_\_          |
| Low stock alerts & notifications            | \_\_\_          |
| Mobile-optimized inventory                  | \_\_\_          |

---

## 12. ADDITIONAL NOTES

Please add any other requirements, concerns, or context that would help with implementation:

```
[Your notes here]












```

---

## HOW TO RESPOND

You can respond in any of these ways:

1. **Edit this file directly** - Check boxes, fill in blanks, add notes
2. **Voice memo / message** - Tell me your answers conversationally
3. **Prioritized list** - Just tell me your top 3-5 priorities
4. **Screenshot markup** - Mark up existing screens with what you want changed

The more detail you provide, the better I can implement exactly what you need!
