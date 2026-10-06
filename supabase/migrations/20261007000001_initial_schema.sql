-- Migration 1: Initial Schema & Performance Indexes
-- ColourHunt Multiplayer Game

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table (Permanent accounts, Guest accounts & Lifetime Stats)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 16),
    avatar_url TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT true,
    games_played INT NOT NULL DEFAULT 0 CHECK (games_played >= 0),
    games_won INT NOT NULL DEFAULT 0 CHECK (games_won >= 0),
    best_score NUMERIC(5, 2) DEFAULT 0.00 CHECK (best_score >= 0.00 AND best_score <= 100.00),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: Automatically create public.profiles row when auth.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, is_anonymous)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'display_name',
            'Player_' || substr(NEW.id::text, 1, 4)
        ),
        (NEW.email IS NULL)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    host_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'waiting' 
        CHECK (status IN ('waiting', 'in_round', 'reviewing', 'finished', 'abandoned')),
    max_players INT NOT NULL DEFAULT 4 CHECK (max_players BETWEEN 2 AND 8),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper Function: Generates unique 4-character room code (excludes I, O, 0, 1)
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INT;
    collision_count INT;
BEGIN
    LOOP
        result := '';
        FOR i IN 1..4 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;
        
        SELECT COUNT(*) INTO collision_count 
        FROM public.rooms 
        WHERE code = result AND status NOT IN ('finished', 'abandoned');
        
        IF collision_count = 0 THEN
            RETURN result;
        END IF;
    END LOOP;
END;
$$;

-- 3. Players Table
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 16),
    assigned_color TEXT,
    is_host BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'disconnected', 'left')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_per_room UNIQUE (room_id, user_id)
);

-- 4. Rounds Table
CREATE TABLE IF NOT EXISTS public.rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    round_number INT NOT NULL DEFAULT 1 CHECK (round_number > 0),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'finished', 'no_winner')),
    time_limit_seconds INT NOT NULL DEFAULT 60 CHECK (time_limit_seconds > 0),
    remaining_seconds INT NOT NULL DEFAULT 60 CHECK (remaining_seconds >= 0),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resumed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    paused_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    winner_player_id UUID REFERENCES public.players(id)
);

-- 5. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    match_score NUMERIC(5, 2) CHECK (match_score >= 0.00 AND match_score <= 100.00),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'deleted')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    attempt_number INT NOT NULL CHECK (attempt_number BETWEEN 1 AND 3),
    CONSTRAINT unique_attempt_per_player_round UNIQUE (round_id, player_id, attempt_number)
);

-- 6. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms (code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms (status);
CREATE INDEX IF NOT EXISTS idx_players_room_status ON public.players (room_id, status);
CREATE INDEX IF NOT EXISTS idx_players_user ON public.players (user_id);
CREATE INDEX IF NOT EXISTS idx_rounds_room ON public.rounds (room_id);
CREATE INDEX IF NOT EXISTS idx_submissions_round_player ON public.submissions (round_id, player_id);
CREATE INDEX IF NOT EXISTS idx_submissions_pending ON public.submissions (round_id, status) WHERE status = 'pending';
