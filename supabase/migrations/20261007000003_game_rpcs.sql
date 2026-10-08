-- Migration 3: Atomic Game State Stored Procedures (RPCs)
-- ColourHunt Multiplayer Game

-- Curated vibrant high-contrast colors palette for Color Hunt
-- Hex codes: Red, Green, Blue, Yellow, Purple, Orange, Cyan, Magenta
CREATE OR REPLACE FUNCTION public.get_game_colors()
RETURNS text[] LANGUAGE sql IMMUTABLE AS $$
    SELECT ARRAY['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#EC4899'];
$$;

-- 1. create_room
CREATE OR REPLACE FUNCTION public.create_room(
    p_display_name TEXT,
    p_max_players INT DEFAULT 4
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_room_code TEXT;
    v_room_id UUID;
    v_player_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
    END IF;

    IF char_length(p_display_name) < 1 OR char_length(p_display_name) > 16 THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_DISPLAY_NAME');
    END IF;

    IF p_max_players < 2 OR p_max_players > 8 THEN
        p_max_players := 4;
    END IF;

    v_room_code := public.generate_room_code();

    -- Insert Room
    INSERT INTO public.rooms (code, host_id, status, max_players)
    VALUES (v_room_code, v_user_id, 'waiting', p_max_players)
    RETURNING id INTO v_room_id;

    -- Insert Host as First Player
    INSERT INTO public.players (room_id, user_id, display_name, is_host, status)
    VALUES (v_room_id, v_user_id, p_display_name, true, 'active')
    RETURNING id INTO v_player_id;

    RETURN jsonb_build_object(
        'success', true,
        'room_id', v_room_id,
        'code', v_room_code,
        'player_id', v_player_id
    );
END;
$$;

-- 2. join_room (Concurrency-Safe with SELECT FOR UPDATE)
CREATE OR REPLACE FUNCTION public.join_room(
    p_code TEXT,
    p_display_name TEXT
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_room public.rooms%ROWTYPE;
    v_active_count INT;
    v_player_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
    END IF;

    IF char_length(p_display_name) < 1 OR char_length(p_display_name) > 16 THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_DISPLAY_NAME');
    END IF;

    -- Lock room row exclusively to prevent race conditions on room capacity
    SELECT * INTO v_room
    FROM public.rooms
    WHERE code = upper(trim(p_code))
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'ROOM_NOT_FOUND');
    END IF;

    IF v_room.status != 'waiting' THEN
        RETURN jsonb_build_object('success', false, 'error', 'GAME_ALREADY_STARTED');
    END IF;

    -- Count active players under exclusive lock
    SELECT COUNT(*) INTO v_active_count
    FROM public.players
    WHERE room_id = v_room.id AND status = 'active';

    -- Check if user is already in this room
    SELECT id INTO v_player_id
    FROM public.players
    WHERE room_id = v_room.id AND user_id = v_user_id;

    IF v_player_id IS NOT NULL THEN
        -- Re-activate player if returning
        UPDATE public.players
        SET status = 'active', display_name = p_display_name, last_seen_at = now()
        WHERE id = v_player_id;
    ELSE
        -- Capacity check for new joiner
        IF v_active_count >= v_room.max_players THEN
            RETURN jsonb_build_object('success', false, 'error', 'ROOM_FULL');
        END IF;

        INSERT INTO public.players (room_id, user_id, display_name, is_host, status)
        VALUES (v_room.id, v_user_id, p_display_name, false, 'active')
        RETURNING id INTO v_player_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'room_id', v_room.id,
        'code', v_room.code,
        'player_id', v_player_id,
        'is_host', (v_room.host_id = v_user_id)
    );
END;
$$;

