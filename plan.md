# LABOUR CONNECT NEPAL: MASTER TECHNICAL SPECIFICATION MANUAL
Document Revision: 2026.7.19
Architecture: React Native (Expo) + NativeWind (Tailwind CSS) + Next.js Web Admin + Supabase Backend

====================================================================================================
SECTION 1: SYSTEM CORE DESIGN & ROLE-BASED ACCESS CONTROL (RBAC)
====================================================================================================

The system implements a rigid, immutable Role-Based Access Control framework at the database layer. 
A single mobile number or email authentication profile is mapped to exactly one identity type inside 
the system to ensure absolute auditability and clear boundary lines.

1.1 THE CUSTOMER PROFILE (Consumer Node)
  - Marketplace Access Cost: 100% Free.
  - Core Competency: Consumes local services via geographical dispatch.
  - Mechanics:
    * Interacts with highly responsive Mapbox/Google Maps location picking structures.
    * Executes a single-target "Direct Booking" or fires a "Broadcast Request" hitting up to 
      10 nearby matching provider assets simultaneously.
    * Exercises absolute manual authority to pick the winning worker from an incoming stream 
      of live worker acceptances.
    * Unlocks a dedicated external communication action ribbon (WhatsApp intent bridge + 
      direct carrier fallback phone call link) only AFTER a job is confirmed.
    * Operates as the sole source of reputation data by filing a 1-to-5 star metric evaluation 
      and textual review log upon order completion.

1.2 THE INDEPENDENT WORKER (Solo Labour Node)
  - Marketplace Access Cost: Gated by the 15-Day Trial rule or a flat-rate Monthly Subscription.
  - Core Competency: Operates as a solo tradesperson, handling their own calendar and tool setup.
  - Mechanics:
    * Steps through a mandatory identity verification queue by uploading high-res photos of 
      their National Identity Card/Citizenship Document and a validation selfie.
    * Interacts with real-time application availability hooks, shifting states dynamically 
      among: "Available" (receives new search traffic and broadcasts), "Busy" (hides from new 
      broadcast lists but allows chat), and "Offline" (completely drops out of the local search matrix).
    * Manages active scheduling blocks, standard hourly/daily labor baseline fee structures, 
      and localized target coordinates.
    * Accesses promotional priority visibility toggles by spending a fixed flat fee to attach 
      a "Featured Operator" badge to their profile container, jumping to the top of consumer searches.

1.3 THE COMPANY ADMIN (Enterprise Node)
  - Marketplace Access Cost: Gated by tiered subscription caps based on internal employee numbers.
  - Core Competency: Manages corporate multi-person infrastructure, agency fleets, and manual dispatch.
  - Mechanics:
    * Admin users have exclusive control to create, provision, edit data arrays for, and 
      permanently delete individual internal employee accounts. Workers belonging to an agency 
      CANNOT sign up independently on the platform.
    * Provisions up to 5 distinct spatial branch offices (sub-nodes) across different operating cities.
    * Assigns explicit "Branch Manager" credentials to users, framing their database visibility 
      strictly to the branch coordinates they control.
    * Controls an internal manual order routing panel. The system NEVER auto-assigns jobs. 
      When a customer books a company, the Company Admin must explicitly assign it to a local 
      operating branch and manually hand the job sheet to a specific employee profile.

1.4 THE SUPER ADMIN (Platform Control Center)
  - Marketplace Access Cost: Internal Master Entity.
  - Core Competency: Operates the global business engine via a desktop Next.js web application.
  - Mechanics:
    * Acts as the ultimate verification gatekeeper. Reviews uploaded business PAN/VAT documents, 
      corporate registries, and worker identities to flag accounts as "Verified".
    * Orchestrates the primary structural categories matrix, managing global taxonomies to ensure 
      no messy overlap occurs (e.g., locking out individual user creations of duplicate entries 
      like "AC Mechanic" vs "AC Installer").
    * Conducts full financial accounting audits, matching programmatic eSewa/Khalti/Fonepay checkout 
      logs alongside manual uploaded bank transfer transaction slips.
    * Controls absolute platform moderation controls, allowing them to delete fraudulent text reviews, 
      flag problematic user arrays, and issue temporary blocks or complete account bans.

====================================================================================================
SECTION 2: SUBSCRIPTION ARCHEOLOGY & THE 15-DAY TRIAL STATE MACHINE
====================================================================================================

The platform operates a time-locked, data-driven revenue model. Every provider account (Independent 
Worker or Corporate Entity) is subjected to a strict state engine checking trial dates and payment statuses.

2.1 THE 15-DAY FREE PLAY STATE
  - Trigger Condition: Set automatically upon row insertion inside the database (`profiles.created_at`).
  - Visibility Rules: System sets `is_eligible_for_feed = true`. Non-subscribed trial accounts 
    are treated exactly like premium paid layers inside consumer search screens. They show up on 
    nearby maps, calculate relative distances, display in category list rows, and take in live 
    customer broadcast notifications.

