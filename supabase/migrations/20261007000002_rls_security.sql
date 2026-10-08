-- Migration 2: Row Level Security & Cached Security Definer Functions
-- ColourHunt Multiplayer Game

-- 1. High-Performance Security Definer Helper Functions
-- Note: Declared STABLE so PostgreSQL caches results within the query execution plan
CREATE OR REPLACE FUNCTION public.is_room_player(p_room_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.players
        WHERE room_id = p_room_id 
          AND user_id = p_user_id 
          AND status != 'left'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_room_host(p_room_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.rooms
        WHERE id = p_room_id 
          AND host_id = p_user_id
    );
$$;

-- 2. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 3. Profiles Policies
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 4. Rooms Policies
DROP POLICY IF EXISTS "rooms_select" ON public.rooms;
CREATE POLICY "rooms_select"
    ON public.rooms FOR SELECT
    USING (
        status = 'waiting' 
        OR public.is_room_player(id, auth.uid())
    );

DROP POLICY IF EXISTS "rooms_update_host" ON public.rooms;
CREATE POLICY "rooms_update_host"
    ON public.rooms FOR UPDATE
    USING (host_id = auth.uid())
    WITH CHECK (host_id = auth.uid());

DROP POLICY IF EXISTS "rooms_insert_auth" ON public.rooms;
CREATE POLICY "rooms_insert_auth"
    ON public.rooms FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND host_id = auth.uid());

-- 5. Players Policies
DROP POLICY IF EXISTS "players_select_room" ON public.players;
CREATE POLICY "players_select_room"
    ON public.players FOR SELECT
    USING (public.is_room_player(room_id, auth.uid()));

DROP POLICY IF EXISTS "players_insert_self" ON public.players;
CREATE POLICY "players_insert_self"
    ON public.players FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "players_update_self" ON public.players;
CREATE POLICY "players_update_self"
    ON public.players FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 6. Rounds Policies
DROP POLICY IF EXISTS "rounds_select_room" ON public.rounds;
CREATE POLICY "rounds_select_room"
    ON public.rounds FOR SELECT
    USING (public.is_room_player(room_id, auth.uid()));

DROP POLICY IF EXISTS "rounds_all_host" ON public.rounds;
CREATE POLICY "rounds_all_host"
    ON public.rounds FOR ALL
    USING (public.is_room_host(room_id, auth.uid()))
    WITH CHECK (public.is_room_host(room_id, auth.uid()));

-- 7. Submissions Policies
DROP POLICY IF EXISTS "submissions_select_room" ON public.submissions;
CREATE POLICY "submissions_select_room"
    ON public.submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.rounds r
            WHERE r.id = round_id AND public.is_room_player(r.room_id, auth.uid())
        )
    );

DROP POLICY IF EXISTS "submissions_insert_own" ON public.submissions;
CREATE POLICY "submissions_insert_own"
    ON public.submissions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.players p
            WHERE p.id = player_id AND p.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "submissions_update_host" ON public.submissions;
CREATE POLICY "submissions_update_host"
    ON public.submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.rounds r
            WHERE r.id = round_id AND public.is_room_host(r.room_id, auth.uid())
        )
    );
