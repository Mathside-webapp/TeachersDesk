-- Teacher Desk — run once in a NEW Supabase project's SQL Editor.
-- Uses JSONB payloads for small personal records; ownership stays in typed columns.
begin;
create table public.categories (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data)='object'), unique(id,user_id)
);
create table public.websites (like public.categories including all);
alter table public.websites add foreign key(user_id) references auth.users(id) on delete cascade;
create table public.shortcuts (like public.categories including all);
alter table public.shortcuts add foreign key(user_id) references auth.users(id) on delete cascade;
create table public.notes (like public.categories including all);
alter table public.notes add foreign key(user_id) references auth.users(id) on delete cascade;
create table public.tasks (like public.categories including all);
alter table public.tasks add foreign key(user_id) references auth.users(id) on delete cascade;
create table public.resources (like public.categories including all);
alter table public.resources add foreign key(user_id) references auth.users(id) on delete cascade;
create table public.profiles (like public.categories including all);
alter table public.profiles add foreign key(user_id) references auth.users(id) on delete cascade;
alter table public.profiles add constraint profile_identity check(id=user_id);
create table public.preferences (like public.categories including all);
alter table public.preferences add foreign key(user_id) references auth.users(id) on delete cascade;
alter table public.preferences add constraint preference_identity check(id=user_id);
create table public.favorites (like public.categories including all);
alter table public.favorites add foreign key(user_id) references auth.users(id) on delete cascade;
alter table public.favorites add foreign key(id,user_id) references public.websites(id,user_id) on delete cascade;
create table public.recent (like public.categories including all);
alter table public.recent add foreign key(user_id) references auth.users(id) on delete cascade;
alter table public.recent add foreign key(id,user_id) references public.websites(id,user_id) on delete cascade;

-- Typed generated category references enforce same-owner relationships at the database level.
alter table public.websites add column category_id uuid generated always as ((data->>'category')::uuid) stored;
alter table public.websites add foreign key(category_id,user_id) references public.categories(id,user_id);
alter table public.resources add column category_id uuid generated always as ((data->>'category')::uuid) stored;
alter table public.resources add foreign key(category_id,user_id) references public.categories(id,user_id);
alter table public.websites add constraint website_required check(coalesce(length(trim(data->>'name'))>0,false) and coalesce(data->>'url' ~ '^https?://[^[:space:]]+$',false) and data ? 'category');
alter table public.shortcuts add constraint shortcut_required check(coalesce(length(trim(data->>'name'))>0,false) and coalesce(data->>'url' ~ '^https?://[^[:space:]]+$',false));
alter table public.resources add constraint resource_required check(coalesce(length(trim(data->>'name'))>0,false) and coalesce(data->>'url' ~ '^https?://[^[:space:]]+$',false));
alter table public.notes add constraint note_required check(coalesce(length(trim(data->>'title'))>0,false));
alter table public.tasks add constraint task_required check(coalesce(length(trim(data->>'title'))>0,false));

do $$
declare t text;
begin
 foreach t in array array['categories','websites','favorites','recent','shortcuts','notes','tasks','resources','profiles','preferences'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon',t);
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  execute format('create index %I on public.%I(user_id)',t||'_owner_idx',t);
  execute format('create policy owner_select on public.%I for select to authenticated using ((select auth.uid())=user_id)',t);
  execute format('create policy owner_insert on public.%I for insert to authenticated with check ((select auth.uid())=user_id)',t);
  execute format('create policy owner_update on public.%I for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',t);
  execute format('create policy owner_delete on public.%I for delete to authenticated using ((select auth.uid())=user_id)',t);
 end loop;
end $$;

create function public.initialize_workspace() returns void language plpgsql security invoker set search_path='' as $$
declare u uuid := auth.uid(); entry jsonb;
begin
 if u is null then raise exception 'Sign in first'; end if;
 -- Serialize first-login initialization across tabs/devices without bypassing RLS.
 perform pg_advisory_xact_lock(hashtextextended(u::text,0));
 if exists(select 1 from public.categories where user_id=u) then return; end if;
 for entry in select value from jsonb_array_elements('[{"name":"Class Websites","color":"#2176ce"},{"name":"Teaching Tools","color":"#e97136"},{"name":"Journals and Publications","color":"#c73556"},{"name":"Personal Projects","color":"#9164c7"},{"name":"Resources","color":"#25865d"},{"name":"Others","color":"#786D72"}]'::jsonb) loop
  insert into public.categories(user_id,data) values(u,entry);
 end loop;
 for entry in select value from jsonb_array_elements('[{"name":"Google Classroom","url":"https://classroom.google.com","icon":"book","color":"#409c42","position":0},{"name":"DepEd Commons","url":"https://commons.deped.gov.ph","icon":"notes","color":"#d12336","position":1},{"name":"Canva","url":"https://www.canva.com","icon":"C","color":"#20adbc","position":2},{"name":"ChatGPT","url":"https://chatgpt.com","icon":"gem","color":"#00a77c","position":3},{"name":"Google Drive","url":"https://drive.google.com","icon":"gem","color":"#f6ba26","position":4}]'::jsonb) loop
  insert into public.shortcuts(user_id,data) values(u,entry);
 end loop;
end $$;

create function public.move_and_delete_category(source_id uuid,target_id uuid) returns void language plpgsql security invoker set search_path='' as $$
declare u uuid:=auth.uid();
begin
 if u is null or source_id=target_id then raise exception 'Choose another category'; end if;
 perform 1 from public.categories where id=target_id and user_id=u for update;
 if not found then raise exception 'Destination category unavailable'; end if;
 perform 1 from public.categories where id=source_id and user_id=u for update;
 if not found then raise exception 'Category unavailable'; end if;
 update public.websites set data=jsonb_set(data,'{category}',to_jsonb(target_id::text)) where user_id=u and category_id=source_id;
 update public.resources set data=jsonb_set(data,'{category}',to_jsonb(target_id::text)) where user_id=u and category_id=source_id;
 delete from public.categories where id=source_id and user_id=u;
end $$;
revoke all on function public.initialize_workspace() from public,anon;
revoke all on function public.move_and_delete_category(uuid,uuid) from public,anon;
grant execute on function public.initialize_workspace() to authenticated;
grant execute on function public.move_and_delete_category(uuid,uuid) to authenticated;

create function public.save_website(website_id uuid,payload jsonb,starred boolean) returns void language plpgsql security invoker set search_path='' as $$
declare u uuid:=auth.uid();
begin
 if u is null then raise exception 'Sign in first'; end if;
 insert into public.websites(id,user_id,data) values(website_id,u,payload)
 on conflict(id) do update set data=excluded.data;
 if starred then
  insert into public.favorites(id,user_id,data) values(website_id,u,jsonb_build_object('position',extract(epoch from now())*1000)) on conflict(id) do nothing;
 else delete from public.favorites where id=website_id and user_id=u;
 end if;
end $$;
revoke all on function public.save_website(uuid,jsonb,boolean) from public,anon;
grant execute on function public.save_website(uuid,jsonb,boolean) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('logos','logos',false,2097152,array['image/png']) on conflict(id) do nothing;
create policy teacher_logos_read on storage.objects for select to authenticated
 using(bucket_id='logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy teacher_logos_insert on storage.objects for insert to authenticated
 with check(bucket_id='logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy teacher_logos_update on storage.objects for update to authenticated
 using(bucket_id='logos' and (storage.foldername(name))[1]=(select auth.uid())::text)
 with check(bucket_id='logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy teacher_logos_delete on storage.objects for delete to authenticated
 using(bucket_id='logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
