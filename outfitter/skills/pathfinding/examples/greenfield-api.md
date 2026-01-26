# Example: Greenfield API Design

Starting from zero — vague request, no context.

<turn>
<user>

I need to build an API

</user>
<claude>

```text
[Task] Getting oriented
- Prep API requirements (in_progress)
- Explore architecture options (pending)
- Clarify data and auth needs (pending)
- Deliver API design doc (pending)
```

```text
░░░░░ Prepping

Unknowns:
- What domain/purpose?
- Who consumes it?
- What data?
- Performance/scale needs?
- Existing infrastructure?
```

**Q1**: Before we dive in — what kind of session are you looking for?

*Why it matters — sets the right depth and pace*

```text
[EnterPlanMode]
1. Quick pulse check [★] — nail down key decisions, move fast *good for exploring direction*
2. Deep dive — thorough exploration, comprehensive plan
3. Specific problem — I know what I want, need help with one aspect
5. Something else — describe what you're after
```

</claude>
</turn>

<turn>
<user>

1, I have a rough idea but need to figure out the shape

</user>
<claude>

```text
Got it — quick pulse to find the shape, then we can go deeper where needed.

▓░░░░ Scouting

Decisions:
- Quick pulse session, fast iteration
```

**Q2**: What's this API for?

*Why it matters — determines data model, auth strategy, and scaling approach*

```text
[EnterPlanMode]
1. Internal tool — dashboard, admin, ops
2. Public product API — third-party developers
3. Mobile/web backend — your own apps
4. B2B integration — partner systems
5. Something else — describe the use case
```

</claude>
</turn>

<turn>
<user>

3, it's for a fitness tracking app

</user>
<claude>

```text
Fitness tracking backend — workouts, metrics, user data. Classic mobile backend pattern.

▓▓░░░ Exploring

Assumptions:
- User accounts with personal data
- Workout/activity logging
- Progress tracking over time
- Mobile-first (iOS/Android)

Unknowns:
- Social features? (friends, sharing, leaderboards)
- Device integrations? (Apple Health, Fitbit, etc.)
- Real-time needs? (live workouts, streaming)
- Offline sync requirements?

Decisions:
- Mobile/web backend for fitness app
- Quick pulse session
```

**Q3**: What's the core loop users will do most often?

*Why it matters — shapes the data model and API surface*

```text
[EnterPlanMode]
1. Log workouts manually [★] — exercises, sets, reps, weights *simplest starting point*
2. Track metrics — weight, body measurements, progress photos
3. Follow programs — structured plans, scheduled workouts
4. Social/compete — friends, challenges, leaderboards
5. Something else — different core interaction
```

</claude>
</turn>

<turn>
<user>

1 and 2, logging workouts and tracking body metrics

</user>
<claude>

```text
Core loop: log workouts + track body metrics. Good foundation — can layer social/programs later.

▓▓▓░░ Charting

Assumptions:
- User model with profile data
- Workout sessions with exercises
- Body metrics (weight, measurements) with timestamps
- Historical data for progress charts

Unknowns:
- Auth approach?
- Exercise library (predefined vs custom)?
- Offline-first or always-online?

Decisions:
- Mobile backend for fitness app
- Core: workout logging + body metrics
- Start simple, extensible for social/programs later

Concerns:
- Exercise data can get complex (variations, equipment, muscle groups) — start with simple model, don't over-engineer
```

```text
[Task] Shape emerging — exploring options
- Prep API requirements (completed)
- Explore architecture options (in_progress)
- Clarify data and auth needs (pending)
- Deliver API design doc (pending)
```

**Q4**: How should users authenticate?

*Why it matters — affects security model, user experience, and implementation complexity*

```text
[EnterPlanMode]
1. Email/password [★] — simple, universal *good starting point*
2. Social login (Google/Apple) — better UX, less friction
3. Both — maximum flexibility
4. Magic link — passwordless, email-based
5. Something else — different auth approach
```

</claude>
</turn>

<turn>
<user>

3, I want both options

</user>
<claude>

```text
Both email/password and social login — covers all users.

▓▓▓▓░ Mapped

Assumptions:
- JWT tokens for mobile auth
- Email as primary identifier (link accounts by email)
- Refresh token rotation for security

Unknowns:
- Specific social providers (Google, Apple, both)?

Decisions:
- Dual auth: email/password + social login
- Workout logging + body metrics core
- Mobile backend architecture

Concerns:
- Account linking edge cases (same email, different providers) — handle gracefully
```

```text
[Task] Getting close — one more detail
- Prep API requirements (completed)
- Explore architecture options (completed)
- Clarify data and auth needs (in_progress)
- Deliver API design doc (pending)
```

Can proceed now, or one more question would nail down the social providers. Your call — deliver now or refine?

</claude>
</turn>

<turn>
<user>

Let's just do Google and Apple for now

</user>
<claude>

```text
Google + Apple — covers iOS and Android users well.

▓▓▓▓▓ Ready

Decisions:
- Dual auth: email/password + Google + Apple Sign-In
- Core features: workout logging, body metrics tracking
- JWT tokens with refresh rotation
- Mobile-first REST API
```

```text
[Task] Clear path — delivering design
- Prep API requirements (completed)
- Explore architecture options (completed)
- Clarify data and auth needs (completed)
- Deliver API design doc (in_progress)
```

## Fitness Tracking API Design

**Core Resources**:

```text
/auth
  POST /register          — email/password signup
  POST /login             — email/password login
  POST /oauth/google      — Google Sign-In
  POST /oauth/apple       — Apple Sign-In
  POST /refresh           — refresh access token
  POST /logout            — invalidate tokens

/users
  GET  /me                — current user profile
  PUT  /me                — update profile
  DELETE /me              — delete account

/workouts
  GET  /                  — list workouts (paginated)
  POST /                  — create workout
  GET  /:id               — get workout details
  PUT  /:id               — update workout
  DELETE /:id             — delete workout

/exercises
  GET  /                  — list exercises (library)
  POST /                  — create custom exercise

/metrics
  GET  /                  — list body metrics (paginated)
  POST /                  — log new metric
  GET  /summary           — progress summary (charts data)
```

**Data Models**:

```text
User {
  id, email, name, avatar_url,
  auth_provider: "email" | "google" | "apple",
  created_at, updated_at
}

Workout {
  id, user_id, name, started_at, ended_at,
  exercises: [{ exercise_id, sets: [{ reps, weight, duration }] }],
  notes, created_at
}

Exercise {
  id, name, category, muscle_groups[],
  is_custom, user_id (if custom)
}

BodyMetric {
  id, user_id, type: "weight" | "measurement",
  value, unit, measured_at
}
```

**Tech Stack Suggestion**:

- **API**: Hono or Express on Bun
- **Database**: PostgreSQL (Supabase or Neon)
- **Auth**: Custom JWT or Supabase Auth
- **Hosting**: Railway, Fly.io, or Vercel

**Next Steps**:

1. Set up project with Bun + Hono
2. Configure PostgreSQL with migrations
3. Implement auth endpoints first
4. Build workout CRUD
5. Add body metrics
6. Deploy MVP

```text
[Task] Done — design shipped
- Prep API requirements (completed)
- Explore architecture options (completed)
- Clarify data and auth needs (completed)
- Deliver API design doc (completed)
```

All set — went from "I need an API" to a concrete design. Ready to start building when you are.

</claude>
</turn>
