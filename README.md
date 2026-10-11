# Teacher Desk

Your teaching workspace, all in one place.

A build-free HTML, CSS, and vanilla JavaScript PWA, styled around the supplied Teacher Desk reference: deep maroon sidebar, warm illustrated desk banner, cream workspace, colorful centered website cards, compact task panel, and mobile list navigation.

## October 11 redesign

- A new illustrated wooden desk logo and matching install icons.
- Warm skeuomorphic paper panels, raised colored buttons, inset fields, and matching dialogs/loading notices.
- Five workspace panels: Home, My Websites, Categories, Notes, Settings. Favorites, Recently Opened, and Resources panels have been removed. Existing records are retained; no destructive migration is needed.
- Stars now pin websites to the front of Home and shortcut mode. Arrange pinned order in Settings.
- The bottom-right switch changes between Full desk and Shortcut mode. Shortcut mode contains only website tiles and an Add Website tile. The mode choice is saved in this browser.
- Task changes update only the task panel. Website and note updates likewise refresh their own region. There are no whole-page entry animations.
- Titles use Helvetica, subtitles Poppins, and labels/controls Inter.
- Operation-specific loading notices cover adding/saving, deleting, notes, and sign-in/out. They are scoped to an open dialog when possible.

### Updating an existing deployment

Keep your configured `js/config.js` and replace the other files. Do not rerun `sql/setup.sql` on an existing installation. Deploy all files together, accept the PWA update when offered, and keep the same site origin to retain local preview data. Direct-file browser storage is browser/path-specific; moving an extracted folder can change access to preview data.

## Start here

The ZIP is the complete static project. No npm installation, build command, framework, or Android Studio is needed to publish it.

**The first launch is a local preview until you configure Supabase.** Preview data is stored in this browser's localStorage. It is not a cloud backup and does not transfer to another browser. The ten reference websites are editable examples, with intentionally empty live URLs. Click an example to enter its real URL; no destination has been invented for it. Quick Access includes real external links whose availability is controlled by their owners.

After Supabase is configured, preview records are not imported automatically. Teachers sign in and receive a private, initially empty workspace, default categories, and Quick Access links.

## 1. Set up Supabase

1. Create a Supabase project in your own account. Keep its database password private.
2. Open the project's **SQL Editor** and run the entire `sql/setup.sql` file once. Use a fresh project or verify these table names are unused. The transaction creates ten tables, ownership policies, category and favorite relationships, helper functions, and a private `logos` bucket. The file is intentionally a first-install script, not an idempotent migration.
3. Open Project Settings → API (or the Connect panel). Copy the project URL and **publishable** key. A legacy `anon` key also works. Never copy the `service_role` or secret key into this app.
4. Edit `js/config.js`:

   ```js
   globalThis.TEACHER_DESK_CONFIG = Object.freeze({
     supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
     supabasePublishableKey: 'YOUR_PUBLISHABLE_KEY'
   });
   ```

5. In Supabase Authentication → URL Configuration, set your **Site URL** to the exact published app URL, including its repository path and trailing slash, e.g. `https://YOUR_NAME.github.io/TeacherDesk/`.
6. Add that same URL to **Redirect URLs**. If testing locally, also allow the exact local origin and path you use, e.g. `http://localhost:8000/`.
7. Enable Email authentication. Keep confirmation emails enabled for production. Configure a production SMTP provider and appropriate Auth rate limits before inviting teachers. Supabase's default email service has sending restrictions.
8. If your project does not expose the `public` schema to the Data API, enable it in API settings. The SQL explicitly grants authenticated access; RLS still limits each row to its owner.
9. Publish the files, create an account, follow the email confirmation link, and sign in.

`sql/verify.sql` provides read-only schema checks. No server-side service-role credentials are needed for this app.

## 2. Publish on GitHub Pages

