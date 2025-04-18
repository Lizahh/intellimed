import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingTimeSubject = new BehaviorSubject<string>('00:00:00');
  recordingTime$ = this.recordingTimeSubject.asObservable();
  
  private recordingStatusSubject = new BehaviorSubject<'inactive' | 'recording' | 'paused'>('inactive');
  recordingStatus$ = this.recordingStatusSubject.asObservable();
  
  private transcriptSubject = new BehaviorSubject<string>('');
  transcript$ = this.transcriptSubject.asObservable();
  
  private timer: any;
  private startTime: number = 0;

  constructor() {}

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });
      
      this.mediaRecorder.start();
      this.recordingStatusSubject.next('recording');
      this.startTimer();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.recordingStatusSubject.next('paused');
      this.pauseTimer();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.recordingStatusSubject.next('recording');
      this.resumeTimer();
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          resolve(audioBlob);
        });
        
        this.mediaRecorder.stop();
        this.stopTimer();
        this.recordingStatusSubject.next('inactive');
        
        // Stop all tracks to release microphone
        const tracks = this.mediaRecorder.stream.getTracks();
        tracks.forEach(track => track.stop());
      } else {
        resolve(new Blob([]));
      }
    });
  }
  
  uploadAudio(audioFile: File): Promise<void> {
    return new Promise((resolve, reject) => {
      // In a real app, you would upload to a server
      setTimeout(() => {
        // Simulate successful upload
        this.transcriptSubject.next('Transcript data would appear here after processing the uploaded audio.');
        resolve();
      }, 1500);
    });
  }

  private startTimer(): void {
    this.startTime = Date.now();
    this.recordingTimeSubject.next('00:00:00');
    
    this.timer = setInterval(() => {
      const elapsedTime = Date.now() - this.startTime;
      const formattedTime = this.formatTime(elapsedTime);
      this.recordingTimeSubject.next(formattedTime);
    }, 1000);
  }

  private pauseTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private resumeTimer(): void {
    // Adjust start time to account for paused duration
    const currentPauseTime = Date.now();
    const elapsedTimeStr = this.recordingTimeSubject.getValue();
    const [hours, minutes, seconds] = elapsedTimeStr.split(':').map(Number);
    const elapsedMs = ((hours * 60 + minutes) * 60 + seconds) * 1000;
    
    this.startTime = Date.now() - elapsedMs;
    
    this.timer = setInterval(() => {
      const elapsedTime = Date.now() - this.startTime;
      const formattedTime = this.formatTime(elapsedTime);
      this.recordingTimeSubject.next(formattedTime);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.recordingTimeSubject.next('00:00:00');
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }
}
