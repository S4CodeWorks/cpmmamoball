-- Ownership/publication checks. All fixtures are rolled back; no mail or broadcast.
BEGIN;
INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES
('eeeeeeee-0000-4000-8000-000000000001','cpm-rls-a@example.invalid','{"nick":"RLS A"}'),
('eeeeeeee-0000-4000-8000-000000000002','cpm-rls-b@example.invalid','{"nick":"RLS B"}'),
('eeeeeeee-0000-4000-8000-000000000003','cpm-rls-staff@example.invalid','{"nick":"RLS Staff"}');
UPDATE public.profiles SET role='staff' WHERE id='eeeeeeee-0000-4000-8000-000000000003';
INSERT INTO public.announcements(id,title,body,published_at) VALUES
('dddddddd-0000-4000-8000-000000000001','RLS published','Test',now()),
('dddddddd-0000-4000-8000-000000000002','RLS draft','Test',NULL),
('dddddddd-0000-4000-8000-000000000003','RLS future','Test',now()+interval '1 day');
SET LOCAL ROLE anon;
DO $$ BEGIN
 IF (SELECT count(*) FROM public.announcements WHERE id::text LIKE 'dddddddd-%')<>1 THEN RAISE EXCEPTION 'anon publication scope failed'; END IF;
 BEGIN INSERT INTO public.announcements(title,body) VALUES('Forbidden','Test'); RAISE EXCEPTION 'anon publication allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM * FROM public.announcement_reads; RAISE EXCEPTION 'anon reads allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claims','{"sub":"eeeeeeee-0000-4000-8000-000000000001","role":"authenticated"}',true);
SET LOCAL ROLE authenticated;
INSERT INTO public.announcement_reads(user_id,announcement_id) VALUES('eeeeeeee-0000-4000-8000-000000000001','dddddddd-0000-4000-8000-000000000001');
DO $$ BEGIN
 BEGIN INSERT INTO public.announcement_reads(user_id,announcement_id) VALUES('eeeeeeee-0000-4000-8000-000000000002','dddddddd-0000-4000-8000-000000000001'); RAISE EXCEPTION 'foreign owner write allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.announcement_reads(user_id,announcement_id) VALUES('eeeeeeee-0000-4000-8000-000000000001','dddddddd-0000-4000-8000-000000000002'); RAISE EXCEPTION 'draft read allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.announcements(title,body) VALUES('Forbidden','Test'); RAISE EXCEPTION 'member publication allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN UPDATE public.profiles SET role='staff' WHERE id='eeeeeeee-0000-4000-8000-000000000001'; RAISE EXCEPTION 'role update allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 UPDATE public.profiles SET nick='RLS changed' WHERE id='eeeeeeee-0000-4000-8000-000000000001';
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claims','{"sub":"eeeeeeee-0000-4000-8000-000000000002","role":"authenticated"}',true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN IF EXISTS(SELECT 1 FROM public.announcement_reads WHERE user_id='eeeeeeee-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'foreign read visible'; END IF; END $$;
RESET ROLE;
SELECT set_config('request.jwt.claims','{"sub":"eeeeeeee-0000-4000-8000-000000000003","role":"authenticated"}',true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN IF (SELECT count(*) FROM public.announcements WHERE id::text LIKE 'dddddddd-%')<>3 THEN RAISE EXCEPTION 'staff scope failed'; END IF; END $$;
INSERT INTO public.announcements(title,body) VALUES('RLS staff draft','Test');
RESET ROLE;
ROLLBACK;
SELECT 'PASS: anon scope; staff publication; owned reads; draft privacy; role protection; nick editing; fixtures rolled back' AS result;
