-- Task 1b: collapse_tokens table for the Collapse Gate magic-link flow
-- Project: pobddtmnzimcdiaujyyf (stillpoint ops)

create table if not exists public.collapse_tokens (
  id          uuid primary key default gen_random_uuid(),
  token       text not null unique,
  email       text not null,
  used        boolean not null default false,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

-- Fast lookup by token value (used in validate-token function)
create index if not exists collapse_tokens_token_idx
  on public.collapse_tokens (token);

-- Cleanup index: find expired unused tokens efficiently
create index if not exists collapse_tokens_expires_at_idx
  on public.collapse_tokens (expires_at)
  where used = false;

-- RLS: deny all direct client access — only service role (Edge Functions) may read/write
alter table public.collapse_tokens enable row level security;

-- No policies defined intentionally: Edge Functions use service_role key which bypasses RLS.
-- Direct anon/authenticated client access is blocked by default.
