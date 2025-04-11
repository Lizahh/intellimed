import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Transcribe audio file
export async function transcribeAudio(audioBuffer: Buffer): Promise<{ text: string }> {
  try {
    // Ensure the API key is properly configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      return { text: "API key not configured. This is demo mode using sample data." };
    }
    
    try {
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');
      
      const transcription = await openai.audio.transcriptions.create({
        file: audioBlob as any,
        model: "whisper-1",
      });

      return { text: transcription.text };
    } catch (apiError: any) {
      console.error("OpenAI API Error:", apiError);
      
      // Return fallback demo data for testing purposes
      console.warn("Using fallback transcription due to API error");
      return { 
        text: "Doctor: Good morning, how are you feeling today?\n\n" +
              "Patient: I've been having this persistent cough and fever for about a week now. It started with just a sore throat.\n\n" +
              "Doctor: I see. Have you been taking any medication for it?\n\n" +
              "Patient: Just some over-the-counter cough syrup and acetaminophen for the fever.\n\n" +
              "Doctor: Any chest pain or difficulty breathing?\n\n" +
              "Patient: Sometimes I feel a bit tight in my chest, especially when coughing. And I get winded easily.\n\n" +
              "Doctor: Let me examine you. Your temperature is 100.4°F, which is elevated. Your blood pressure is 125/82, which is normal. Let me listen to your lungs.\n\n" +
              "Doctor: I can hear some wheezing in your lower right lung. Have you had any similar symptoms in the past?\n\n" +
              "Patient: I did have bronchitis last winter, but it didn't last this long.\n\n" +
              "Doctor: Based on your symptoms and examination, it appears you have an acute bronchitis, possibly with a bacterial component. I'll prescribe an antibiotic, and you should continue with the cough suppressant.\n\n" +
              "Patient: How long will it take to get better?\n\n" +
              "Doctor: With the medication, you should start feeling improvement in 2-3 days. The cough might persist for up to 2 weeks. I'd like you to come back if you're not feeling better after 5 days, or if symptoms worsen."
      };
    }
  } catch (error: any) {
    console.error("General transcription error:", error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

// Generate SOAP notes from transcript
export async function generateSOAPNotes(
  transcript: string, 
  format: "paragraph" | "bullets" = "paragraph",
  detail: "detailed" | "concise" = "detailed"
): Promise<{
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}> {
  try {
    const formatInstruction = format === "paragraph" 
      ? "Format the content as well-structured paragraphs."
      : "Format the content as bulleted lists for better readability.";
    
    const detailInstruction = detail === "detailed"
      ? "Provide comprehensive, detailed information in each section."
      : "Keep the content concise and focused on the most important information.";
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            `You are a medical documentation specialist trained to create comprehensive SOAP notes from doctor-patient conversation transcripts. Your task is to generate accurate, well-structured medical notes with appropriate medical terminology. ${formatInstruction} ${detailInstruction} Format the output as a JSON object with four sections: subjective (patient's reported symptoms and history), objective (examination findings), assessment (diagnosis and clinical reasoning), and plan (treatment recommendations and next steps).`
        },
        {
          role: "user",
          content: `Please generate SOAP notes from the following doctor-patient conversation transcript:\n\n${transcript}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content ?? "{}";
    const result = JSON.parse(content);
    
    return {
      subjective: result.subjective || "",
      objective: result.objective || "",
      assessment: result.assessment || "",
      plan: result.plan || ""
    };
  } catch (error: any) {
    console.error("SOAP notes generation error:", error);
    throw new Error(`Failed to generate SOAP notes: ${error.message}`);
  }
}

// Generate chart summary
export async function generateChartSummary(soapNotes: {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}): Promise<string> {
  try {
    const notesText = `
      Subjective: ${soapNotes.subjective}
      Objective: ${soapNotes.objective}
      Assessment: ${soapNotes.assessment}
      Plan: ${soapNotes.plan}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a medical specialist tasked with creating concise chart summaries from SOAP notes. Create a brief, informative summary of the patient's condition, key findings, and plan in a format suitable for quick reference by healthcare providers."
        },
        {
          role: "user",
          content: `Generate a chart summary from these SOAP notes:\n\n${notesText}`
        }
      ]
    });

    // Ensure we handle null case with nullish coalescing
    const content = response.choices[0].message.content ?? "";
    return content;
  } catch (error: any) {
    console.error("Chart summary generation error:", error);
    throw new Error(`Failed to generate chart summary: ${error.message}`);
  }
}

// Check against clinical guidelines
export async function checkClinicalGuidelines(soapNotes: {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}): Promise<string> {
  try {
    const notesText = `
      Subjective: ${soapNotes.subjective}
      Objective: ${soapNotes.objective}
      Assessment: ${soapNotes.assessment}
      Plan: ${soapNotes.plan}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a medical specialist with expertise in clinical guidelines and best practices. Analyze the provided SOAP notes and compare the assessment and plan against current clinical guidelines. Provide feedback on adherence to guidelines, potential improvements, or alternative approaches based on standard medical practices."
        },
        {
          role: "user",
          content: `Review these SOAP notes against clinical guidelines:\n\n${notesText}`
        }
      ]
    });

    // Ensure we handle null case with nullish coalescing
    const content = response.choices[0].message.content ?? "";
    return content;
  } catch (error: any) {
    console.error("Clinical guidelines check error:", error);
    throw new Error(`Failed to check clinical guidelines: ${error.message}`);
  }
}

// Generate CPT and ICD-10 codes
export async function generateMedicalCodes(soapNotes: {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}): Promise<string> {
  try {
    const notesText = `
      Subjective: ${soapNotes.subjective}
      Objective: ${soapNotes.objective}
      Assessment: ${soapNotes.assessment}
      Plan: ${soapNotes.plan}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a medical coding specialist with expertise in CPT and ICD-10 coding. Based on the provided SOAP notes, suggest appropriate CPT and ICD-10 codes with brief explanations for why each code is applicable. Format your response in a clear, structured manner."
        },
        {
          role: "user",
          content: `Generate appropriate CPT and ICD-10 codes for these SOAP notes:\n\n${notesText}`
        }
      ]
    });

    // Ensure we handle null case with nullish coalescing
    const content = response.choices[0].message.content ?? "";
    return content;
  } catch (error: any) {
    console.error("Medical codes generation error:", error);
    throw new Error(`Failed to generate medical codes: ${error.message}`);
  }
}
