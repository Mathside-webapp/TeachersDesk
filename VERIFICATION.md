# Verification — 10 October 2026

## Direct-opening fix

The shipped app now uses a prebuilt classic JavaScript bundle, with a separately editable `js/config.js`. A freshly extracted ZIP was tested by opening `index.html` directly via a file URL: all ten cards rendered, a newly created website persisted after reload, mobile navigation worked, and no JavaScript runtime errors occurred. The original module-only entry required an HTTP server and could remain on “Opening your desk…” when double-clicked. A startup error handler now reports missing app files instead of leaving that loader indefinitely. PWA registration is skipped for file URLs.

## Passed in a real browser

Automated checks ran in headless Microsoft Edge against the local HTTP server at desktop (1440×1000), tablet (1024×900), and mobile (390×844) viewport sizes. Desktop and mobile captures were visually inspected against the supplied reference.

- Ten reference example websites render; sample destinations are intentionally unset.
- Website creation, editing, confirmation-based deletion, and refresh persistence.
- Search filtering, favoriting, and distinct GitHub repository/live website URLs.
- Launching a real configured URL in a new tab and recording recent activity.
- Category creation; deleting a category preserves and moves its websites.
- Note creation, automatic saving, and Save & Close.
- Task creation, completion, and completed filtering.
- Resource creation and external link rendering.
- Uploaded PNG preview before saving, rasterized persistence, and rendered logo.
- Unsafe URL rejection and HTML-like website titles displayed as text.
- Shortcut reordering and profile display-name updates.
- Tablet/mobile layouts fit without horizontal page overflow.
- Mobile bottom navigation and dialog viewport fit.
- Service worker registration, offline app-shell reload, and accurate offline status.
- No JavaScript runtime errors during the completed main workflow test.

All application modules passed Node syntax checking. PWA icons were generated at 192, 512, and 180 pixels, plus a 512-pixel maskable icon. Local assets and font licenses are included.

## Passed in local PostgreSQL

The complete `sql/setup.sql` executed in PGlite PostgreSQL, using minimal mocked Supabase `auth` and `storage` schemas. Tests switched between two authenticated user UUIDs and exercised actual SQL policies and functions:

- A second account cannot read another account's categories, websites, favorites, notes, or private image objects.
- Cross-account updates, deletes, RPC upserts, and forged ownership inserts are denied.
- Cross-account category references are denied by composite foreign keys.
- Row ownership cannot be reassigned to another user.
- Category moves preserve website records.
- Deleting a website cascades its favorite relationship.

These tests validate the SQL logic locally. They do not substitute for testing the deployment against Supabase's live API and Storage services.

## Still required after configuring your Supabase project

No project URL, publishable key, test accounts, or email provider was supplied. Consequently, the following were implemented but could not be verified against a live project:

1. Sign-up, confirmation email delivery, sign-in, session restoration, and sign-out.
2. Forgot-password email redirect and password update.
3. Real Storage uploads, signed URL expiry/renewal, and live storage policy enforcement.
4. Cross-device synchronization through the hosted Data API.
5. Actual installation on physical iOS/Android devices and Safari-specific behavior.
6. Deployment to the user's GitHub Pages repository.

Follow README.md, then repeat the main workflow with two different accounts and two devices before inviting teachers. Verify the second account cannot read the first account's records or storage objects. Run `sql/verify.sql` to inspect the installed configuration.

## Design fidelity

The layout, maroon/cream palette, website list, category pills, quick links, and mobile navigation follow the supplied image. The sunlit banner was regenerated from that reference. The logo and UI icons are custom SVG equivalents; the deliverable is a working responsive implementation, rather than a pixel-for-pixel raster copy. Profile names, dates, counts, active filters, and tasks are dynamic.

## October 11 redesign checks

Browser tests on the new direct-open bundle passed: five-item navigation with removed panels absent; starred websites leading Home; task checkbox and confirmed deletion retaining the exact hero, grid, and sidebar DOM nodes; shortcut-only grid with one Add Website tile; mode choice persisting after reload; adding a website through the tile with a visible loading notice; note saving with its loading notice; full and shortcut mobile layouts without page overflow; mobile dialog fitting the viewport; and no runtime errors. Desktop and mobile screenshots cover both modes and the website dialog. Live Supabase sign-in/out remains untested without configured credentials; the shared loading mechanism and operation-specific labels are wired into those flows.

Final checks: website, shortcut, and task controls meet a 44px minimum hit target. Shortcut deletion preserves the Home hero DOM node. The finish reviewer marked the unchecked-checkbox contrast finding resolved on desktop and mobile. The design-context launcher/detector was unavailable; manual source extraction and independent screenshot review were used.
