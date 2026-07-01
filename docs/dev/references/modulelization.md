# Pavillion Module Declaration — AI Reference Prompt

> **For AI assistants.** This document teaches you how to declare a NOVEx Engineering Tech module that is compatible with the **Pavillion package manager** (`pavillion.bat`) and the **Novex DevDoc Standard**. Read this fully before generating any module.

---

## What a "Module" Is

A Pavillion module is a self-contained, installable unit of code. It lives across one or more of these three scopes inside a NOVEx project:

| Scope | Folder | What goes here |
|---|---|---|
| `lib` | `frontend/src/app/lib/<ModuleName>/` | Side-effectful libraries (auth, API clients, DB, email…) |
| `utils` | `frontend/src/app/utils/<ModuleName>/` | Pure stateless helper functions (string, date, number…) |
| `components` | `frontend/src/app/components/<ModuleName>/` | Reusable React UI components |

The **manifest** (`pavillion.module.json`) lives separately at:

```
frontend/src/app/module/<ModuleName>/pavillion.module.json
```

It is the **only** thing inside `module/`. Never put source code there.

---

## How a User Declares a Module to You

A user will describe a module like this:

```
Module name: Example Module
Module ID: LIB-AUTH-001
Version: 1
Author: IzanamiiDevv
Depends on: (none / or list other module_names)

Lib: <source code or description>
Utils: <source code or description>
Components: <source code or description>
```

They may provide one scope, two, or all three. Generate **only the scopes they specify**.

---

## Files You Must Generate per Scope

### `lib/<ModuleName>/` and `utils/<ModuleName>/`

```
README.md
types.ts
index.ts
```

### `components/<ModuleName>/`

```
README.md
types.ts
style.css
index.tsx        ← TSX, not TS
```

### `module/<ModuleName>/` (always, regardless of scopes)

```
pavillion.module.json
```

---

## 1. `pavillion.module.json` — The Manifest

This is what `pavillion install` reads. **Every field is required.**

```json
{
  "module_name": "Example Module",
  "author": ["IzanamiiDevv"],
  "module_id": "LIB-EXM-001",
  "version": 1,
  "depends_on": [],
  "uses": ["lib", "utils"]
}
```

| Field | Type | Rules |
|---|---|---|
| `module_name` | `string` | Human-readable display name. Must match how other modules reference it in `depends_on`. |
| `author` | `string[]` | GitHub handles or full names in an array. |
| `module_id` | `string` | Unique ID in `CATEGORY-SCOPE-NUMBER` format. See Unique ID section below. |
| `version` | `number` | Integer. Starts at `1`. Increment on breaking changes. |
| `depends_on` | `string[]` | Array of `module_name` values of required modules. Empty array if none. |
| `uses` | `string[]` | Which scopes this module provides. Values: `"lib"`, `"utils"`, `"components"`. |

> `pavillion status` reads `depends_on` to detect missing modules.
> `pavillion status module` reads `uses` to verify files exist on disk.

---

## 2. Unique ID Convention

Every module, file, and function gets a unique ID in this format:

```
<CATEGORY>-<SCOPE>-<NUMBER>
```

| Category | Prefix | Example |
|---|---|---|
| Utility | `UTL` | `UTL-STR-001` |
| Library | `LIB` | `LIB-AUTH-005` |
| Component | `CMP` | `CMP-BTN-001` |

**Scope** is a short lowercase keyword matching the module's domain (see scope tables below).
**Number** is zero-padded to 3 digits and increments per function within the scope.

The **module-level ID** (e.g. `LIB-AUTH-001`) is assigned to the first export. Subsequent exports get `002`, `003`, etc.

---

## 3. Scope Reference

### `utils` scopes (pure stateless helpers)

| Scope | ID Prefix | Domain |
|---|---|---|
| `string` | `UTL-STR` | String formatting, normalization, parsing |
| `date` | `UTL-DATE` | Date formatting, calculation, timezone |
| `number` | `UTL-NUM` | Numeric formatting, rounding, math |
| `array` | `UTL-ARR` | Array manipulation, deduplication, sorting |
| `object` | `UTL-OBJ` | Object merging, deep cloning, key transforms |
| `validation` | `UTL-VAL` | Input validation (email, phone, URL…) |
| `color` | `UTL-CLR` | Color conversion, contrast, palette |
| `storage` | `UTL-STG` | LocalStorage / SessionStorage wrappers |
| `env` | `UTL-ENV` | Environment variable access and validation |
| `file` | `UTL-FILE` | File size, extension, MIME type helpers |

### `lib` scopes (side-effectful libraries)

