import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/colors";
import {
  deleteStoredRecording,
  getStoredRecordingWithDuration,
  storeRecording,
} from "../lib/storage";

interface VoiceRecorderProps {
  eventId: string;
}

export default function VoiceRecorder({ eventId }: VoiceRecorderProps) {
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [storedDuration, setStoredDuration] = useState<number | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Maximum recording duration: 1 minute (60 seconds)
  const MAX_RECORDING_DURATION = 60;

  // Audio hooks
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(recordingUri || undefined);
  const playerState = useAudioPlayerStatus(player);

  // Refs for intervals
  const recordingIntervalRef = useRef<number | null>(null);

  // Derived states
  const isRecording = recorderState.isRecording;
  const isPlaying = playerState.playing;

  // Request permissions and setup audio mode
  const setupAudio = useCallback(async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (status.granted) {
        setHasPermission(true);
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } else {
        Alert.alert(
          "Permission Required",
          "Microphone permission is required to record audio. Please enable it in Settings."
        );
      }
    } catch (error) {
      console.error("Failed to setup audio:", error);
    }
  }, []);

  const startRecording = async () => {
    if (!hasPermission) {
      await setupAudio();
      return;
    }

    try {
      console.log("Starting recording...");

      // Reset states
      setRecordingDuration(0);

      await recorder.prepareToRecordAsync();
      await recorder.record();

      // Start duration tracking
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;
          // Auto-stop recording at 1 minute
          if (newDuration >= MAX_RECORDING_DURATION) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

      console.log("Recording started");
    } catch (error: any) {
      console.error("Failed to start recording:", error);
      Alert.alert(
        "Recording Error",
        "Failed to start recording. Please try again."
      );
    }
  };

  const stopRecording = async () => {
    try {
      console.log("Stopping recording...");

      // Clear recording interval
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      await recorder.stop();

      // Get the recording URI from the recorder
      const uri = recorder.uri;

      if (uri) {
        // Save the recording with eventId for persistence, including duration
        const durationMs = recordingDuration * 1000; // Convert seconds to milliseconds

        const savedUri = await storeRecording(eventId, uri, durationMs);

        setRecordingUri(savedUri || uri);
        setStoredDuration(durationMs);
        console.log(
          "🎉 Recording process completed:",
          savedUri || uri,
          "Duration:",
          durationMs,
          "ms"
        );
      }
    } catch (error) {
      console.error("❌ Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording.");
    }
  };

  const startPlayback = async () => {
    if (!recordingUri) return;

    try {
      if (playerState.isLoaded) {
        await player.play();
      }
    } catch (error) {
      console.error("Failed to start playback:", error);
      Alert.alert("Error", "Failed to play recording.");
    }
  };

  const stopPlayback = async () => {
    try {
      await player.pause();
    } catch (error) {
      console.error("Failed to stop playback:", error);
    }
  };

  const seekToBeginning = useCallback(async () => {
    try {
      await player.seekTo(0);
    } catch (error) {
      console.error("Failed to seek to beginning:", error);
    }
  }, [player]);

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
              // Stop any ongoing playback
              if (isPlaying) {
                await stopPlayback();
              }

              await deleteStoredRecording(eventId);

              // Reset all states
              setRecordingUri(null);
              setRecordingDuration(0);
              setStoredDuration(null);
            } catch (error) {
              console.error("Failed to delete recording:", error);
              Alert.alert("Error", "Failed to delete recording.");
            }
          },
        },
      ]
    );
  };

  // Format time in MM:SS format (same as test.tsx)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const loadExistingRecording = useCallback(async () => {
    try {
      const existing = await getStoredRecordingWithDuration(eventId);
      console.log("Existing recording:", existing);
      if (existing) {
        setRecordingUri(existing.fileUri);
        setStoredDuration(existing.durationMs);
        console.log(
          "Loaded existing recording:",
          existing.fileUri,
          "Duration:",
          existing.durationMs,
          "ms"
        );
      }
    } catch (error) {
      console.error("Failed to load existing recording:", error);
    }
  }, [eventId]);

  // Load existing recording and setup audio on mount
  useEffect(() => {
    const initializeComponent = async () => {
      console.log("🚀 VoiceRecorder initializing for eventId:", eventId);

      await setupAudio();

      console.log("🔍 Loading existing recording from database...");
      await loadExistingRecording();
    };

    initializeComponent();
  }, [eventId, loadExistingRecording, setupAudio]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // Handle playback completion
  useEffect(() => {
    if (playerState.didJustFinish) {
      // Pause the player and seek to beginning when playback finishes
      player.pause();
      seekToBeginning();
    }
  }, [playerState.didJustFinish, seekToBeginning, player]);

  // Get recording progress percentage
  const getRecordingProgress = () => {
    return (recordingDuration / MAX_RECORDING_DURATION) * 100;
  };

  // Get playback progress percentage
  const getPlaybackProgress = () => {
    if (
      playerState.isLoaded &&
      playerState.duration &&
      playerState.currentTime
    ) {
      return (playerState.currentTime / playerState.duration) * 100;
    }
    return 0;
  };

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

      <View style={styles.controls}>
        {!recordingUri ? (
          <View style={styles.recordingSection}>
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
              disabled={!hasPermission}
            >
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={24}
                color="white"
              />
              <Text style={styles.buttonText}>
                {isRecording ? "Stop" : "Record"}
              </Text>
            </TouchableOpacity>

            {isRecording && (
              <View style={styles.recordingInfo}>
                <Text style={styles.recordingIndicator}>
                  Recording... {formatTime(recordingDuration)}
                </Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${getRecordingProgress()}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.playbackSection}>
            <TouchableOpacity
              onPress={isPlaying ? stopPlayback : startPlayback}
              style={[
                styles.playButton,
                {
                  backgroundColor: isPlaying
                    ? Colors.riverBlue
                    : Colors.primaryOchre,
                },
              ]}
              disabled={!playerState.isLoaded}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color="white"
              />
            </TouchableOpacity>

            <View style={styles.durationContainer}>
              {playerState.isLoaded && (
                <Text style={styles.durationText}>
                  Duration: {formatTime(playerState.currentTime || 0)} /{" "}
                  {formatTime(
                    playerState.duration ||
                      (storedDuration ? storedDuration / 1000 : 0)
                  )}
                </Text>
              )}
              {isPlaying && playerState.isLoaded && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${getPlaybackProgress()}%` },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {!hasPermission && (
        <Text style={styles.permissionWarning}>
          Microphone permission required for recording
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
  controls: {
    marginTop: 16,
  },
  recordingSection: {
    alignItems: "center",
    gap: 16,
  },
  playbackSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  recordButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    minWidth: 120,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  durationContainer: {
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  durationText: {
    color: Colors.textMedium,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 8,
  },
  recordingInfo: {
    alignItems: "center",
    width: "100%",
  },
  progressContainer: {
    marginTop: 8,
    width: "100%",
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.softGrey,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primaryOchre,
    borderRadius: 2,
  },
  recordingIndicator: {
    textAlign: "center",
    color: Colors.sunsetRed,
    fontSize: 14,
    fontWeight: "600",
  },
  permissionWarning: {
    textAlign: "center",
    marginTop: 8,
    color: Colors.errorClay,
    fontSize: 12,
    fontStyle: "italic",
  },
});
