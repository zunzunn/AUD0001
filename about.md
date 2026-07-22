# Nexfra ERP & Website Project Documentation

> **Project Name:** Nexfra ERP
>
> **Company:** Nexfra Manufacturing India Pvt. Ltd.
>
> **Project Type:** Company Website + Internal ERP System
>
> **Status:** Planning & Design Phase

---

# Project Overview

The goal is to build a modern web application for **Nexfra Manufacturing India Pvt. Ltd.** that serves two purposes:

1. A premium public-facing company website.
2. A complete internal ERP system for employees.

The website should represent Nexfra as a premium heavy engineering manufacturer while the ERP will automate the complete workflow from customer enquiry to quotation, production, payment tracking, and delivery.

The entire system should eliminate manual paperwork, repetitive data entry, Excel sheets, and Word documents.

---

# Design Philosophy

The UI should feel like an enterprise software combined with a premium industrial website.

### Inspiration

- Mercedes-Benz Trucks
- Volvo Trucks
- Caterpillar
- BharatBenz
- Schmitz Cargobull

Avoid startup-style designs.

The website should communicate:

> **Strength**
>
> **Reliability**
>
> **Engineering Precision**

---

# Brand Identity

## Colors

Primary Green

```
#1E7D32
```

Accent Yellow

```
#D4AF37
```

Background

```
#F8FAFC
```

Dark Text

```
#1A1A1A
```

Light Border

```
#E5E7EB
```

---

## Fonts

Headings

- Poppins Bold

Body

- Inter

---

# Overall Website Structure

```
Landing Website

│

├── Home

├── About

├── Products

├── Manufacturing

├── Industries

├── Contact

└── Employee Login

↓

ERP Dashboard

├── Sales

├── Quotations

├── Work Orders

├── Order Status

├── Accounts

├── Customers

├── Reports

└── Admin
```

---

# Landing Page

The landing page is public.

Purpose:

- Build trust
- Showcase company
- Display products
- Generate enquiries
- Employee Login

Sections:

- Hero
- About
- Products
- Manufacturing Process
- Industries Served
- Gallery
- Testimonials
- Contact
- Footer

---

# ERP Overview

The ERP begins after Employee Login.

It is built specifically for truck body manufacturing.

---

# ERP Workflow

```
Customer Enquiry

↓

Quotation Creation

↓

Customer Approval

↓

Generate Work Order

↓

Production

↓

Payment Tracking

↓

Delivery

↓

Completed Sale
```

No duplicate data entry.

Every module shares the same database.

---

# Modules

## 1. Sales

Purpose

Display completed sales.

Features

- Sales History
- Customer
- Product
- Amount
- Payment Status
- Delivery Date
- Search
- Filters

---

## 2. Quotations

The quotation builder is the heart of the software.

Workers should NEVER type complete quotations manually.

Everything is template-based.

Workflow

Customer Details

↓

Product

↓

Subtype

↓

Auto Load Specifications

↓

Modify Specifications

↓

Add Custom Items

↓

Automatic Price Calculation

↓

Generate PDF

↓

Save

↓

Customer Approval

---

## 3. Work Orders

Generated automatically after quotation approval.

One click

```
Approve

↓

Generate Work Order
```

The work order is factory-facing.

Contains

- Product
- Specifications
- Factory Notes
- Accessories
- Booked By
- Approved By
- Customer
- Colour
- Quantity

---

## 4. Order Status

Production Tracking

Stages

- Pending
- Material Ordered
- Cutting
- Fabrication
- Welding
- Painting
- Assembly
- QC
- Ready
- Delivered

---

## 5. Accounts

Initially empty.

Later

- Expenses
- Purchases
- GST
- Salaries
- Profit
- Reports

---

## 6. Customers

Every quotation belongs to a customer.

Store

- Name
- Phone
- Email
- Address
- GST
- Company
- Vehicle Model
- Chassis Number

Customer History

- Quotations
- Orders
- Payments

---

# Product Categories

## Trailers

### Flat Bed Trailer

Specifications

- Length
- Width
- Height
- Material
- Floor
- Beam
- Axles
- Suspension

---

### Side Wall Trailer

Length varies

Height varies

Specifications vary.

Default Template

- Beam
- Axle
- Suspension
- Floor
- Side Panel
- Headboard
- Brake
- Disc
- Hook
- Tyre
- Tool Box
- Accessories

