import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { getDb } from "./db";

export async function startRecording(): Promise<Audio.Recording> {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  await recording.startAsync();
  return recording;
}

export async function stopAndSaveRecording(
  eventId: string,
  recording: Audio.Recording
) {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  if (!uri) return;
  const filename = `${Date.now()}-${eventId}.m4a`;
  const dest = FileSystem.documentDirectory + filename;
  await FileSystem.copyAsync({ from: uri, to: dest });

  const db = await getDb();
  await db.runAsync(
    `INSERT INTO audio_notes (event_id, file_uri, duration_ms, created_at) VALUES (?, ?, ?, ?)`,
    eventId,
    dest,
    (await recording.getStatusAsync()).durationMillis ?? null,
    Date.now()
  );

  return dest;
}
