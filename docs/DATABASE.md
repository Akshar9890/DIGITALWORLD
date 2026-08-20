# DigitalWorld — Database Architecture & Data Models

DigitalWorld uses **PostgreSQL** paired with **Prisma ORM** as its primary relational database.

---

## 1. Visual Database Entity Relationship Diagram

<p align="center">
  <img src="../public/images/database-erd-shipment-flow.png" alt="DigitalWorld Database ERD and Shipment Lifecycle Architecture" width="100%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</p>

---

## 2. Interactive Schema Entity Relationship Model (Mermaid ERD)

```mermaid
erDiagram
    ORDER ||--o{ SHIPMENT : "1 Order can have many Shipments (1 : N)"
    SHIPMENT ||--o{ SHIPMENT_TRACKING_EVENT : "1 Shipment can have many Tracking Events (1 : N)"

    ORDER {
        String id PK "Primary Key (cuid)"
        String orderNumber UK "Unique Order Identifier"
        String userId "Nullable Customer ID"
        OrderStatus status "Enum (pending_payment, confirmed, processing, shipped, delivered, cancelled)"
        PaymentStatus paymentStatus "Enum (initiated, paid, failed, refunded)"
        Decimal subtotal "Decimal(10,2) Pre-tax items total"
        Decimal shippingAmount "Decimal(10,2) Default: 0"
        Decimal taxableAmount "Decimal(10,2) Taxable base"
        Boolean isSameState "Default: true (Intra vs Inter-State)"
        Decimal cgstAmount "Decimal(10,2) Default: 0 (Central GST 9%)"
        Decimal sgstAmount "Decimal(10,2) Default: 0 (State GST 9%)"
        Decimal igstAmount "Decimal(10,2) Default: 0 (Integrated GST 18%)"
        Decimal totalGST "Decimal(10,2) Total Goods & Shipping GST"
        Decimal grandTotal "Decimal(10,2) Total Payable Amount"
        DateTime createdAt "Default: now()"
        DateTime updatedAt "Timestamp"
    }

    SHIPMENT {
        String id PK "Primary Key (cuid)"
        String orderId FK "Foreign Key -> Order.id"
        String provider "Courier Provider (e.g. shiprocket, delhivery, manual)"
        String courierName "Courier Carrier (e.g. Delhivery Surface, Blue Dart, Manual)"
        String awbNumber UK "Air Waybill Number (Unique)"
        ShipmentStatus status "Enum (Current Shipment Status)"
        Decimal shippingCost "Decimal(10,2) Default: 0"
        String trackingUrl "Nullable Tracking Page URL"
        DateTime estimatedDeliveryDate "Nullable Expected Delivery Date"
        DateTime createdAt "Default: now()"
        DateTime updatedAt "Timestamp"
    }

    SHIPMENT_TRACKING_EVENT {
        String id PK "Primary Key (cuid)"
        String shipmentId FK "Foreign Key -> Shipment.id"
        ShipmentStatus status "Enum: Status at this milestone"
        String location "Nullable Event Geographic Location"
        String description "Nullable Human-readable Status Message"
        String externalStatus "Nullable Raw Courier API String"
        DateTime timestamp "Default: now() When Event Occurred"
    }
```

---

## 3. Schema Legend & Field Attributes

| Symbol / Icon | Attribute Type | Description |
|---|---|---|
| 🔑 `PK` | **Primary Key** | Unique system identifier for the record (`cuid`) |
| 🔗 `FK` | **Foreign Key** | Relational link to parent model (`onDelete: Cascade` where applicable) |
| 🌟 `UK` | **Unique Field** | Value must be unique across the entire database (`orderNumber`, `awbNumber`) |
| 🏷️ `Enum` | **Enum Type** | Standardized enumerated state machine value |
| 🕒 `DateTime` | **Timestamp Field** | Automated `createdAt` and `updatedAt` tracking |

---

## 4. Prisma Schema Definition

```prisma
enum ShipmentStatus {
  ORDER_PLACED
  PAYMENT_CONFIRMED
  PROCESSING
  PACKED
  SHIPMENT_CREATED
  PICKUP_SCHEDULED
  PICKED_UP
  IN_TRANSIT
  REACHED_DESTINATION
  OUT_FOR_DELIVERY
  DELIVERED
  DELAYED
  NDR
  RTO_INITIATED
  RTO_IN_TRANSIT
  RTO_DELIVERED
  LOST
  DAMAGED
  CANCELLED
}

enum OrderStatus {
  pending_payment
  confirmed
  processing
  shipped
  delivered
  cancelled
}

enum PaymentStatus {
  initiated
  paid
  failed
  refunded
}

model Order {
  id              String         @id @default(cuid())
  orderNumber     String         @unique
  userId          String?
  status          OrderStatus    @default(pending_payment)
  paymentStatus   PaymentStatus  @default(initiated)
  subtotal        Decimal        @db.Decimal(10, 2)
  shippingAmount  Decimal        @default(0) @db.Decimal(10, 2)
  taxableAmount   Decimal        @db.Decimal(10, 2)
  isSameState     Boolean        @default(true)
  cgstAmount      Decimal        @default(0) @db.Decimal(10, 2)
  sgstAmount      Decimal        @default(0) @db.Decimal(10, 2)
  igstAmount      Decimal        @default(0) @db.Decimal(10, 2)
  totalGST        Decimal        @db.Decimal(10, 2)
  grandTotal      Decimal        @db.Decimal(10, 2)
  items           OrderItem[]
  payment         Payment?
  shipments       Shipment[]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model Shipment {
  id                    String                  @id @default(cuid())
  orderId               String
  order                 Order                   @relation(fields: [orderId], references: [id])
  provider              String                  // "shiprocket", "delhivery", "manual"
  courierName           String                  // "Delhivery Surface", "Blue Dart", "Manual"
  awbNumber             String                  @unique
  status                ShipmentStatus          @default(SHIPMENT_CREATED)
  shippingCost          Decimal                 @default(0) @db.Decimal(10, 2)
  trackingUrl           String?
  estimatedDeliveryDate DateTime?
  events                ShipmentTrackingEvent[]
  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt
}

model ShipmentTrackingEvent {
  id             String         @id @default(cuid())
  shipmentId     String
  shipment       Shipment       @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
  status         ShipmentStatus
  location       String?
  description    String?
  externalStatus String?
  timestamp      DateTime       @default(now())
}
```
