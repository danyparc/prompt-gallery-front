```sql
create table public.prompt (
  id                    uuid primary key default uuid_generate_v4(),
  author_id             uuid not null references auth.users(id) on delete cascade,
  title                 text not null,
  content               text not null,                 -- el prompt en sí
  type                  text check (char_length(type) <= 120),
  language              text check (char_length(language) <= 120),

  -- taxonomía y etiquetas
  category_slugs        text[] not null default '{}',  -- ej: {'copywriting','image','sora'}
  tags                  text[] not null default '{}',  -- etiquetas libres

  -- modelos en los que fue probado
  models                text[] not null default '{}',  -- ej: {'gpt-4.1','sonnet-3.5','sora'}

  -- relaciones “sociales”
  fork_of_prompt_id     uuid null references public.prompt(id) on delete set null,

  -- búsqueda y similitud
  content_ts            tsvector,                      -- full-text
  embedding             vector(1536),                  -- opcional (ajusta dimensión a tu encoder)

  -- deduplicación opcional
  sha256                text unique,

  -- métricas cacheadas (se actualizan por triggers o vistas materializadas)
  likes_count           int not null default 0,
  favorites_count       int not null default 0,
  forks_count           int not null default 0,

  -- housekeeping
  is_public             boolean not null default true, -- visibilidad
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
```