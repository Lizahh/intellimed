import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { AppComponent } from './app.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { PatientDetailsComponent } from './features/patient-details/patient-details.component';
import { SoapNotesComponent } from './features/soap-notes/soap-notes.component';
import { AudioRecorderComponent } from './features/audio-recorder/audio-recorder.component';

import { PatientService } from './core/services/patient.service';
import { AudioService } from './core/services/audio.service';
import { SoapNotesService } from './core/services/soap-notes.service';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HeaderComponent,
    PatientDetailsComponent,
    SoapNotesComponent,
    AudioRecorderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    PatientService,
    AudioService,
    SoapNotesService,
    provideRouter(routes)
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