-- 3. start_round
CREATE OR REPLACE FUNCTION public.start_round(
    p_room_id UUID,
    p_time_limit_seconds INT DEFAULT 60
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_room public.rooms%ROWTYPE;
    v_round_id UUID;
    v_colors text[];
    v_player_record RECORD;
    v_idx INT := 1;
    v_color_count INT;
    v_player_count INT;
    v_round_number INT;
BEGIN
    SELECT * INTO v_room FROM public.rooms WHERE id = p_room_id FOR UPDATE;

    IF NOT FOUND OR v_room.host_id != v_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'ONLY_HOST_CAN_START');
    END IF;

    IF v_room.status NOT IN ('waiting', 'finished') THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_ROOM_STATUS');
    END IF;

    SELECT COUNT(*) INTO v_player_count
    FROM public.players
    WHERE room_id = p_room_id AND status = 'active';

    IF v_player_count < 2 THEN
        RETURN jsonb_build_object('success', false, 'error', 'MINIMUM_2_PLAYERS_REQUIRED');
    END IF;

    -- Calculate next round number
    SELECT COALESCE(MAX(round_number), 0) + 1 INTO v_round_number
    FROM public.rounds
    WHERE room_id = p_room_id;

    -- Shuffle color palette
    v_colors := public.get_game_colors();
    v_color_count := array_length(v_colors, 1);

    -- Assign non-repeating colors to active players
    FOR v_player_record IN (
        SELECT id FROM public.players 
        WHERE room_id = p_room_id AND status = 'active' 
        ORDER BY random()
    ) LOOP
        UPDATE public.players
        SET assigned_color = v_colors[((v_idx - 1) % v_color_count) + 1]
        WHERE id = v_player_record.id;
        v_idx := v_idx + 1;
    END LOOP;

    -- Create new round
    INSERT INTO public.rounds (
        room_id,
        round_number,
        status,
        time_limit_seconds,
        remaining_seconds,
        started_at,
        resumed_at
    )
    VALUES (
        p_room_id,
        v_round_number,
        'active',
        p_time_limit_seconds,
        p_time_limit_seconds,
        now(),
        now()
    )
    RETURNING id INTO v_round_id;

    -- Update Room status
    UPDATE public.rooms
    SET status = 'in_round', updated_at = now()
    WHERE id = p_room_id;

    RETURN jsonb_build_object(
        'success', true,
        'round_id', v_round_id,
        'round_number', v_round_number,
        'time_limit_seconds', p_time_limit_seconds
    );
END;
$$;

