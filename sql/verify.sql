-- Read-only inspection after setup. Expect 10 tables with rowsecurity=true.
select tablename, rowsecurity from pg_tables
where schemaname='public' and tablename in
('categories','websites','favorites','recent','shortcuts','notes','tasks','resources','profiles','preferences') order by tablename;
-- Expect four ownership policies per application table.
select tablename,policyname,cmd,roles,qual,with_check from pg_policies
where schemaname='public' order by tablename,cmd;
-- logos must be private and PNG-only.
select id,public,file_size_limit,allowed_mime_types from storage.buckets where id='logos';
select policyname,cmd,qual,with_check from pg_policies where schemaname='storage' and policyname like 'teacher_logos_%';
-- Application helper functions must NOT have SECURITY DEFINER.
select p.proname,p.prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('initialize_workspace','move_and_delete_category','save_website');
