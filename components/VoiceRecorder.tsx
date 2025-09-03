import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useState, useRef } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        const permission = await requestPermission();
        if (!permission.granted) {
          Alert.alert(
            "Permission required",
            "Please allow microphone access to record audio."
          );
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Update duration every second
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      console.log('Recording started');
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      console.log('Stopping recording..');
      setIsRecording(false);

      // Clear the duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);

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
      if (sound) {
        await sound.unloadAsync();
      }

      console.log('Loading Sound');
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      console.log('Playing Sound');
    } catch (err) {
      console.error("Failed to play recording", err);
      Alert.alert("Error", "Failed to play recording.");
    }
  };

  const stopPlayback = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
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
              if (sound) {
                await sound.unloadAsync();
                setSound(null);
              }
              await deleteStoredRecording(eventId);
              setRecordingUri(null);
              setRecordingDuration(0);
              setIsPlaying(false);
            } catch (error) {
              console.error('Failed to delete recording:', error);
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
  }, [eventId]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [sound, recording]);

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