-- 4. submit_hunt (With All-Players-Submitted Auto-Pause)
CREATE OR REPLACE FUNCTION public.submit_hunt(
    p_round_id UUID,
    p_storage_path TEXT,
    p_match_score NUMERIC
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_round public.rounds%ROWTYPE;
    v_room public.rooms%ROWTYPE;
    v_player public.players%ROWTYPE;
    v_attempt_count INT;
    v_submission_id UUID;
    v_active_players INT;
    v_finished_players INT;
    v_elapsed INT;
    v_frozen_remaining INT;
    v_auto_paused BOOLEAN := false;
BEGIN
    SELECT * INTO v_round FROM public.rounds WHERE id = p_round_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'ROUND_NOT_FOUND');
    END IF;

    IF v_round.status != 'active' THEN
        RETURN jsonb_build_object('success', false, 'error', 'ROUND_NOT_ACTIVE');
    END IF;

    SELECT * INTO v_room FROM public.rooms WHERE id = v_round.room_id;

    -- Verify player is active participant
    SELECT * INTO v_player
    FROM public.players
    WHERE room_id = v_room.id AND user_id = v_user_id AND status = 'active';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'PLAYER_NOT_IN_ROUND');
    END IF;

    -- Check attempt count (max 3)
    SELECT COUNT(*) INTO v_attempt_count
    FROM public.submissions
    WHERE round_id = p_round_id AND player_id = v_player.id;

    IF v_attempt_count >= 3 THEN
        RETURN jsonb_build_object('success', false, 'error', 'ATTEMPTS_EXHAUSTED');
    END IF;

    -- Insert Submission
    INSERT INTO public.submissions (
        round_id,
        player_id,
        storage_path,
        match_score,
        status,
        attempt_number
    )
    VALUES (
        p_round_id,
        v_player.id,
        p_storage_path,
        p_match_score,
        'pending',
        v_attempt_count + 1
    )
    RETURNING id INTO v_submission_id;

    -- Evaluate All-Players-Submitted condition
    -- 1. Total active players in room
    SELECT COUNT(*) INTO v_active_players
    FROM public.players
    WHERE room_id = v_room.id AND status = 'active';

    -- 2. Active players who have submitted at least once or used 3 attempts
    SELECT COUNT(DISTINCT p.id) INTO v_finished_players
    FROM public.players p
    WHERE p.room_id = v_room.id
      AND p.status = 'active'
      AND (
          EXISTS (
              SELECT 1 FROM public.submissions s 
              WHERE s.round_id = p_round_id AND s.player_id = p.id
          )
          OR (
              SELECT COUNT(*) FROM public.submissions s2
              WHERE s2.round_id = p_round_id AND s2.player_id = p.id
          ) >= 3
      );

    -- Auto-pause round if all active players finished hunting
    IF v_finished_players >= v_active_players THEN
        v_elapsed := EXTRACT(EPOCH FROM (now() - v_round.resumed_at))::int;
        v_frozen_remaining := GREATEST(0, v_round.remaining_seconds - v_elapsed);

        UPDATE public.rounds
        SET status = 'paused',
            paused_at = now(),
            remaining_seconds = v_frozen_remaining
        WHERE id = p_round_id;

        UPDATE public.rooms
        SET status = 'reviewing', updated_at = now()
        WHERE id = v_room.id;

        v_auto_paused := true;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'submission_id', v_submission_id,
        'attempt_number', v_attempt_count + 1,
        'auto_paused', v_auto_paused,
        'finished_count', v_finished_players,
        'total_active_count', v_active_players
    );
END;
$$;

