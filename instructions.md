# Mrittika — Project Overview & Current Task

## Project Overview

**Mrittika** is a multi-vendor e-commerce marketplace for sustainable, eco-friendly, and ethically produced products, built as an academic project for the E-Commerce course.

**Team:** Soham Sawant (A052), Anukalp Chaturvedi (A007), Shubham Murkunde (F025)
**Timeline:** 10 weeks
**Scope:** Working frontend + backend, 15 core pages plus supporting legal pages

### What it sells
A curated multi-vendor catalog of sustainable goods across categories such as:
- Home & living
- Personal care
- Fashion
- Food

Vendors are independent sellers who apply, get onboarded, and list their own products (vendor-owned inventory, not platform-owned).

### What makes it different
Modeled on real Indian sustainability marketplaces (Brown Living, The Sustainable Marketplace), but adds two features neither of them combines well:
1. **A structured sustainability scoring engine** — every product is evaluated against a defined set of sustainability criteria based on vendor-submitted documentation.
2. **A personalized per-user impact dashboard** — logged-in buyers see their cumulative impact (e.g. plastic saved, purchases made) across their order history.

### Reference competitors
- [Brown Living](https://brownliving.in)
- [The Sustainable Marketplace](https://thesustainablemarketplace.in)

### Suggested tech stack (not mandated — team is free to choose)
React (or Next.js) frontend, Node/Express or Django backend, PostgreSQL database.

---

## Current Task: Website Scaffolding

Our immediate job is **not** a full build — it's a **scaffold**: the skeletal structure of the site (pages, navigation, routing, placeholder content/layout) that we will flesh out in later sprints.

**Top priority for this pass:** integrate the legal framework content (copyright notice, disclaimer, terms & conditions, grievance redressal) into actual site pages — not just as a planning document, but as real pages/footer content in the scaffold.

### Deliverables for this task
1. Scaffolded page structure for all pages listed below (routing + basic layout, placeholder content where the real content isn't ready yet).
2. Legal pages built with the **final drafted text** (not placeholders) — pull directly from the Legal, Ethical & Regulatory Compliance Framework doc already prepared.
3. Screenshots of each scaffolded page, saved and uploaded as submission evidence.

### Pages to scaffold

**Core commerce pages (15):**
- [ ] Homepage
- [ ] Category listing page
- [ ] Product detail page
- [ ] Cart page
- [ ] Checkout page
- [ ] User registration / login page
- [ ] User profile + order history + impact dashboard
- [ ] Vendor registration page
- [ ] Vendor dashboard
- [ ] Admin panel
- [ ] Search results page (with "Shop by Impact" filters)
- [ ] Sustainability guide page
- [ ] Blog / journal page
- [ ] About us / mission page
- [ ] Contact / FAQ page

**Legal pages (build with final text, integrate this pass):**
- [ ] Copyright notice — footer snippet, present on every page
- [ ] Website Disclaimer — standalone page
- [ ] Terms and Conditions — standalone page, linked at registration and checkout with a mandatory acceptance checkbox
- [ ] Grievance Redressal — standalone page or section (Grievance Officer name/contact, per Consumer Protection E-Commerce Rules 2020)
- [ ] Privacy Policy — standalone page *(referenced throughout the legal framework doc but not yet drafted — flag as pending, draft next)*

**Not a site page:** the Vendor MOU is an offline/executed document between Mrittika and each vendor, not a public website page — no scaffolding needed for it.

### Definition of done for this pass
- Every checklist item above exists as a routed page in the project, even if core-commerce pages only have placeholder/lorem content for now.
- Legal pages contain the actual finalized text, correctly formatted.
- Screenshots taken of each page in its current scaffolded state and uploaded.