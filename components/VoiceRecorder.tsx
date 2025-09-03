import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/colors";
import {
  startRecording as startExpoRecording,
  stopAndSaveRecording,
} from "../lib/audio";
import { deleteStoredRecording, getStoredRecording } from "../lib/storage";
import WaveVisualization from "./WaveVisualization";

interface VoiceRecorderProps {
  eventId: string;
  onRecordingComplete?: (uri: string) => void;
  existingRecording?: string;
}

export default function VoiceRecorder({
  eventId,
  onRecordingComplete,
  existingRecording,
}: VoiceRecorderProps) {
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recorder, setRecorder] = useState<any | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const durationIntervalRef = useRef<number | null>(null);

  const player = useAudioPlayer(recordingUri || undefined);

  const startRecording = async () => {
    try {
      console.log("Starting recording..");
      const rec = await startExpoRecording();
      setRecorder(rec);
      setIsRecording(true);
      setRecordingDuration(0);

      // Update duration every second
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000) as unknown as number;

      console.log("Recording started");
    } catch (error: any) {
      console.error("Failed to start recording:", error);
      const message = error?.message?.includes("permission")
        ? "Microphone permission is required to record audio. Please enable it in Settings."
        : "Failed to start recording. Please try again.";
      Alert.alert("Recording", message);
    }
  };

  const stopRecording = async () => {
    if (!recorder) return;

    try {
      console.log("Stopping recording..");
      setIsRecording(false);

      // Clear the duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      const dest = await stopAndSaveRecording(eventId, recorder);
      if (dest) {
        setRecordingUri(dest);
        onRecordingComplete?.(dest);
      }

      setRecorder(null);
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert("Error", "Failed to stop recording.");
    }
  };

  const playRecording = async () => {
    if (!recordingUri || !player) return;
    try {
      await player.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Failed to play recording", err);
      Alert.alert("Error", "Failed to play recording.");
    }
  };

  const stopPlayback = async () => {
    try {
      if (player?.pause) await player.pause();
      setIsPlaying(false);
    } catch (err) {
      console.error("Failed to stop playback", err);
    }
  };

  const deleteRecording = async () => {
    Alert.alert(
      "Delete Recording",
      "Are you sure you want to delete this voice note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteStoredRecording(eventId);
              setRecordingUri(null);
              setRecordingDuration(0);
              setIsPlaying(false);
            } catch (error) {
              console.error("Failed to delete recording:", error);
            }
          },
        },
      ]
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const loadExistingRecording = useCallback(async () => {
    try {
      const existingRecording = await getStoredRecording(eventId);
      if (existingRecording) {
        setRecordingUri(existingRecording);
      }
    } catch (error) {
      console.error("Failed to load existing recording:", error);
    }
  }, [eventId]);

  useEffect(() => {
    if (existingRecording) {
      setRecordingUri(existingRecording);
      return;
    }
    loadExistingRecording();
  }, [eventId, existingRecording, loadExistingRecording]);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      try {
        if (player?.pause) player.pause();
      } catch {}
    };
  }, [player]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Note</Text>
        {recordingUri && (
          <TouchableOpacity
            onPress={deleteRecording}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.errorClay} />
          </TouchableOpacity>
        )}
      </View>

      <WaveVisualization
        isRecording={isRecording}
        isPlaying={isPlaying}
        duration={recordingDuration}
      />

      <View style={styles.controls}>
        {!recordingUri ? (
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            style={[
              styles.recordButton,
              {
                backgroundColor: isRecording
                  ? Colors.sunsetRed
                  : Colors.primaryOchre,
              },
            ]}
          >
            <Ionicons
              name={isRecording ? "stop" : "mic"}
              size={22}
              color="white"
            />
            <Text style={styles.buttonText}>
              {isRecording ? "Stop" : "Record"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.playbackControls}>
            <TouchableOpacity
              onPress={isPlaying ? stopPlayback : playRecording}
              style={[
                styles.playButton,
                {
                  backgroundColor: isPlaying
                    ? Colors.riverBlue
                    : Colors.primaryOchre,
                },
              ]}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={deleteRecording}
              style={[
                styles.rerecordButton,
                { backgroundColor: Colors.sunsetRed },
              ]}
            >
              <Ionicons name="trash" size={20} color="white" />
            </TouchableOpacity>

            <View style={styles.playbackDuration}>
              <Text style={styles.duration}>
                {formatDuration(recordingDuration)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {(isRecording || recordingUri) && (
        <Text style={styles.duration}>
          Duration: {formatDuration(recordingDuration)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: Colors.deepEarth,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 18,
  },
  controls: {
    marginTop: 16,
  },
  recordButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  playbackControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playbackDuration: {
    flex: 1,
    alignItems: "center",
  },
  playButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  rerecordButton: {
    width: 48,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  duration: {
    textAlign: "center",
    marginTop: 12,
    color: Colors.textMedium,
    fontSize: 14,
    fontWeight: "500",
  },
});
