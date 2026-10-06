# Color Hunt — Authentication Architecture

Read this before implementing or modifying authentication screens, session storage, or user profile linking.

---

## 1. Authentication Strategy: Hybrid Model

Color Hunt employs a **Hybrid Authentication Model** that delivers both zero-friction party play and long-term player progression.

```
                  ┌─────────────────────────────────────────┐
                  │              Launch App                 │
                  └────────────────────┬────────────────────┘
                                       │
                      Existing Valid Session?
                                  /         \
                             Yes /           \ No
                                /             \
            ┌──────────────────────┐      ┌─────────────────────────┐
            │ Restore User Session │      │      Auth Selection     │
            │   & Fetch Profile    │      │  - Play as Guest        │
            └──────────────────────┘      │  - Sign In (Email)      │
                                          │  - Sign Up (Email)      │
                                          └───────────┬─────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       │                                                             │
        ┌──────────────▼─────────────┐                                ┌──────────────▼─────────────┐
        │       Guest / Anonymous    │                                │     Email / Password       │
        │ - signInAnonymously()      │                                │ - signUp() / signInWith... │
        │ - Ephemeral session        │                                │ - Permanent account        │
        │ - Local display name       │                                │ - Synced stats & avatar    │
        └──────────────┬─────────────┘                                └────────────────────────────┘
                       │
             Later in Profile/Settings
                       │
        ┌──────────────▼─────────────┐
        │     Upgrade to Permanent   │
        │  linkIdentity(credentials) │
        │ (Retains all match stats!) │
        └────────────────────────────┘
```

---

## 2. Implementation Specifications

### 2.1 Guest (Anonymous) Authentication
- **SDK Call**: `await supabase.auth.signInAnonymously()`
- **Behavior**: Generates a valid UUID and JWT in `auth.users` without email or password.
- **Session Persistence**: Persisted locally via AsyncStorage. Survives app restarts.
- **Profile Row**: A trigger or helper function automatically inserts a matching row in `public.profiles` with `is_anonymous = true`.

### 2.2 Email & Password Authentication
- **Sign Up**: `await supabase.auth.signUp({ email, password, options: { data: { display_name } } })`
- **Sign In**: `await supabase.auth.signInWithPassword({ email, password })`
- **Security Standards**:
  - Passwords must be at least 6 characters.
  - Emails validated with standard RFC format.
  - Profiles created with `is_anonymous = false`.

### 2.3 Guest-to-Permanent Account Linking
Players who started as a guest can convert to a permanent account without losing their statistics:
```typescript
// Link existing anonymous session with email credentials
const { data, error } = await supabase.auth.updateUser({
  email: userEmail,
  password: userPassword,
});

if (!error) {
  // Update profile status
  await supabase
    .from('profiles')
    .update({ is_anonymous: false })
    .eq('id', user.id);
}
```

---

## 3. Profiles Table Integration

```sql
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  display_name   text not null check (char_length(display_name) between 1 and 16),
  avatar_url     text,
  is_anonymous   boolean not null default true,
  games_played   int not null default 0,
  games_won      int not null default 0,
  best_score     numeric(5,2) default 0.00,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
```

### Automatic Profile Creation Trigger
Whenever a user signs in (either anonymously or via email), a PostgreSQL trigger creates their profile row if it doesn't already exist:

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, is_anonymous)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Player_' || substr(new.id::text, 1, 4)),
    case when new.email is null then true else false end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

## 4. Client Auth Service (`src/lib/api/authService.ts`)

Exported functions:
1. `initAuthSession()`: Initializes session on app start, verifies token validity.
2. `signInGuest(displayName: string)`: Signs in anonymously and saves chosen display name.
3. `signUpWithEmail(email, password, displayName)`: Creates permanent registered account.
4. `signInWithEmail(email, password)`: Logs in returning user.
5. `linkGuestAccount(email, password)`: Upgrades current guest session to permanent.
6. `signOut()`: Clears active session.