Every field must be editable.

---

### Tip Trailer

Specifications

- Length
- Height
- Capacity
- Cylinder
- Hydraulic
- Material Grade
- Thickness
- Paint

Everything editable.

---

## Tippers

### Box Body

Capacity

Examples

- 14 CBM
- 16 CBM
- 18 CBM
- 23 CBM
- 25 CBM
- Custom

Specifications vary.

Default values loaded automatically.

Examples

- Floor Thickness
- Side Thickness
- Headboard
- Tail Door
- Cylinder
- PTO
- Pump
- Lock System
- Painting
- Marker Lamps
- Stabilizer
- Tipping Angle

Everything editable.

---

### Rock Body

Capacity

- 14 CBM
- 16 CBM
- 18 CBM

Specifications

- Floor Material
- Hardox Grade
- Thickness
- Rock Breakers
- Cylinder
- Automatic Lock
- Cross Members
- Paint
- Mud Guard
- Tank Guard
- Rear Bumper

Everything editable.

---

## Rigid Load Body

Future Module

Products

- 28 Feet
- 30 Feet

Specification templates will be added later.

---

# Product Templates

Every product uses templates.

Example

```
Trailer

↓

Side Wall Trailer

↓

32 Feet Template

↓

Default Specifications
```

or

```
Tipper

↓

Box Body

↓

25 CBM Template

↓

Default Specifications
```

Templates should be editable from Admin Panel.

---

# Specifications

Specifications should NOT be plain text.

Each specification contains

```
Name

Default Value

Available Options

Price Difference

Required

Editable
```

Example

```
Floor Thickness

Default

8 mm

Options

6 mm

8 mm

10 mm

Custom

Price Difference

0

15000

30000
```

---

# Custom Items

Every quotation should support

```
+ Add Custom Item
```

Fields

- Name
- Description
- Quantity
- Price

Examples

- GPS
- Camera
- Extra Toolbox
- Hydraulic Ramp
- Branding
- Lighting
- Winch

Automatically appear in

- Quotation
- Work Order
- Invoice

---

# Pricing

Every specification can have pricing.

Changing

```
ST52

↓

Hardox
```

Automatically updates quotation total.

Automatic

- Basic Amount
- GST
- Grand Total

---

# PDF Generation

Generate

- Quotation PDF
- Work Order PDF

Use existing company format.

Maintain current branding.

---

# Production Dashboard

Factory should see

```
WO-145

Painting

75%

Pending

↓

WO-146

Fabrication

40%
```

Production updates

- Material
- Fabrication
- Welding
- Paint
- QC
- Dispatch

---

# Payment Tracking

Track

Total Amount

Advance

Received

Pending

Balance

Support multiple payments.

Example

| Date | Amount | Mode |
|------|---------|------|
|15 Jul|50000|Cash|
|20 Jul|100000|RTGS|

Automatically calculate balance.

---

# Search

Global Search

Search by

- Customer
- Phone
- GST
- Quotation Number
- Work Order Number
- Vehicle
- Product

Everything searchable.

---

# User Roles

Admin

- Everything

Sales

- Quotations
- Customers

Production

- Work Orders
- Status Updates

Accounts

- Payments
- Reports

---

# Admin Panel

Admin should manage

- Products
- Product Types
- Templates
- Specification Lists
- Pricing
- Materials
- Users
- Permissions

No coding required to add products.

---

# Animations

Subtle only.

- Fade
- Hover
- Scroll reveal
- Counters
- Smooth transitions

No flashy animations.

---

# UI Style

Industrial

Professional

Premium

Enterprise

Minimal

Lots of whitespace

Sharp edges

Clean tables

Modern dashboard

---

# Future Modules

- Inventory
- Material Stock
- Purchase Orders
- Supplier Management
- Invoice Generator
- Delivery Challan
- Email Quotations
- WhatsApp Quotations
- Customer Portal
- Analytics Dashboard
- Mobile App

---

# Development Philosophy

The software should be scalable.

Nothing should be hardcoded.

Everything (Products, Specifications, Templates, Prices, Materials, Options) should come from the database and be manageable through the Admin Panel.

The goal is to create **Nexfra ERP**, a complete operating system for the company that replaces manual quotations, work orders, spreadsheets, and paper-based processes while providing a premium public-facing website.