-- 5. review_submission
CREATE OR REPLACE FUNCTION public.review_submission(
    p_submission_id UUID,
    p_decision TEXT -- 'approved' or 'rejected'
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_sub public.submissions%ROWTYPE;
    v_round public.rounds%ROWTYPE;
    v_room public.rooms%ROWTYPE;
    v_pending_count INT;
    v_active_players INT;
    v_players_with_attempts INT;
BEGIN
    IF p_decision NOT IN ('approved', 'rejected') THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_DECISION');
    END IF;

    SELECT * INTO v_sub FROM public.submissions WHERE id = p_submission_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'SUBMISSION_NOT_FOUND');
    END IF;

    SELECT * INTO v_round FROM public.rounds WHERE id = v_sub.round_id FOR UPDATE;
    SELECT * INTO v_room FROM public.rooms WHERE id = v_round.room_id FOR UPDATE;

    -- Only host can review
    IF v_room.host_id != v_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'ONLY_HOST_CAN_REVIEW');
    END IF;

    IF p_decision = 'approved' THEN
        -- Mark submission approved
        UPDATE public.submissions
        SET status = 'approved', reviewed_at = now()
        WHERE id = p_submission_id;

        -- End round with winner
        UPDATE public.rounds
        SET status = 'finished',
            ended_at = now(),
            winner_player_id = v_sub.player_id
        WHERE id = v_round.id;

        -- Update room
        UPDATE public.rooms
        SET status = 'finished', updated_at = now()
        WHERE id = v_room.id;

        -- Update player profiles stats (winner)
        UPDATE public.profiles p
        SET games_won = games_won + 1,
            best_score = GREATEST(best_score, COALESCE(v_sub.match_score, 0))
        FROM public.players pl
        WHERE pl.id = v_sub.player_id AND p.id = pl.user_id;

        -- Increment games_played for all room participants
        UPDATE public.profiles p
        SET games_played = games_played + 1
        FROM public.players pl
        WHERE pl.room_id = v_room.id AND p.id = pl.user_id;

        RETURN jsonb_build_object(
            'success', true,
            'decision', 'approved',
            'winner_player_id', v_sub.player_id,
            'room_status', 'finished'
        );
    ELSE
        -- Decision is 'rejected'
        UPDATE public.submissions
        SET status = 'rejected', reviewed_at = now()
        WHERE id = p_submission_id;

        -- Check if more pending submissions exist in this round
        SELECT COUNT(*) INTO v_pending_count
        FROM public.submissions
        WHERE round_id = v_round.id AND status = 'pending';

        IF v_pending_count > 0 THEN
            -- Stay in reviewing; next submission will be pulled
            RETURN jsonb_build_object(
                'success', true,
                'decision', 'rejected',
                'more_pending', true
            );
        END IF;

        -- Queue is empty. Check if remaining time > 0 and any active players have attempts left
        SELECT COUNT(*) INTO v_players_with_attempts
        FROM public.players p
        WHERE p.room_id = v_room.id AND p.status = 'active'
          AND (
              SELECT COUNT(*) FROM public.submissions s 
              WHERE s.round_id = v_round.id AND s.player_id = p.id
          ) < 3;

        IF v_round.remaining_seconds > 0 AND v_players_with_attempts > 0 THEN
            -- Resume round!
            UPDATE public.rounds
            SET status = 'active',
                resumed_at = now()
            WHERE id = v_round.id;

            UPDATE public.rooms
            SET status = 'in_round', updated_at = now()
            WHERE id = v_room.id;

            RETURN jsonb_build_object(
                'success', true,
                'decision', 'rejected',
                'resumed', true,
                'remaining_seconds', v_round.remaining_seconds
            );
        ELSE
            -- No attempts or time left; round ends with no winner
            UPDATE public.rounds
            SET status = 'no_winner', ended_at = now()
            WHERE id = v_round.id;

            UPDATE public.rooms
            SET status = 'finished', updated_at = now()
            WHERE id = v_room.id;

            RETURN jsonb_build_object(
                'success', true,
                'decision', 'rejected',
                'resumed', false,
                'round_status', 'no_winner'
            );
        END IF;
    END IF;
END;
$$;

-- 6. player_leave_room (With Host Migration & Auto-Pause Quota Recalculation)
CREATE OR REPLACE FUNCTION public.player_leave_room(
    p_room_id UUID
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_player public.players%ROWTYPE;
    v_room public.rooms%ROWTYPE;
    v_next_host public.players%ROWTYPE;
    v_active_players INT;
    v_active_round public.rounds%ROWTYPE;
    v_finished_players INT;
    v_elapsed INT;
    v_frozen_remaining INT;
BEGIN
    SELECT * INTO v_player 
    FROM public.players 
    WHERE room_id = p_room_id AND user_id = v_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'PLAYER_NOT_IN_ROOM');
    END IF;

    -- Mark player as left
    UPDATE public.players
    SET status = 'left', last_seen_at = now()
    WHERE id = v_player.id;

    SELECT * INTO v_room FROM public.rooms WHERE id = p_room_id FOR UPDATE;

    -- Count remaining active players
    SELECT COUNT(*) INTO v_active_players
    FROM public.players
    WHERE room_id = p_room_id AND status = 'active';

    IF v_active_players = 0 THEN
        -- Room abandoned
        UPDATE public.rooms
        SET status = 'abandoned', updated_at = now()
        WHERE id = p_room_id;

        RETURN jsonb_build_object('success', true, 'room_status', 'abandoned');
    END IF;

    -- Host Migration if leaving player was host
    IF v_player.is_host THEN
        SELECT * INTO v_next_host
        FROM public.players
        WHERE room_id = p_room_id AND status = 'active'
        ORDER BY joined_at ASC
        LIMIT 1;

        IF FOUND THEN
            UPDATE public.rooms
            SET host_id = v_next_host.user_id, updated_at = now()
            WHERE id = p_room_id;

            UPDATE public.players SET is_host = true WHERE id = v_next_host.id;
            UPDATE public.players SET is_host = false WHERE id = v_player.id;
        END IF;
    END IF;

    -- If in active round, recalculate submission quota for remaining players
    SELECT * INTO v_active_round
    FROM public.rounds
    WHERE room_id = p_room_id AND status = 'active'
    ORDER BY started_at DESC
    LIMIT 1;

    IF FOUND THEN
        SELECT COUNT(DISTINCT p.id) INTO v_finished_players
        FROM public.players p
        WHERE p.room_id = p_room_id AND p.status = 'active'
          AND (
              EXISTS (
                  SELECT 1 FROM public.submissions s 
                  WHERE s.round_id = v_active_round.id AND s.player_id = p.id
              )
              OR (
                  SELECT COUNT(*) FROM public.submissions s2
                  WHERE s2.round_id = v_active_round.id AND s2.player_id = p.id
              ) >= 3
          );

        IF v_finished_players >= v_active_players THEN
            v_elapsed := EXTRACT(EPOCH FROM (now() - v_active_round.resumed_at))::int;
            v_frozen_remaining := GREATEST(0, v_active_round.remaining_seconds - v_elapsed);

            UPDATE public.rounds
            SET status = 'paused',
                paused_at = now(),
                remaining_seconds = v_frozen_remaining
            WHERE id = v_active_round.id;

            UPDATE public.rooms
            SET status = 'reviewing', updated_at = now()
            WHERE id = p_room_id;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'remaining_players', v_active_players,
        'new_host_id', v_next_host.user_id
    );
