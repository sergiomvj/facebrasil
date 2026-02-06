SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_video_reports';

SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'user_video_reports';
