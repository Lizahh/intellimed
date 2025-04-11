import { useState, useEffect } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTranscription } from "@/hooks/useTranscription";
import AudioVisualizer from "./AudioVisualizer";
import AudioUploader from "./AudioUploader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onTranscriptionComplete: (transcript: string) => void;
  onStatusChange: (status: "ready" | "recording" | "processing") => void;
}

export default function AudioRecorder({ 
  onTranscriptionComplete,
  onStatusChange
}: AudioRecorderProps) {
  // State hooks
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordingStatus, setRecordingStatus] = useState<string>("Ready to record");
  
  // Custom hooks
  const { toast } = useToast();
  const { 
    isRecording,
    isPaused,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    audioBlob
  } = useAudioRecorder();
  const { transcribe, isTranscribing } = useTranscription();

  // Update parent component with status
  useEffect(() => {
    if (isRecording) {
      onStatusChange("recording");
    } else if (isTranscribing) {
      onStatusChange("processing");
    } else {
      onStatusChange("ready");
    }
  }, [isRecording, isTranscribing, onStatusChange]);

  // Timer for recording duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  // Update recording status
  useEffect(() => {
    if (isRecording) {
      if (isPaused) {
        setRecordingStatus("Paused");
      } else {
        setRecordingStatus("Recording...");
      }
    } else if (isTranscribing) {
      setRecordingStatus("Processing...");
    } else if (audioBlob) {
      setRecordingStatus("Recording complete");
    } else {
      setRecordingStatus("Ready to record");
    }
  }, [isRecording, isPaused, isTranscribing, audioBlob]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleRecordClick = async () => {
    if (isRecording) {
      return;
    }
    
    try {
      // Request microphone permission explicitly
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecordingTime(0);
      startRecording();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record audio",
        variant: "destructive"
      });
    }
  };

  const handlePauseClick = () => {
    if (!isRecording) return;
    
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  const handleStopClick = () => {
    if (!isRecording) return;
    
    stopRecording();
  };

  const handleGenerateClick = async () => {
    if (!audioBlob) {
      toast({
        title: "No recording available",
        description: "Please record or upload audio first",
        variant: "destructive"
      });
      return;
    }

    try {
      const transcript = await transcribe(audioBlob);
      onTranscriptionComplete(transcript);
      toast({
        title: "Transcription Complete",
        description: "Ready to generate SOAP notes",
      });
    } catch (error) {
      toast({
        title: "Transcription Failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  };

  const handleUploadComplete = async (blob: Blob) => {
    try {
      const transcript = await transcribe(blob);
      onTranscriptionComplete(transcript);
      toast({
        title: "Transcription Complete",
        description: "Ready to generate SOAP notes",
      });
    } catch (error) {
      toast({
        title: "Transcription Failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  };

  // State to track transcript during recording
  const [liveTranscript, setLiveTranscript] = useState<string>("");

  // Update live transcript during recording (simulated for now)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const demoLines = [
      "Doctor: How are you feeling today?",
      "Patient: I've been having this persistent cough for about a week now.",
      "Doctor: I see. Any other symptoms?",
      "Patient: Some fever in the evenings, and I feel tired all the time.",
      "Doctor: Let me check your temperature and listen to your lungs.",
      "Doctor: Your temperature is slightly elevated at 99.8°F."
    ];
    
    if (isRecording && !isPaused) {
      let lineIndex = 0;
      interval = setInterval(() => {
        if (lineIndex < demoLines.length) {
          setLiveTranscript(prev => prev + (prev ? "\n\n" : "") + demoLines[lineIndex]);
          lineIndex++;
        }
      }, 3000); // Add a new line every 3 seconds for demo
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  return (
    <div className="border rounded-lg shadow-sm bg-white p-5 mb-4 flex-1 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-neutral-800">Voice Recording</h3>
        
        {/* Recording Timer */}
        <div className="flex items-center text-sm font-medium bg-neutral-100 px-3 py-1 rounded-full">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isRecording && !isPaused ? 'bg-teal-500 animate-pulse' : 'bg-neutral-400'}`}></span>
          {formatTime(recordingTime)}
        </div>
      </div>

      {/* Recording Status with Animation */}
      <div className={`p-3 rounded-lg text-center mb-4 flex items-center justify-center font-medium transition-all duration-300 ${
        isRecording && !isPaused ? 'text-white bg-gradient-to-r from-teal-500 to-blue-500 shadow-md border border-cyan-400' : 
        isTranscribing ? 'text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md border border-blue-400' : 
        'text-neutral-700 bg-neutral-100 border border-neutral-200'
      }`}>
        <div className="flex items-center">
          {isRecording && !isPaused && (
            <div className="flex space-x-1 mr-2">
              <span className="w-1.5 h-5 bg-white rounded-full animate-[bounce_1.2s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-5 bg-white rounded-full animate-[bounce_1.2s_ease-in-out_infinite]" style={{ animationDelay: '200ms' }}></span>
              <span className="w-1.5 h-5 bg-white rounded-full animate-[bounce_1.2s_ease-in-out_infinite]" style={{ animationDelay: '400ms' }}></span>
            </div>
          )}
          {isTranscribing && (
            <span className="material-icons animate-spin mr-2">autorenew</span>
          )}
          <span className="text-sm">{recordingStatus}</span>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex justify-center items-center mb-4 space-x-4">
        <button 
          onClick={handleRecordClick}
          disabled={isRecording}
          type="button"
          className={`flex items-center justify-center w-14 h-14 ${isRecording ? 'bg-gray-300' : 'bg-gradient-to-r from-teal-500 to-blue-500'} text-white rounded-full hover:shadow-lg disabled:opacity-50 transition-all duration-300 ${isRecording ? '' : 'hover:scale-105'} shadow-md`}>
          <span className="material-icons text-2xl">mic</span>
        </button>
        <button 
          onClick={handlePauseClick}
          disabled={!isRecording}
          type="button"
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all duration-300 ${!isRecording ? 'bg-gray-100 text-gray-400' : isPaused ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'} ${isRecording ? 'hover:scale-105' : ''}`}>
          <span className="material-icons text-xl">{isPaused ? 'play_arrow' : 'pause'}</span>
        </button>
        <button 
          onClick={handleStopClick}
          disabled={!isRecording}
          type="button"
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all duration-300 ${!isRecording ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-600 hover:bg-red-200'} ${isRecording ? 'hover:scale-105' : ''}`}>
          <span className="material-icons text-xl">stop</span>
        </button>
      </div>

      {/* Recording Visualizer - Enhanced */}
      <div className={`mb-4 transition-all duration-500 ${isRecording && !isPaused ? 'opacity-100 h-16' : 'opacity-50 h-8'}`}>
        <div className="relative w-full h-full bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200">
          <AudioVisualizer isActive={isRecording && !isPaused} />
          {isRecording && !isPaused && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-[pulse_3s_ease-in-out_infinite]"></div>
          )}
        </div>
      </div>

      {/* Transcript Display */}
      <div className="flex-1 overflow-auto mb-4">
        <h4 className="font-medium text-neutral-700 mb-2">Transcript</h4>
        <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-4 h-48 overflow-auto text-sm whitespace-pre-line">
          {isRecording ? 
            liveTranscript || "Listening..." : 
            audioBlob ? "Recording complete. Click Generate to transcribe." : 
            "Record or upload audio to get started."}
        </div>
      </div>

      {/* File Upload and Generate Buttons */}
      <div className="flex items-center justify-between py-2 border-t border-neutral-100">
        <AudioUploader onUploadComplete={handleUploadComplete} />
        
        <button
          onClick={handleGenerateClick}
          disabled={isTranscribing || !audioBlob}
          type="button"
          className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 shadow-sm font-medium transition-colors">
          <span className="material-icons text-sm mr-2">auto_awesome</span>
          Generate SOAP Notes
        </button>
      </div>
    </div>
  );
}
