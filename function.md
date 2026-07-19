# Chapter 3 – Functional Requirements

## 3.1 Introduction

This chapter defines all functional requirements of Labour Connect Nepal.

A functional requirement describes a capability that the system must provide to its users.

All functionality described in this chapter is mandatory unless explicitly marked as a future feature.

---

# 3.2 Mobile Application

The system shall provide one React Native mobile application.

The application shall support three user roles.

• Customer

• Independent Worker

• Company

The user interface shall automatically change according to the authenticated user's role.

---

# 3.3 Splash Screen

The application shall display a branded splash screen during startup.

The splash screen shall:

• Display the Labour Connect Nepal logo.

• Display the application name.

• Display a Nepali welcome message.

• Check authentication status.

• Check onboarding completion.

• Navigate to the correct screen.

---

# 3.4 Onboarding

The application shall provide onboarding screens for first-time users.

The onboarding shall explain:

• Marketplace concept

• Trusted workers

• Verified companies

• Easy booking

• Secure platform

Users shall be able to:

• Continue

• Skip

Onboarding shall never be shown again after completion unless reset.

---

# 3.5 Authentication

The system shall provide secure authentication.

Supported features:

• Login

• Register

• OTP Verification

• Forgot Password

• Reset Password

• Logout

• Session Persistence

Authentication shall be powered by Supabase Authentication.

---

# 3.6 Role Selection

After successful registration, users shall select one role.

Available roles:

• Customer

• Independent Worker

• Company

The selected role determines:

• Navigation

• Dashboard

• Features

• Permissions

Users cannot switch roles from inside the application.

---

# 3.7 Customer Functional Requirements

The Customer module shall include:

## Home

The Home screen shall display:

• Search bar

• Service categories

• Featured workers

• Featured companies

• Recently added providers

• Popular services

---

## Search

Customers shall search using:

• Worker name

• Company name

• Service category

• Location

• Experience

• Availability

Search results shall support:

• Sorting

• Filtering

• Pagination

---

## Categories

Customers shall browse all available service categories.

Categories shall be dynamically loaded from Supabase.

---

## Worker Profile

Customers shall view:

• Profile photo

• Name

• Skills

• Experience

• Rating

• Reviews

• Working areas

• Available services

• Verification badge

• WhatsApp button

• Call button

• Book Service button

---

## Company Profile

Customers shall view:

• Company logo

• Company name

• Description

• Services

• Employees (if public)

• Branches (if applicable)

• Reviews

• Ratings

• Verification badge

• WhatsApp button

• Call button

• Book Service button

---

## Booking

Customers shall:

• Select service

• Select date

• Select time

• Enter address

• Add service notes

• Submit booking request

Booking requests shall be stored in Supabase.

---

## Booking History

Customers shall view:

• Pending bookings

• Accepted bookings

• Completed bookings

• Cancelled bookings

Each booking shall have a details page.

---

## Reviews

Customers shall:

• Rate workers

• Rate companies

• Submit written reviews

Reviews shall only be available after completed bookings.

---

## Favorites

Customers shall:

• Save workers

• Save companies

• Remove saved providers

Favorites shall synchronize across devices.

---

## Notifications

Customers shall receive:

• Booking updates

• Verification updates (if applicable)

• System announcements

• Subscription announcements (future)

---

## Profile

Customers shall:

• Update profile

• Change password

• Update contact information

• Manage notification preferences

• Logout

---

# 3.8 Independent Worker Functional Requirements

Workers shall be able to:

• Register

• Verify identity

• Upload documents

• Select multiple service categories

• Define working locations

• Set availability

• Receive booking requests

• Accept bookings

• Reject bookings

• View booking history

• Manage profile

• Manage subscription

• Receive notifications

Workers shall not have access to:

• Payroll

• Salary reports

• Expense tracking

• Accounting

---

# 3.9 Company Functional Requirements

Companies shall be able to:

• Register business

• Upload business documents

• Complete verification

• Manage company profile

• Manage employees

• Manage branches

• Receive booking requests

• Assign workers

• Manage services

• View reviews

• Manage subscription

• Receive notifications

Companies shall not have access to:

• Payroll

• Salary management

• Expense tracking

• Accounting

---

# 3.10 Booking Functional Requirements

The booking system shall support:

• Booking creation

• Booking acceptance

• Booking rejection

• Booking cancellation

• Booking completion

• Booking history

Booking statuses shall include:

• Pending

• Accepted

• Rejected

• Cancelled

• In Progress

• Completed

---

# 3.11 Subscription Functional Requirements

Subscription functionality shall support:

• Active plans

• Expired plans

• Renewals

• Plan upgrades

• Plan downgrades

Subscription information shall always be retrieved from Supabase.

No subscription values shall be hardcoded.

---

# 3.12 Notification Functional Requirements

The application shall notify users about:

• New bookings

• Booking updates

• Verification updates

• Subscription reminders

• System announcements

Notifications shall support future push notifications.

---

# 3.13 Service Categories

Service categories shall:

• Be stored in Supabase

• Support unlimited categories

• Support multiple category selection

• Support future expansion

The application shall never hardcode service categories.

---

# 3.14 Error Handling

Every feature shall support:

• Loading state

• Empty state

• Error state

• Success state

The application shall never crash because of invalid user input.

---

# 3.15 Accessibility

The application shall support:

• Readable typography

• Large touch targets

• Screen reader compatibility where possible

• Consistent navigation

• Responsive layouts

---

# 3.16 Performance

The application shall:

• Load quickly

• Support pagination

• Cache frequently used data

• Optimize images

• Minimize unnecessary API calls

---

# 3.17 Future Functional Expansion

The system architecture shall allow future integration of:

• Company Admin Dashboard

• Super Admin Dashboard

• Analytics

• CMS

• AI-powered recommendations

• Additional service categories

without requiring significant changes to the mobile application's architecture.

---

End of Chapter 3 – Functional Requirements