2.2 THE DAY 16 HARD SUBSCRIPTION ENFORCEMENT GATE
  - Trigger Condition: `current_date > profiles.created_at + INTERVAL '15 days'` AND 
    `active_subscription_token == false`.
  - UI Behavior: Instantly intercepts the mobile application entry point. Hides all management 
    tabs and overlays a full-screen, un-dismissable "Subscription Upgrade Required" Paywall Portal. 
    Standard operations are completely locked until a plan selection event is finalized.

2.3 THE 3-DAY WORK LIFECYCLE GRACE buffer WINDOW
  - Trigger Condition: Fired the moment a paid plan cycles out or a trial period lapses.
  - Operational Scope: The platform applies a strict 3-day buffer rule to protect ongoing business contracts:
    * Hiding Condition: The provider's profile card layout is completely stripped from the customer's 
      marketplace dashboard grid and category feeds. They cannot receive *new* direct bookings or broad queries.
    * Access Condition: The worker/company app dashboard remains functional *only* to inspect historical data, 
      wrap up jobs currently marked "In Progress", execute employee updates, and clear out running workflows.
    * System Lockout: If zero subscription token renewals are successfully registered before Day 3 ends, 
      the operational workspace shifts to a total lockout state, keeping historical profile logs safe but 
      freezing all functionalities.

2.4 SUBSCRIPTION PRICING GRID & CAPACITIES DATABASE MATRIX
  Independent workers purchase visibility visibility boosts, while companies buy processing power:

  - INDEPENDENT LABOUR PASS: 
    * Price: NPR 499 / Month
    * Constraints: 1 User Node, 0 Employee Roster Sub-slots, 0 Extended Branch Nodes.
  
  - COMPANY STARTER TIER: 
    * Price: NPR 2,900 / Month
    * Constraints: Up to 50 Concurrent Employee Profiles, 2 Local Branch System Sub-nodes.
  
  - COMPANY GROWTH TIER: 
    * Price: NPR 8,900 / Quarter (3 Months)
    * Constraints: Up to 150 Concurrent Employee Profiles, 5 Local Branch System Sub-nodes.
  
  - ENTERPRISE FLEET TRANSIT: 
    * Price: NPR 35,900 / Year (12 Months)
    * Constraints: Unlimited Personnel Slots, Unlimited Regional Branch Nodes, Top Priority Ad Slots.

====================================================================================================
SECTION 3: STEP-BY-STEP PLATFORM USER LIFECYCLE EXECUTION
====================================================================================================

3.1 FEED FILTERING & COMPLIANCE ALGORITHM
  When a consumer clicks on a category icon, the frontend triggers a spatial query matching the 
  resolved coordinates. The system passes the database array through a multi-step boolean check:
  
  SELECT * FROM provider_profiles 
  WHERE category = 'target_id' 
    AND account_status = 'Active' 
    AND verification_status = 'Approved'
    AND availability_state = 'Available'
    AND (has_active_subscription = true OR current_date <= created_at + INTERVAL '15 days');

3.2 DISCOVERY SCREEN RANKING ALGORITHM
  The returned dataset maps visually to the list component layout using the following row hierarchies:
    - Tier 1: Promoted Featured Tiers (Paid promotional tokens, top screen rows).
    - Tier 2: Spatial Proximity Metrics (Calculated shortest travel distance using GPS geolocation data).
    - Tier 3: Work Performance Data (Highest historical count of completed jobs + star review averages).

3.3 RECONCILED DASHBOARD FEED HANDLING (STRICT CONDITIONAL INTERFACE)
  - Rule: The "Recent Bookings" feed tracking area must stay completely hidden from the customer's 
    home screen view if there are zero active confirmed orders tied to their user token.
  - State A (No active jobs): The UI removes the feed container entirely and displays an informational, 
    teal-tinted promotional card reminding users how to select a labor trade category.
  - State B (Job Confirmed): The homepage layout shifts immediately, revealing the tracking component 
    with custom live status badges ("Pending Response", "Worker Dispatched", "Job In Progress").

3.4 MULTI-PROVIDER REQUEST BROADCAST SYSTEM
  - Action: The user sets up their task specs, details instructions, selects an address vector, 
    and checks boxes next to multiple local profiles (up to 10 matching assets at once).
  - System Response: Real-time notification services broadcast the job packet. As workers open their 
    apps and tap "Accept", their full worker metrics populate a live selection screen for the customer.
  - Resolution: The customer reviews the bidders and taps one profile. The system marks that selected 
    booking record status as "Assigned", issues an auto-cancel sequence to the other 9 profiles, 
    and reveals the transactional WhatsApp intent button layer for external coordination.