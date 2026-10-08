-- Migration 4: Storage Policies & Automated Maintenance Routine
-- ColourHunt Multiplayer Game

-- 1. Create Private Submissions Bucket (Max 2MB per photo, restricted image types)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'submissions',
    'submissions',
    false,
    2097152, -- 2 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Storage RLS Policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Upload: Players can only upload to path: submissions/{roomId}/{roundId}/{userId}/{filename}
DROP POLICY IF EXISTS "submissions_storage_upload" ON storage.objects;
CREATE POLICY "submissions_storage_upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'submissions'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[3] = auth.uid()::text
    );

-- Read: Host of the room and the uploading player can read
DROP POLICY IF EXISTS "submissions_storage_select" ON storage.objects;
CREATE POLICY "submissions_storage_select"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'submissions'
        AND (
            (storage.foldername(name))[3] = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM public.rooms 
                WHERE id::text = (storage.foldername(name))[1]
                  AND host_id = auth.uid()
            )
        )
    );

-- Delete: Submitting player or the room host can delete
DROP POLICY IF EXISTS "submissions_storage_delete" ON storage.objects;
CREATE POLICY "submissions_storage_delete"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'submissions'
        AND (
            (storage.foldername(name))[3] = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM public.rooms 
                WHERE id::text = (storage.foldername(name))[1]
                  AND host_id = auth.uid()
            )
        )
    );

-- 3. Maintenance Routine: Cleanup Abandoned Rooms & Stale Data
CREATE OR REPLACE FUNCTION public.cleanup_stale_game_data()
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_deleted_count INT := 0;
BEGIN
    -- Delete abandoned or finished rooms older than 24 hours (cascades to players, rounds, submissions)
    WITH deleted_rooms AS (
        DELETE FROM public.rooms
        WHERE (status IN ('abandoned', 'finished') AND updated_at < (now() - interval '24 hours'))
           OR (status = 'waiting' AND created_at < (now() - interval '12 hours'))
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted_rooms;

    RETURN v_deleted_count;
END;
$$;
