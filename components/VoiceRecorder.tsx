import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  AudioRecorder,
  RecordingPresets,
  setAudioModeAsync,
} from "expo-audio";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import { AudioStudio } from '@siteed/expo-audio-studio'; // Optional enhancement
import { Colors } from "../constants/colors";
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
  const [audioData, setAudioData] = useState<number[]>([]);
  const [audioStudio] = useState<any>(null);
  const [recording, setRecording] = useState<AudioRecorder | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const startRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow microphone access to record audio."
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      const newRecording = new AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await newRecording.prepareToRecordAsync();

      // Start audio analysis if AudioStudio is available
      if (audioStudio) {
        audioStudio.startAnalysis((data: any) => {
          setAudioData(data.waveform || []);
        });
      }

      newRecording.record();
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Update duration every second
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Store interval reference to clear it later
      (newRecording as any).durationInterval = interval;
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);

      // Clear the duration interval
      if ((recording as any).durationInterval) {
        clearInterval((recording as any).durationInterval);
      }

      await recording.stop();
      const uri = recording.uri;

      if (uri) {
        setRecordingUri(uri);
        onRecordingComplete?.(uri);
      }

      setRecording(null);
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert("Error", "Failed to stop recording.");
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      // For now, just show that playback would start
      // Full playback implementation would require additional expo-audio setup
      setIsPlaying(true);

      // Simulate playback duration (you would implement actual playback here)
      setTimeout(() => {
        setIsPlaying(false);
      }, recordingDuration * 1000);
    } catch (err) {
      console.error("Failed to play recording", err);
      Alert.alert("Error", "Failed to play recording.");
    }
  };

  const stopPlayback = async () => {
    setIsPlaying(false);
  };

  const deleteRecording = () => {
    Alert.alert(
      "Delete Recording",
      "Are you sure you want to delete this voice note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteStoredRecording(eventId).catch(() => {});
            setRecordingUri(null);
            setRecordingDuration(0);
            setIsPlaying(false);
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

  const loadExistingRecording = async () => {
    try {
      const existingRecording = await getStoredRecording(eventId);
      if (existingRecording) {
        setRecordingUri(existingRecording);
      }
    } catch (error) {
      console.error("Failed to load existing recording:", error);
    }
  };

  useEffect(() => {
    loadExistingRecording();
    initializeAudioStudio();
  }, [eventId]);

  const initializeAudioStudio = async () => {
    try {
      // const { AudioStudio } = await import('@siteed/expo-audio-studio');
      // const studio = new AudioStudio();
      // await studio.initialize();
      // setAudioStudio(studio);
      console.log("AudioStudio integration ready for future enhancement");
    } catch {
      console.log("AudioStudio not available, using fallback");
    }
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

      <WaveVisualization
        isRecording={isRecording}
        isPlaying={isPlaying}
        duration={recordingDuration}
        audioData={audioData}
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
              onPress={playRecording}
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
