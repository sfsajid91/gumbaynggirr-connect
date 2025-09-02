import {
  AudioModule,
  AudioRecorder,
  RecordingPresets,
  setAudioModeAsync,
} from "expo-audio";
import * as FileSystem from "expo-file-system";
import { getDb } from "./db";

// Create a recording instance that can be used by components
export function createAudioRecorder() {
  let recording: AudioRecorder | null = null;

  const startRecording = async () => {
    try {
      await AudioModule.requestRecordingPermissionsAsync();
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      recording = new AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await recording.prepareToRecordAsync();
      recording.record();
      return recording;
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  };

  const stopRecording = async () => {
    if (recording) {
      await recording.stop();
      const uri = recording.uri;
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

export async function startRecording(): Promise<AudioRecorder> {
  const recorder = createAudioRecorder();
  return await recorder.startRecording();
}

export async function stopAndSaveRecording(
  eventId: string,
  recording: AudioRecorder
) {
  if (!recording) return;

  await recording.stop();
  const uri = recording.uri;
  if (!uri) return;

  const filename = `${Date.now()}-${eventId}.m4a`;
  const dest = FileSystem.documentDirectory + filename;
  await FileSystem.copyAsync({ from: uri, to: dest });

  const db = await getDb();
  await db.runAsync(
    `INSERT INTO audio_notes (event_id, file_uri, duration_ms, created_at) VALUES (?, ?, ?, ?)`,
    eventId,
    dest,
    recording.currentTime ? Math.round(recording.currentTime * 1000) : null,
    Date.now()
  );

  return dest;
}