1. Create a GitHub repository, for example `TeacherDesk`.
2. Upload the **contents** of this folder to the repository root. `index.html`, `manifest.webmanifest`, and `service-worker.js` must be directly at the root, next to `css`, `js`, `assets`, and `sql`.
3. In repository Settings → Pages, choose **Deploy from a branch**, select your branch and `/ (root)`, and save.
4. Wait for Pages to publish. Open its HTTPS URL, then confirm the Supabase URLs from the previous section match it.
5. Sign in and add a real website. Verify it appears after reloading and from a second browser/device.

All asset paths, manifest paths, and the service worker are relative, so repository subpaths are supported. A `.nojekyll` file is included. Public Supabase keys are expected to be visible; the RLS policies protect the data.

### Optional local preview

Serve this directory with any static HTTP server or an editor's Live Server. If Python is already installed, run `python -m http.server 8000` from this directory and open `http://localhost:8000/`.

For a quick local preview, extract the entire ZIP and double-click `index.html`. The included classic-script bundle supports direct file opening. Installation, authentication email redirects, and service workers still require an HTTP(S) deployment. Deploying to GitHub Pages does not require installing a local server.

The shipped `js/app.bundle.js` is ready to use. `js/config.js` remains separately editable without rebuilding. Developers modifying the modular source should regenerate the bundle with esbuild (entry `js/app.js`, bundle format `iife`, target `es2020`), or use the module entry while developing on an HTTP server.

## Using your desk

- **Websites:** Add a name, live URL, category, optional repository URL, description, and icon. The three-dot menu edits, duplicates, deletes, and opens the repository. The main card opens the live website in a new tab. The star toggles a favorite.
- **Icons:** Choose a library icon, a first-letter fallback, the site's `/favicon.ico`, or an uploaded PNG/JPG/SVG/WebP (up to 2 MB). Uploaded files are rasterized to 256×256 PNG, eliminating active SVG markup. A failed favicon falls back to the first letter. Favorites and uploads are separate controls.
- **Categories:** Add, rename, or recolor. Deletion asks for a destination and atomically moves websites and resources before deleting the category.
- **Pinned websites:** Click a star to pin a website. Pins appear first on Home and in shortcut mode. Settings contains up/down buttons to order them.
- **Shortcut mode:** Use the bottom-right switch to show just the website launcher. The final tile adds a website. Toggle back to access notes, categories, tasks, and settings.
- **Quick Access:** Add or manage a shortcut through its three-dot menu; choose Move earlier/later to rearrange it.
- **To Do Today:** Add or edit a task, set an optional due date, complete it, or delete it. Pending, Completed, and All filters include every task, so overdue and future tasks are never silently hidden.
- **Notes:** Add a title and content. Changes save after 800 ms of inactivity; the status reads Saved only after persistence succeeds. Save & Close also flushes pending changes. Notes support pinning, searching, colors, and creation/update dates.

- **Settings:** Edit your display name and avatar, show/hide Home panels, reorder favorites, manage category colors, and change your password.
- **Authentication:** Sign in, create an account, sign out, or request a password reset. A reset link opens the Change Password dialog. Password fields support showing/hiding on the sign-in form.

The interface is light mode only. The greeting and date use the teacher's device time. The sample preview name is Simon, matching the reference; signed-in teachers use their own profile name.

## Sync, privacy, and offline behavior

- Every row is owned by an authenticated user's UUID. RLS enforces SELECT, INSERT, UPDATE, and DELETE ownership. User-editable metadata is never used for authorization.
- Composite foreign keys prevent cross-owner category and website relationships. Favorites and recent entries cascade when their website is removed. Website + favorite saving and category moves use database transactions.
- Each teacher's logo path begins with their UUID. The bucket is private; the app requests expiring signed URLs. Replaced/deleted logos can remain as unreferenced objects; administrators may periodically remove these after checking references. No public bucket is required.
- Auth sessions persist through the official Supabase SDK. Cloud records are held in page memory and fetched again after sign-in. Signing out clears the in-memory workspace. Only preview records use localStorage directly.
- Visible, idle cloud dashboards refresh every 30 seconds and on returning to the tab. Editing dialogs pause polling. Changes saved in another device become visible on refresh; concurrent edits to the same record use the last completed save.
- The service worker caches only the static shell, fonts, icons, and illustration. It never caches Supabase records, uploaded images, signed URLs, or external destinations.
- Offline cloud writes are blocked and are **not queued**. A clear error preserves the current editing dialog so the teacher can retry after reconnecting. A cold offline cloud launch may show a connection error rather than private records. Preview mode can save locally offline.
- Local preview data is not intended for sensitive student information. For production, apply your organization's data-handling requirements to your own Supabase project and accounts.

