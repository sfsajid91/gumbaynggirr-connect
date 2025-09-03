import type { AudioRecorder as AudioRecorderType } from "expo-audio";
import { AudioModule, RecordingPresets, setAudioModeAsync } from "expo-audio";
import * as FileSystem from "expo-file-system";
import { getDb } from "./db";

// Create a recording instance that can be used by components
export function createAudioRecorder() {
  let recording: AudioRecorderType | null = null;

  const startRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission?.granted) {
        throw new Error("Microphone permission not granted");
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // Use the runtime class off AudioModule to avoid undefined prototype issues
      const RecorderClass: any = (AudioModule as any).AudioRecorder;
      if (!RecorderClass) throw new Error("AudioRecorder class not available");
      recording = new RecorderClass(
        RecordingPresets.HIGH_QUALITY
      ) as AudioRecorderType;
      await (recording as any).prepareToRecordAsync();
      (recording as any).record();
      return recording;
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  };

  const stopRecording = async () => {
    if (recording) {
      await (recording as any).stop();
      const uri = (recording as any).uri ?? (recording as any).url ?? null;
      recording = null;
      return uri;
    }
    return null;
  };

  return {
    startRecording,
    stopRecording,
    isRecording: () => recording !== null,
  };
}

export async function startRecording(): Promise<AudioRecorderType> {
  const recorder = createAudioRecorder();
  return await recorder.startRecording();
}

export async function stopAndSaveRecording(
  eventId: string,
  recording: AudioRecorderType
) {
  if (!recording) return;

  await (recording as any).stop();
  const sourceUri: string | null =
    (recording as any).uri ?? (recording as any).url ?? null;
  if (!sourceUri) return;

  const filename = `${Date.now()}-${eventId}.m4a`;
  const dest = FileSystem.documentDirectory + filename;

  try {
    await FileSystem.copyAsync({ from: sourceUri, to: dest });
  } catch (copyErr) {
    console.warn("copyAsync failed, attempting moveAsync", copyErr);
    try {
      await FileSystem.moveAsync({ from: sourceUri, to: dest });
    } catch (moveErr) {
      console.error("Failed to persist recorded file", moveErr);
      return;
    }
  }

  try {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO audio_notes (event_id, file_uri, duration_ms, created_at) VALUES (?, ?, ?, ?)`,
      eventId,
      dest,
      (recording as any).currentTime
        ? Math.round((recording as any).currentTime * 1000)
        : null,
      Date.now()
    );
  } catch (e) {
    // Non-fatal if DB is not available; the file is still saved locally
    console.warn("Failed to persist audio note in DB", e);
  }

  return dest;
}
