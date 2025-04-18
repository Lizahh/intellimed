import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AudioRecorderComponent } from './audio-recorder.component';
import { AudioService } from '../../core/services/audio.service';
import { of } from 'rxjs';
import { DisplayTimePipe } from '../../shared/pipes/display-time.pipe';
import { CommonModule } from '@angular/common';

describe('AudioRecorderComponent', () => {
  let component: AudioRecorderComponent;
  let fixture: ComponentFixture<AudioRecorderComponent>;
  let mockAudioService: jasmine.SpyObj<AudioService>;

  beforeEach(async () => {
    mockAudioService = jasmine.createSpyObj('AudioService', [
      'startRecording',
      'pauseRecording',
      'resumeRecording',
      'stopRecording',
      'uploadAudio'
    ]);

    // Set up observable properties
    mockAudioService.recordingTime$ = of('00:01:30');
    mockAudioService.recordingStatus$ = of('inactive');

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        AudioRecorderComponent,
        DisplayTimePipe
      ],
      providers: [
        { provide: AudioService, useValue: mockAudioService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AudioRecorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set up observables in constructor', () => {
    expect(component.recordingTime$).toBeDefined();
    expect(component.recordingStatus$).toBeDefined();
    expect(component.defaultTime).toBe('00:00:00');
  });

  it('should call startRecording on service when startRecording is called', () => {
    component.startRecording();
    expect(mockAudioService.startRecording).toHaveBeenCalled();
  });

  it('should call pauseRecording on service when pauseRecording is called', () => {
    component.pauseRecording();
    expect(mockAudioService.pauseRecording).toHaveBeenCalled();
  });

  it('should call resumeRecording on service when resumeRecording is called', () => {
    component.resumeRecording();
    expect(mockAudioService.resumeRecording).toHaveBeenCalled();
  });

  it('should call stopRecording on service when stopRecording is called', () => {
    component.stopRecording();
    expect(mockAudioService.stopRecording).toHaveBeenCalled();
  });

  it('should call uploadAudio when a file is selected', () => {
    const file = new File(['test content'], 'test.mp3', { type: 'audio/mp3' });
    const event = {
      target: {
        files: [file]
      }
    } as unknown as Event;
    
    component.onFileSelected(event);
    expect(mockAudioService.uploadAudio).toHaveBeenCalledWith(file);
  });

  it('should not call uploadAudio when no file is selected', () => {
    const event = {
      target: {
        files: null
      }
    } as unknown as Event;
    
    component.onFileSelected(event);
    expect(mockAudioService.uploadAudio).not.toHaveBeenCalled();
  });

  it('should clean up subscriptions on destroy', () => {
    const subSpy = spyOn(component['subscriptions'][0], 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(subSpy).toHaveBeenCalled();
  });
});