END;
$$;

-- 7. sync_player_presence (Dynamic Quota Shrinking on Disconnect)
CREATE OR REPLACE FUNCTION public.sync_player_presence(
    p_room_id UUID,
    p_status TEXT -- 'active' or 'disconnected'
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_player public.players%ROWTYPE;
    v_active_round public.rounds%ROWTYPE;
    v_active_players INT;
    v_finished_players INT;
    v_elapsed INT;
    v_frozen_remaining INT;
BEGIN
    IF p_status NOT IN ('active', 'disconnected') THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_STATUS');
    END IF;

    UPDATE public.players
    SET status = p_status, last_seen_at = now()
    WHERE room_id = p_room_id AND user_id = v_user_id
    RETURNING * INTO v_player;

    -- If disconnected during an active round, recheck if remaining active players all submitted
    IF p_status = 'disconnected' THEN
        SELECT * INTO v_active_round
        FROM public.rounds
        WHERE room_id = p_room_id AND status = 'active'
        ORDER BY started_at DESC
        LIMIT 1;

        IF FOUND THEN
            SELECT COUNT(*) INTO v_active_players
            FROM public.players
            WHERE room_id = p_room_id AND status = 'active';

            IF v_active_players > 0 THEN
                SELECT COUNT(DISTINCT p.id) INTO v_finished_players
                FROM public.players p
                WHERE p.room_id = p_room_id AND p.status = 'active'
                  AND EXISTS (
                      SELECT 1 FROM public.submissions s 
                      WHERE s.round_id = v_active_round.id AND s.player_id = p.id
                  );

                IF v_finished_players >= v_active_players THEN
                    v_elapsed := EXTRACT(EPOCH FROM (now() - v_active_round.resumed_at))::int;
                    v_frozen_remaining := GREATEST(0, v_active_round.remaining_seconds - v_elapsed);

                    UPDATE public.rounds
                    SET status = 'paused',
                        paused_at = now(),
                        remaining_seconds = v_frozen_remaining
                    WHERE id = v_active_round.id;

                    UPDATE public.rooms
                    SET status = 'reviewing', updated_at = now()
                    WHERE id = p_room_id;
                END IF;
            END IF;
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'status', p_status);
END;
$$;
