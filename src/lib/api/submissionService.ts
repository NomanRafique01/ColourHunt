import { supabase } from '../supabase';
import {
  ReviewSubmissionResult,
  Submission,
  SubmitHuntResult,
} from '../../types';
import * as FileSystem from 'expo-file-system';

/**
 * Uploads captured hunt photo to Supabase Storage private relay.
 * Path: submissions/{roomId}/{roundId}/{userId}/{attempt}_{timestamp}.jpg
 */
export async function uploadHuntPhoto(
  roomId: string,
  roundId: string,
  userId: string,
  attemptNumber: number,
  localFileUri: string
): Promise<{ success: boolean; storagePath?: string; error?: string }> {
  try {
    const filename = `${attemptNumber}_${Date.now()}.jpg`;
    const storagePath = `${roomId}/${roundId}/${userId}/${filename}`;

    // Read local file as base64 and convert to Uint8Array for binary upload
    const base64Data = await FileSystem.readAsStringAsync(localFileUri, {
      encoding: 'base64',
    });
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const { error } = await supabase.storage
      .from('submissions')
      .upload(storagePath, byteArray, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, storagePath };
  } catch (err: any) {
    return { success: false, error: err.message || 'Photo upload failed' };
  }
}

/**
 * Submits hunt entry via atomic RPC.
 * Triggers all-players-submitted auto-pause if everyone has submitted.
 */
export async function submitHunt(
  roundId: string,
  storagePath: string,
  matchScore: number
): Promise<SubmitHuntResult> {
  try {
    const { data, error } = await supabase.rpc('submit_hunt', {
      p_round_id: roundId,
      p_storage_path: storagePath,
      p_match_score: matchScore,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data as SubmitHuntResult;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit hunt entry' };
  }
}

/**
 * Host reviews a submission (approve or reject).
 */
export async function reviewSubmission(
  submissionId: string,
  decision: 'approved' | 'rejected'
): Promise<ReviewSubmissionResult> {
  try {
    const { data, error } = await supabase.rpc('review_submission', {
      p_submission_id: submissionId,
      p_decision: decision,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data as ReviewSubmissionResult;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to review submission' };
  }
}

/**
 * Generates an ephemeral signed download URL for host photo inspection (valid for 60 seconds).
 */
export async function getSignedPhotoUrl(
  storagePath: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('submissions')
      .createSignedUrl(storagePath, 60);

    if (error || !data) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

/**
 * Deletes photo from Supabase Storage.
 */
export async function deleteStoragePhoto(storagePath: string): Promise<void> {
  try {
    await supabase.storage.from('submissions').remove([storagePath]);
  } catch (err) {
    console.warn('Failed to delete storage photo:', err);
  }
}

/**
 * Fetches pending submissions for review.
 */
export async function getPendingSubmissions(
  roundId: string
): Promise<Submission[]> {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('round_id', roundId)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true });

    if (error || !data) return [];

    return data.map((s) => ({
      id: s.id,
      roundId: s.round_id,
      playerId: s.player_id,
      storagePath: s.storage_path,
      matchScore: s.match_score ? Number(s.match_score) : null,
      status: s.status,
      submittedAt: s.submitted_at,
      reviewedAt: s.reviewed_at,
      attemptNumber: s.attempt_number,
    }));
  } catch {
    return [];
  }
}