| Scope | ID Prefix | Domain |
|---|---|---|
| `auth` | `LIB-AUTH` | Session management, token handling, guards |
| `api` | `LIB-API` | HTTP client wrappers for REST / GraphQL |
| `db` | `LIB-DB` | Database query builders, ORM helpers |
| `cache` | `LIB-CACHE` | In-memory and Redis cache, TTL handling |
| `email` | `LIB-EMAIL` | Transactional email via SMTP or SDK |
| `storage` | `LIB-STG` | Cloud file storage: upload, download, signed URLs |
| `logger` | `LIB-LOG` | Structured logging, log levels, transports |
| `config` | `LIB-CFG` | App config loading, validation, typed access |
| `payment` | `LIB-PAY` | Payment gateway integrations |
| `ws` | `LIB-WS` | WebSocket connection, event subscriptions |
| `queue` | `LIB-QUE` | Background job queue, worker dispatch |
| `search` | `LIB-SRC` | Search index management and query execution |

### `components` scopes (React UI)

| Scope | ID Prefix | Domain |
|---|---|---|
| `button` | `CMP-BTN` | Button variants |
| `input` | `CMP-INP` | Form inputs |
| `modal` | `CMP-MOD` | Modals, drawers, overlay panels |
| `table` | `CMP-TBL` | Data tables with sorting / pagination |
| `card` | `CMP-CRD` | Card layout components |
| `nav` | `CMP-NAV` | Navbar, sidebar, breadcrumbs, tabs |
| `form` | `CMP-FRM` | Form wrappers, field groups, error displays |
| `feedback` | `CMP-FBK` | Toast, alert, badge, progress bar |
| `layout` | `CMP-LAY` | Containers, grids, stacks, dividers |
| `chart` | `CMP-CHT` | Data visualization components |

---

## 4. `index.ts` / `index.tsx` — Global Module Header

Every `index.ts` and `index.tsx` (and `style.css`) must start with a **Global Module Header**:

```ts
/**
 * @uuid         LIB-AUTH-001
 * @author       Rafael Luis J. Oli
 * @time         2026-06-28 11:00 PM
 * @dependsOn    none
 *
 * @description
 * One to three sentences explaining what this module does.
 *
 * @whereToUse
 * Which folder, feature, or layer should import this module.
 *
 * @whenToUse
 * The conditions or scenarios that should trigger use of this module.
 */
```

Then each **exported function** gets a **Function Header** directly above it:

```ts
/**
 * @uuid         LIB-AUTH-002
 * @author       Rafael Luis J. Oli
 * @time         2026-06-28 11:00 PM
 * @dependsOn    none
 *
 * @description
 * One to two sentences. What the function does and what it returns.
 */
export function exampleFn(): void {
  // implementation
}
```

Plus JSDoc tags on each export:

```ts
/**
 * @uniqueid LIB-AUTH-002
 *
 * Sends a GET request to the specified endpoint.
 *
 * @param endpoint - The relative API path.
 * @returns The parsed JSON response.
 * @throws {ApiError} When the server returns a non-2xx status.
 */
```

> For **components**, JSDoc is only required on complex internal helper functions, not on the React component itself.

---

## 5. `types.ts`

All shared TypeScript interfaces, types, and enums go here. **Never export types from `index.ts`.**

```ts
// types.ts
export interface ExampleType {
  id: string
  value: string
}
```

---

## 6. `README.md` — Required Sections

Every module must have a README with these exact sections:

```markdown
# <Module Name>

## Information

Author:     <Full Name>
Time:       <YYYY-MM-DD HH:MM>
Unique ID:  <MODULE-ID-001>
Scope:      <scope keyword>

## Description

One to three sentences explaining what the module does.

## When to Use

Describe the scenarios where this module should be used.

## How to Use

import { exampleFn } from "@/lib/<ModuleName>";

exampleFn("hello"); // => "Hello"

## Exported APIs

### functionName

UUID:       LIB-EXM-001
DependsOn:  none

### anotherFunction

UUID:       LIB-EXM-002
DependsOn:  LIB-EXM-001   # functionName — used internally

## Notes

Optional. Known limitations, deprecation notices, etc.
```

### `DependsOn` Rules

| Situation | Value |
|---|---|
| No dependency | `none` |
| One dependency | `<UUID>   # short description` |
| Multiple | One `DependsOn:` line per UUID |
| External npm package | `none  # external: <package-name>` |

> `DependsOn` in the README references **UUIDs**, not folder paths or function names.

---

## 7. Full Generation Example

**User input:**

