import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, catchError, tap } from 'rxjs';
import { AudioService } from '../../core/services/audio.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { DisplayTimePipe } from '../../shared/pipes/display-time.pipe';

@Component({
  selector: 'app-audio-recorder',
  templateUrl: './audio-recorder.component.html',
  styleUrls: ['./audio-recorder.component.scss'],
  standalone: true,
  imports: [CommonModule, AsyncPipe, DisplayTimePipe]
})
export class AudioRecorderComponent implements OnInit, OnDestroy {
  recordingTime$: Observable<string>;
  recordingStatus$: Observable<'inactive' | 'recording' | 'paused'>;
  defaultTime: string = '00:00:00';
  private subscriptions: Subscription[] = [];
  
  constructor(public audioService: AudioService) {
    this.recordingTime$ = this.audioService.recordingTime$;
    this.recordingStatus$ = this.audioService.recordingStatus$;
  }

  ngOnInit(): void {
    // Add a subscription to track recording status changes for analytics/logging
    const statusSub = this.recordingStatus$
      .pipe(
        tap(status => {
          console.log('Recording status changed:', status);
        }),
        catchError(err => {
          console.error('Error in recording status stream:', err);
          throw err;
        })
      )
      .subscribe();
    
    this.subscriptions.push(statusSub);
  }

  ngOnDestroy(): void {
    // Properly clean up all subscriptions
    this.subscriptions.forEach(sub => {
      if (sub && !sub.closed) {
        sub.unsubscribe();
      }
    });
  }

  /**
   * Start recording audio
   */
  startRecording(): void {
    try {
      this.audioService.startRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  /**
   * Pause the current recording
   */
  pauseRecording(): void {
    try {
      this.audioService.pauseRecording();
    } catch (error) {
      console.error('Error pausing recording:', error);
    }
  }

  /**
   * Resume a paused recording
   */
  resumeRecording(): void {
    try {
      this.audioService.resumeRecording();
    } catch (error) {
      console.error('Error resuming recording:', error);
    }
  }

  /**
   * Stop the current recording and process the audio
   */
  stopRecording(): void {
    try {
      this.audioService.stopRecording();
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }

  /**
   * Handle audio file selection
   * @param event The file input change event
   */
  onFileSelected(event: Event): void {
    try {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        if (this.isValidAudioFile(file)) {
          this.audioService.uploadAudio(file);
        } else {
          console.warn('Invalid audio file selected');
          // Could show an error message to the user here
        }
      }
    } catch (error) {
      console.error('Error uploading audio file:', error);
    }
  }

  /**
   * Validate that the file is an acceptable audio format
   * @param file The file to validate
   * @returns Whether the file is a valid audio file
   */
  private isValidAudioFile(file: File): boolean {
    // List of common audio MIME types
    const validAudioTypes = [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/x-m4a',
      'audio/webm',
      'audio/ogg'
    ];
    return validAudioTypes.includes(file.type);
  }
}
