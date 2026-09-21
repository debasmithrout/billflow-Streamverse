# Recurring-Payment-Subscription-Management-and-Billing-Automation-Platform-Jun-2026
# 🎬 StreamVerse

StreamVerse is a full-stack OTT streaming platform with customer and admin
experiences, subscription management, payments, billing, refunds, and
protected video streaming.

---

## 🚀 Project Overview

StreamVerse is being developed as a complete OTT platform where customers can:

- Create and manage their account
- Browse available content
- Purchase subscription plans
- Complete payments
- Manage payment methods
- View billing information
- View payment history and summaries
- Cancel subscriptions
- Access entitled streaming content

The platform also includes an Admin Dashboard for managing the platform,
customers, plans, subscriptions, payments, billing, refunds, and analytics.

---

## ✨ Current Features

### 👤 Customer

- Authentication and account management
- Customer dashboard
- Subscription plan management
- Checkout and payment flow
- Payment method management
- Payment history
- Payment summary
- Billing information
- Subscription cancellation
- Checkout cancellation handling
- Refund workflow
- Protected customer routes

### 💳 Payments & Billing

- Payment creation and tracking
- Payment status management
- Successful / pending / cancelled payment states
- Invoice generation and tracking
- Payment cancellation when checkout is closed
- Payment summary aggregation
- Payment method categorization
- Card / UPI payment tracking
- INR currency formatting
- Billing dashboard

### 🛠️ Admin Dashboard

- Admin authentication
- Customer management
- Subscription management
- Plan management
- Payment monitoring
- Invoice management
- Refund management
- Billing overview
- Revenue statistics
- Platform overview
- Today's summary
- Admin analytics

### 🎥 Streaming

- OTT video playback
- Movie/content streaming architecture
- Video player integration
- Protected content access
- Streaming content management

---

## 🔄 Payment Flow

---text
Customer
   ↓
Select Subscription Plan
   ↓
Checkout
   ↓
Payment Created
   ↓
Payment Processing
   ↓
 ┌───────────────┬────────────────┐
 │               │                │
Success       Cancel / X       Failure
 │               │                │
 ↓               ↓                ↓
PAID          CANCELLED        Failed
 │               │
 ↓               ↓
Invoice       Invoice
Paid          Cancelled
 │
 ↓
Subscription Activated
Closing the checkout using the X button does not create a successful
payment. The pending payment and invoice are transitioned to CANCELLED.
💰 Currency
The platform uses Indian Rupees (INR) for billing and revenue displays.
Example:
₹5,297
₹1,299
₹499
Dashboard revenue and billing values have been audited to remove the previous
dollar ($) formatting.
🏗️ Architecture
                    ┌─────────────────┐
                    │    Frontend     │
                    │ React + Vite    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   FastAPI API   │
                    └────────┬────────┘
                             │
             ┌───────────────┼───────────────┐
             ▼               ▼               ▼
        Authentication   Services        Routers
             │               │               │
             └───────────────┼───────────────┘
                             ▼
                    ┌─────────────────┐
                    │    Database     │
                    └─────────────────┘
🧰 Tech Stack
Frontend
React
JavaScript
Vite
CSS
Backend
Python
FastAPI
SQLAlchemy
Database
SQL database
Authentication
JWT-based authentication
📊 Project Progress
Milestone 1

Core application foundation

Authentication

Customer functionality

Admin functionality
Milestone 2

Subscription system

Payment flow

Billing system

Invoice handling

Payment cancellation

Refund workflow

Payment summary

Payment method management

INR currency conversion / formatting

Admin billing statistics
Milestone 3

OTT platform structure

Customer dashboard

Admin dashboard

Streaming functionality

Content/video playback integration

Payment and subscription flows integrated with the OTT experience

Dashboard UI redesign work

Landing page redesign

Sign-in / Sign-up redesign

🧪 Verification
The project has been tested across the major customer payment and billing
flows, including:
Payment creation
Successful payment
Checkout cancellation
Invoice state transitions
Subscription state transitions
Payment summary aggregation
Payment method retrieval
Admin billing statistics
INR revenue formatting
Production frontend build
The frontend production build completes successfully.

🎯 Project Goal
The goal of StreamVerse is to provide a complete OTT experience combining:
Content → Subscriptions → Payments → Billing → Administration → Streaming
within a single full-stack platform.
📌 Status
🚧 Active Development
Core OTT, subscription, payment, billing, and administration functionality is
implemented. The remaining work is focused primarily on final UI/UX
refinement, player improvements, content population, and final QA.