## PWA installation and updates

- Android and compatible desktop browsers: use **Install Teacher Desk** when the browser offers installation, or its Install app menu.
- iPhone/iPad: open in Safari → Share → Add to Home Screen.
- HTTPS or localhost is required. Icon files include 192×192, 512×512, maskable 512×512, and a 180×180 Apple touch icon.
- To release an update, upload the changed files and increment `VERSION` in `service-worker.js`. Existing users receive an Update Now dialog when a new worker is waiting. Their server-side data is retained.

## Project map

```text
index.html               App shell and navigation landmarks
css/styles.css           Desktop layout, typography, components, dialogs
css/responsive.css       Tablet/mobile adaptation and safe-area navigation
css/desk.css             Skeuomorphic surfaces, shortcut mode, tactile controls
js/config.js             Public Supabase configuration
js/app.js                Navigation, panels, events, PWA and refresh logic
js/auth.js               Account and profile workflows
js/store.js              Cloud/local persistence, uploads, atomic operations
js/websites.js           Website cards and editor
js/editors.js            Categories, notes, tasks, resources, shortcut editors
js/ui.js                 Accessible dialogs and shared UI helpers
js/utils.js              Icons, escaping, URL validation, date labels
js/vendor/               Pinned Supabase JavaScript SDK and license
assets/                  Bundled illustration, logo, fonts, PWA icons
sql/setup.sql            First-install database and storage setup
sql/verify.sql           Read-only schema inspection
manifest.webmanifest     Install metadata
service-worker.js        Static shell cache and update handling
offline.html             Offline fallback
VERIFICATION.md          Tests completed and remaining live-service checks
```

## Troubleshooting

- **Failed to fetch / invalid API key:** check `js/config.js`, the project state, and your network connection. Use a publishable key from the same project as the URL.
- **Relation or function does not exist:** run the whole setup SQL in the correct project and check Data API schema exposure.
- **RLS error:** sign in again and verify all setup policies exist. Do not disable RLS as a workaround.
- **Email link returns to the wrong location:** correct both Site URL and Redirect URLs, then request a new link.
- **New fonts or files not appearing:** deploy all files, increment the service worker version, and accept Update Now. A hard refresh can help during development.
- **Favicon missing:** some sites do not provide `/favicon.ico` or block external image loading; choose a library icon or upload a logo.
- **Saving error:** the app has not claimed cloud success. Read the message, correct the connection/configuration, and retry. In local preview, browser storage quotas can also prevent saving.

## Credits and assets

Supabase JavaScript SDK **2.57.4** is bundled under its MIT license. Inter and Poppins are bundled under the SIL Open Font License; license files are in `assets/fonts/`. Helvetica uses the device's installed font with an Arial fallback. Interface SVG icons were created for this project. The new transparent desk logo was generated for this redesign. The hero illustration was generated with the built-in image generation tool, guided by the supplied reference. See `assets/ASSET-NOTES.md` for its prompt.

Documentation used: [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [password reset](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), and [Supabase changelog](https://supabase.com/changelog).

## My Websites links and logos

The entire website card opens its saved **Live website URL** in a new tab. The star and three-dot controls work separately. Starter/example cards have no live URL until you set one: click the card, paste the real `https://...` website address (not just its GitHub repository), and select **Save Website**. Existing saved URLs are not replaced.

Teacher Desk first uses a custom logo you uploaded for a website; otherwise it tries icons from the live website (including common GitHub Pages/PWA icon paths) and falls back to a letter if none loads. You can still upload a custom website logo when the automatic one is unavailable. Profile photo uploading was removed from Settings, and the sidebar now uses the first initial of your display name.
