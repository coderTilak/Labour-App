# Chapter 2 — Business Requirements

## 2.1 Business Overview

Labour Connect Nepal is a digital marketplace that connects customers with verified independent workers and registered companies. The platform acts as a facilitator by enabling users to discover, compare, and book service providers through a modern mobile application.

The platform does not directly provide labour services. All services are delivered by independent workers or companies registered on the platform.

Labour Connect Nepal does not employ workers or companies. The platform is responsible only for facilitating discovery, bookings, verification, communication, and subscription management.

---

# 2.2 Marketplace Model

The application follows a three-sided marketplace model.

### Customer

Customers are individuals or organizations looking to hire skilled workers or companies for different services.

Customers can search, compare, and book service providers without paying any subscription fee.

---

### Independent Worker

Independent Workers are self-employed professionals who provide services directly to customers.

Workers maintain their own profile, select service categories, define service areas, manage availability, and receive bookings.

Workers require an active subscription according to the subscription plans defined by the platform.

---

### Company

Companies are registered businesses that provide one or more services.

A company can receive bookings, manage employees, manage branches, maintain business information, and operate under an active subscription plan.

Each company has only one administrator who manages the company account within the mobile application.

Future web dashboards will extend these capabilities without changing the mobile application's architecture.

---

# 2.3 Business Objectives

The platform shall achieve the following objectives.

• Digitalize Nepal's labour marketplace.

• Connect customers with trusted service providers.

• Increase transparency through verification.

• Simplify service booking.

• Reduce customer search time.

• Help workers and companies expand their business.

• Build a scalable nationwide marketplace.

---

# 2.4 Core Business Principles

The following principles shall guide all future development.

## Marketplace First

The application exists to connect customers with service providers.

It is not a payroll system.

It is not accounting software.

It is not HR software.

It is not an employee management platform.

---

## Trust

Customer trust is one of the highest priorities.

Every worker and company should go through a verification process before becoming fully active.

Verification status should always be visible on profiles.

---

## Simplicity

The application should remain easy to use regardless of the user's technical knowledge.

Complex workflows should be minimized.

Important actions should require as few steps as possible.

---

## Scalability

Every feature shall be designed so future expansion is possible without major architectural changes.

Examples include:

• Additional subscription plans

• Additional service categories

• Future web dashboards

• Analytics

• AI features

---

## Security

User information shall remain protected.

Authentication must be secure.

Role-based permissions shall be enforced.

Only authorized users shall access protected resources.

---

# 2.5 Business Rules

The following business rules are mandatory.

## Rule BR-001

The platform shall only connect customers with workers and companies.

It shall never provide labour directly.

---

## Rule BR-002

Customers can browse the application without an active subscription.

Customers are free users.

---

## Rule BR-003

Independent Workers require an active subscription before receiving bookings.

The exact subscription behavior shall follow the Subscription System specification.

---

## Rule BR-004

Companies require an active subscription before receiving bookings.

---

## Rule BR-005

Every user account shall belong to only one role.

A user cannot simultaneously operate as both a Customer and an Independent Worker within the same account.

Changing roles shall require creating a new account or following a future account conversion policy.

---

## Rule BR-006

Every company shall have only one company administrator.

The administrator is responsible for:

• Company profile

• Employees

• Branches

• Services

• Subscription

• Company verification

---

## Rule BR-007

Super Administration is NOT part of the mobile application.

Platform-wide management shall be handled through a future web dashboard.

---

## Rule BR-008

Company Administration Dashboard shall also be developed separately as a future web application.

---

# 2.6 Verification Rules

Workers and companies shall complete verification before accessing all platform features.

Verification improves customer trust and marketplace quality.

Possible verification statuses include:

Pending

Verified

Rejected

Suspended

Future verification rules shall be managed through the Super Admin Dashboard.

---

# 2.7 Subscription Rules

Customer subscriptions do not exist.

Only Workers and Companies require subscriptions.

Subscription plans shall never be hardcoded.

Plans shall be dynamically loaded from Supabase.

The mobile application shall automatically reflect any subscription changes made from the future Super Admin Dashboard.

---

# 2.8 Communication Rules

The application shall not implement an internal chat system.

Communication shall occur through:

• WhatsApp

• Phone Call

Customers can contact workers and companies using these methods after appropriate booking or profile interactions, as defined elsewhere in this specification.

---

# 2.9 Booking Rules

A booking request originates from a customer.

Workers and companies may accept or reject booking requests.

Customers shall receive notifications for booking status changes.

Completed bookings allow customers to submit reviews.

Future booking analytics will be managed through the Super Admin Dashboard.

---

# 2.10 Review Rules

Only customers who have completed a booking may submit reviews.

Reviews shall be associated with the relevant worker or company.

Reviews become publicly visible after successful submission unless future moderation rules are introduced.

---

# 2.11 Future Expansion

The platform architecture shall support future features without requiring major rewrites.

Examples include:

• Company Admin Dashboard

• Super Admin Dashboard

• Advanced Analytics

• AI Recommendations

• CMS

• Payment Gateway Integration (if approved)

• Additional Subscription Plans

• Additional Service Categories

• Regional Expansion

---

# 2.12 Business Success Metrics

The success of the platform shall be measured through:

• Customer growth

• Active workers

• Active companies

• Successful bookings

• Verification completion rate

• Subscription renewal rate

• Customer satisfaction

• Average service ratings

• Platform reliability

---

**End of Chapter 2 – Business Requirements**