```
Module name: Auth Module
Module ID: LIB-AUTH-001
Version: 1
Author: IzanamiiDevv
Depends on: (none)

Lib: Firebase auth wrapper — signIn, signOut, getSession
```

**You generate:**

---

### `module/AuthModule/pavillion.module.json`

```json
{
  "module_name": "Auth Module",
  "author": ["IzanamiiDevv"],
  "module_id": "LIB-AUTH-001",
  "version": 1,
  "depends_on": [],
  "uses": ["lib"]
}
```

---

### `lib/AuthModule/types.ts`

```ts
export interface Session {
  uid: string
  email: string
  token: string
}
```

---

### `lib/AuthModule/index.ts`

```ts
/**
 * @uuid         LIB-AUTH-001
 * @author       IzanamiiDevv
 * @time         2026-06-28 11:00 PM
 * @dependsOn    none
 *
 * @description
 * Firebase authentication wrapper providing signIn, signOut,
 * and session retrieval with typed responses.
 *
 * @whereToUse
 * Import in pages/ or server-side route handlers that require
 * user authentication.
 *
 * @whenToUse
 * Use whenever a user needs to sign in, sign out, or when
 * a protected route must verify the current session.
 */

import type { Session } from "./types"

/**
 * @uuid         LIB-AUTH-001
 * @author       IzanamiiDevv
 * @time         2026-06-28 11:00 PM
 * @dependsOn    none
 *
 * @description
 * Signs in a user with email and password via Firebase Auth.
 * Returns a typed Session object on success.
 */

/**
 * @uniqueid LIB-AUTH-001
 *
 * Signs in a user with email and password.
 *
 * @param email    - The user's email address.
 * @param password - The user's password.
 * @returns A Session object with uid, email, and token.
 * @throws {AuthError} When credentials are invalid.
 */
export async function signIn(email: string, password: string): Promise<Session> {
  // implementation
}

/**
 * @uuid         LIB-AUTH-002
 * @author       IzanamiiDevv
 * @time         2026-06-28 11:00 PM
 * @dependsOn    none
 *
 * @description
 * Signs out the currently authenticated user and clears the session.
 */

/**
 * @uniqueid LIB-AUTH-002
 *
 * Signs out the current user.
 *
 * @returns void
 */
export async function signOut(): Promise<void> {
  // implementation
}

/**
 * @uuid         LIB-AUTH-003
 * @author       IzanamiiDevv
 * @time         2026-06-28 11:00 PM
 * @dependsOn    LIB-AUTH-001
 *
 * @description
 * Retrieves the active session for the currently signed-in user.
 * Returns null if no user is authenticated.
 */

/**
 * @uniqueid LIB-AUTH-003
 *
 * Returns the current user session or null if unauthenticated.
 *
 * @returns Session | null
 */
export async function getSession(): Promise<Session | null> {
  // implementation
}
```

---

### `lib/AuthModule/README.md`

```markdown
# Auth Module

## Information

Author:     IzanamiiDevv
Time:       2026-06-28 11:00 PM
Unique ID:  LIB-AUTH-001
Scope:      auth

## Description

Firebase authentication wrapper providing signIn, signOut, and session
retrieval with typed responses.

## When to Use

Use whenever a user needs to authenticate or when a protected route must
verify the current session. Do not call Firebase Auth directly in feature code.

## How to Use

import { signIn, getSession } from "@/lib/AuthModule";

const session = await signIn("user@email.com", "password");
const current = await getSession();

## Exported APIs

### signIn

UUID:       LIB-AUTH-001
DependsOn:  none

### signOut

UUID:       LIB-AUTH-002
DependsOn:  none

### getSession

UUID:       LIB-AUTH-003
DependsOn:  LIB-AUTH-001   # signIn — session depends on auth state
```

---

## 8. Quick Checklist Before Submitting

- [ ] `pavillion.module.json` is inside `module/<ModuleName>/` only
- [ ] `uses` array lists every scope that has source files
- [ ] `depends_on` uses `module_name` values, not IDs or paths
- [ ] Every `index.ts`/`index.tsx`/`style.css` has a **Global Module Header**
- [ ] Every exported function has a **Function Header** + **JSDoc block**
- [ ] `types.ts` has all interfaces — none exported from `index.ts`
- [ ] README has all 6 required sections
- [ ] Every export in README has a `UUID:` and `DependsOn:` line
- [ ] `DependsOn` uses UUIDs, not names or paths
- [ ] `module_id` format is `CATEGORY-SCOPE-NUMBER` (zero-padded)
- [ ] `style.css` exists only for `components` scopes

---

*NOVEx Engineering Tech. · Pavillion AI Reference · Internal Use Only*
