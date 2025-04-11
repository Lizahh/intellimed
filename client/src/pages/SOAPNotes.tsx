import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import AudioRecorder from "@/components/audio/AudioRecorder";
import NotesEditor from "@/components/notes/NotesEditor";
import AgentSelector from "@/components/notes/AgentSelector";
import { useToast } from "@/hooks/use-toast";
import { SOAPNote } from "@/types";
import { apiRequest } from "@/lib/queryClient";

export default function SOAPNotes() {
  const [status, setStatus] = useState<"ready" | "recording" | "processing">("ready");
  const [statusText, setStatusText] = useState<string>("Ready");
  const [patientName, setPatientName] = useState<string>("Michael Peters");
  const [patientId, setPatientId] = useState<string>("845288");
  const [visitType, setVisitType] = useState<string>("Annual Physical");
  const [transcript, setTranscript] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [isNewPatient, setIsNewPatient] = useState<boolean>(false);
  const [soapNotes, setSoapNotes] = useState<SOAPNote>({
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });
  const [soapNoteId, setSoapNoteId] = useState<number | undefined>(undefined);
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showSoapNotes, setShowSoapNotes] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [activeAgent, setActiveAgent] = useState<string>("penny"); // Default to Penny (the SOAP notes agent)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "Can you tell me more about your chest pain?",
    "How long have you been experiencing these symptoms?",
    "Have you tried any medications to relieve the symptoms?",
    "Is there a family history of similar conditions?",
    "What makes the symptoms better or worse?"
  ]);
  const { toast } = useToast();

  useEffect(() => {
    // Update status text based on status
    switch (status) {
      case "recording":
        setStatusText("Recording");
        break;
      case "processing":
        setStatusText("Processing");
        break;
      case "ready":
      default:
        setStatusText("Ready");
        break;
    }
  }, [status]);

  const handleTranscriptionComplete = async (transcriptText: string) => {
    setTranscript(transcriptText);
    
    // Create a new conversation
    try {
      const userId = 1; // Default user ID (Dr. Sarah Chen)
      
      // First, create or get patient
      let patientResponse = await apiRequest("POST", "/api/patients", {
        patientId,
        name: patientName,
        visitType
      });
      const patientData = await patientResponse.json();
      
      // Then create conversation
      const conversationResponse = await apiRequest("POST", "/api/conversations", {
        patientId: patientData.id,
        userId,
        transcript: transcriptText,
        recordedAt: new Date()
      });
      
      const conversationData = await conversationResponse.json();
      setConversationId(conversationData.id);
      
      // Automatically generate SOAP notes after transcription
      handleGenerateSOAP();
    } catch (error) {
      toast({
        title: "Failed to Save Conversation",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  };

  const handleGenerateSOAP = async () => {
    if (!transcript) {
      toast({
        title: "No Transcript Available",
        description: "Please record or upload audio first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await apiRequest("POST", "/api/generate-soap-notes", {
        transcript,
        context,
        conversationId
      });
      
      const data = await response.json();
      setSoapNotes({
        subjective: data.subjective,
        objective: data.objective,
        assessment: data.assessment,
        plan: data.plan
      });
      
      if (data.id) {
        setSoapNoteId(data.id);
      }
      
      // Show notification
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
      
      // Show SOAP notes panel
      setShowSoapNotes(true);
      
      toast({
        title: "SOAP Notes Generated",
        description: "Ready for review and editing"
      });
    } catch (error) {
      toast({
        title: "Failed to Generate SOAP Notes",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewSession = () => {
    // Reset everything for a new session
    setTranscript("");
    setSoapNotes({
      subjective: "",
      objective: "",
      assessment: "",
      plan: ""
    });
    setSoapNoteId(undefined);
    setConversationId(undefined);
    setShowSoapNotes(false);
    setActiveAgent("penny"); // Reset to Penny
  };

  const handleStatusChange = (newStatus: "ready" | "recording" | "processing") => {
    setStatus(newStatus);
  };

  const handleSoapNoteSave = (notes: SOAPNote) => {
    setSoapNotes(notes);
    if (notes.id) {
      setSoapNoteId(notes.id);
    }
  };

  return (
    <div className="bg-neutral-50 h-screen flex flex-col">
      <Header statusText={statusText} statusType={status} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTool="soap" />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Main content area */}
          <div className="w-full p-4 flex flex-col overflow-auto">
            {/* Header with Patient Selection and New Session button */}
            <div className="flex justify-between items-center mb-5">
              <div className="flex-1 flex space-x-4">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="material-icons text-blue-600 text-sm mr-1">person</span>
                    <h2 className="text-lg font-bold text-neutral-800">{patientName}</h2>
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium ml-2">
                      ID: {patientId}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium ml-2">
                      {visitType}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => {
                      // Open patient selection modal or dropdown
                      const patientSelector = document.getElementById('patient-selector');
                      if (patientSelector) {
                        patientSelector.classList.toggle('hidden');
                      }
                    }}
                    className="text-xs px-3 py-1 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 shadow-sm font-medium transition-colors mr-2"
                  >
                    <span className="material-icons text-xs mr-1">search</span>
                    Change Patient
                  </button>
                  <button 
                    onClick={handleNewSession}
                    type="button"
                    className="text-sm bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 shadow-sm font-medium transition-colors">
                    <span className="material-icons text-sm mr-1">add</span>
                    New Session
                  </button>
                </div>
              </div>
            </div>
            
            {/* Hidden patient selector panel */}
            <div id="patient-selector" className="hidden mb-5 p-3 border border-neutral-200 rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-neutral-700">Select Patient</h3>
                <button 
                  onClick={() => {
                    const patientSelector = document.getElementById('patient-selector');
                    if (patientSelector) {
                      patientSelector.classList.add('hidden');
                    }
                  }}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <span className="material-icons text-sm">close</span>
                </button>
              </div>
              <div className="flex space-x-3 mb-3">
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={patientName}
                    onChange={(e) => {
                      setPatientName(e.target.value);
                      setIsNewPatient(true);
                    }}
                    className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                    placeholder="Patient Name"
                  />
                </div>
                <div>
                  <select 
                    value={visitType}
                    onChange={(e) => {
                      setVisitType(e.target.value);
                      setIsNewPatient(e.target.value === "New Patient");
                    }}
                    className="border border-neutral-200 rounded-md px-3 py-2 text-sm"
                  >
                    <option>New Patient</option>
                    <option>Follow-up</option>
                    <option>Annual Physical</option>
                    <option>Urgent Care</option>
                    <option>Specialist Consultation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Agents (hidden in component but used for functions) */}
            <div className="hidden">
              <AgentSelector soapNoteId={soapNoteId} soapNote={soapNotes} />
            </div>
            
            {/* Agent Tabs at the top of the main area */}
            <div className="flex border-b border-neutral-200 mb-4">
              {/* Summer Tab */}
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeAgent === "summer" ? 'text-blue-600 border-blue-600' : 'text-neutral-500 border-transparent'} transition-colors`}
                onClick={() => setActiveAgent("summer")}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-1 ${activeAgent === "summer" ? 'bg-blue-100' : 'bg-neutral-100'}`}>
                    <span className={`material-icons text-xs ${activeAgent === "summer" ? 'text-blue-600' : 'text-neutral-500'}`}>summarize</span>
                  </div>
                  <span>Chart Summary</span>
                </div>
              </button>
              
              {/* Penny Tab */}
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeAgent === "penny" ? 'text-primary border-primary' : 'text-neutral-500 border-transparent'} transition-colors`}
                onClick={() => setActiveAgent("penny")}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-1 ${activeAgent === "penny" ? 'bg-primary/20' : 'bg-neutral-100'}`}>
                    <span className={`material-icons text-xs ${activeAgent === "penny" ? 'text-primary' : 'text-neutral-500'}`}>psychology</span>
                  </div>
                  <span>SOAP Notes</span>
                </div>
              </button>
              
              {/* Clara Tab */}
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeAgent === "clara" ? 'text-green-600 border-green-600' : 'text-neutral-500 border-transparent'} transition-colors`}
                onClick={() => setActiveAgent("clara")}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-1 ${activeAgent === "clara" ? 'bg-green-100' : 'bg-neutral-100'}`}>
                    <span className={`material-icons text-xs ${activeAgent === "clara" ? 'text-green-600' : 'text-neutral-500'}`}>rule</span>
                  </div>
                  <span>Guidelines</span>
                </div>
              </button>
              
              {/* Bill Tab */}
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeAgent === "bill" ? 'text-purple-600 border-purple-600' : 'text-neutral-500 border-transparent'} transition-colors`}
                onClick={() => setActiveAgent("bill")}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-1 ${activeAgent === "bill" ? 'bg-purple-100' : 'bg-neutral-100'}`}>
                    <span className={`material-icons text-xs ${activeAgent === "bill" ? 'text-purple-600' : 'text-neutral-500'}`}>code</span>
                  </div>
                  <span>Coding</span>
                </div>
              </button>
            </div>
            
            {/* Summer Agent Content */}
            {activeAgent === "summer" && (
              <div className="mb-5 p-4 border border-blue-200 rounded-lg bg-blue-50/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <span className="material-icons text-blue-600 text-sm">summarize</span>
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-neutral-800">Summer - Chart Summary</h3>
                      <p className="text-xs text-neutral-600">
                        Analyzes patient history and creates summaries from electronic health records
                      </p>
                    </div>
                  </div>
                  <button 
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md font-medium flex items-center"
                    onClick={() => {
                      // Call chart summary function
                      const chartSummaryBtn = document.getElementById('chart-summary-btn');
                      chartSummaryBtn?.click();
                    }}
                  >
                    <span className="material-icons text-xs mr-1">play_arrow</span>
                    Generate Chart Summary
                  </button>
                </div>
                <div className="bg-white border border-blue-100 rounded-md p-3 h-64 overflow-auto">
                  <p className="text-sm text-neutral-600 italic">
                    {showSoapNotes ? 
                      "Chart summary will appear here..." : 
                      "Click 'Generate Chart Summary' to analyze this patient's medical history and recent visits."}
                  </p>
                </div>
              </div>
            )}
            
            {/* Penny Agent Content (SOAP Notes Agent) */}
            {activeAgent === "penny" && (
              <div className={`${showSoapNotes ? 'mb-4' : ''}`}>
                {!showSoapNotes && (
                  <>
                    {/* Context Input */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                        Context Information
                        <span className="text-sm font-normal text-neutral-500 ml-2">(Optional)</span>
                      </h3>
                      <div className="bg-white border border-neutral-200 rounded-lg p-3">
                        <textarea
                          value={context}
                          onChange={(e) => setContext(e.target.value)}
                          placeholder="Add any additional context that should be considered when generating notes..."
                          className="w-full h-24 p-2 text-sm border border-neutral-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Audio Recorder */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-neutral-800 mb-2">Audio Input</h3>
                      <AudioRecorder 
                        onTranscriptionComplete={handleTranscriptionComplete} 
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                  </>
                )}

                {/* Transcript Display with Smart Suggestions */}
                {transcript && !showSoapNotes && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-neutral-800">Transcript</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {transcript.length} characters
                        </span>
                        <button 
                          onClick={handleGenerateSOAP}
                          disabled={isGenerating || !transcript}
                          type="button"
                          className="flex items-center text-xs px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 shadow-sm font-medium transition-colors"
                        >
                          <span className="material-icons text-xs mr-1">auto_awesome</span>
                          {isGenerating ? "Processing..." : "Generate SOAP Notes"}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      {/* Transcript Panel */}
                      <div className="flex-1 bg-white border border-neutral-200 rounded-lg p-3 max-h-[350px] overflow-auto">
                        <div className="text-sm whitespace-pre-wrap">
                          {transcript}
                        </div>
                      </div>
                      
                      {/* Smart Suggestions Panel */}
                      <div className="w-60 flex-shrink-0">
                        <div className="bg-neutral-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-blue-700 flex items-center">
                              <span className="material-icons text-blue-600 text-sm mr-1">lightbulb</span>
                              Smart Suggestions
                            </h4>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Live</span>
                          </div>
                          
                          <p className="text-xs text-neutral-500 mb-3">
                            Recommended follow-up questions:
                          </p>
                          
                          <div className="space-y-2 max-h-[230px] overflow-y-auto">
                            {suggestedQuestions.map((question, index) => (
                              <div 
                                key={index}
                                className="p-2 text-xs bg-white border border-blue-100 text-neutral-700 rounded-md hover:bg-blue-50 cursor-pointer transition-colors flex items-start"
                                onClick={() => {
                                  // Copy to clipboard
                                  navigator.clipboard.writeText(question);
                                  toast({
                                    title: "Copied to clipboard",
                                    description: "Question has been copied to clipboard"
                                  });
                                }}
                              >
                                <span className="material-icons text-blue-500 text-xs mr-1 mt-0.5">help_outline</span>
                                <div className="flex-1">
                                  {question}
                                </div>
                                <button className="text-xs text-blue-600 hover:text-blue-800 p-0.5">
                                  <span className="material-icons text-xs">content_copy</span>
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <button 
                            className="w-full mt-3 text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 border border-blue-200 flex items-center justify-center"
                            onClick={() => {
                              // Refresh the suggestions
                              const newQuestions = [
                                "How does the pain compare to your previous visits?",
                                "When did you first notice changes in your symptoms?",
                                "Are there any activities that make the symptoms worse?",
                                "Have you noticed any patterns in when the symptoms occur?",
                                "Can you rate your discomfort on a scale of 1 to 10?"
                              ];
                              setSuggestedQuestions(newQuestions);
                              
                              toast({
                                title: "Suggestions updated",
                                description: "New questions based on the conversation"
                              });
                            }}
                          >
                            <span className="material-icons text-xs mr-1">refresh</span>
                            Refresh Suggestions
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SOAP Notes Generated Content - only visible after SOAP generation */}
                {showSoapNotes && (
                  <div className="p-0">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-neutral-800">SOAP Notes</h2>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            // Show format options in the NotesEditor component
                            document.getElementById('customize-notes-button')?.click();
                          }}
                          type="button"
                          className="flex items-center text-xs px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 shadow-sm font-medium transition-colors"
                        >
                          <span className="material-icons text-xs mr-1">format_list_bulleted</span>
                          Customize
                        </button>
                        <button 
                          onClick={handleGenerateSOAP}
                          disabled={isGenerating || !transcript}
                          type="button"
                          className="flex items-center text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 shadow-sm font-medium transition-colors"
                        >
                          <span className="material-icons text-xs mr-1">refresh</span>
                          Regenerate
                        </button>
                      </div>
                    </div>
                    
                    {/* Show a collapsed version of transcript when SOAP notes are visible */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-neutral-700">Transcript</h3>
                        <button 
                          onClick={() => setShowSoapNotes(false)}
                          className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800"
                        >
                          <span className="material-icons text-xs mr-1">expand_more</span>
                          Expand
                        </button>
                      </div>
                      <div className="bg-white border border-neutral-200 rounded-lg p-2 max-h-[80px] overflow-hidden">
                        <div className="text-xs whitespace-pre-wrap overflow-hidden text-ellipsis">
                          {transcript.substring(0, 150)}...
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row gap-4">
                      {/* Notes Editor - Main column */}
                      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                        <NotesEditor 
                          soapNotes={soapNotes} 
                          conversationId={conversationId}
                          isGenerating={isGenerating}
                          onSave={handleSoapNoteSave}
                        />
                      </div>
                      
                      {/* Suggested Questions - Side column */}
                      <div className="w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-neutral-700">Suggested Questions</h3>
                            <button 
                              className="text-xs text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                // Simulate refreshing suggestions
                                const newQuestions = [
                                  "Could the pain be related to recent physical activity?",
                                  "Are there any changes in diet that might be contributing?",
                                  "Have you been taking your medications as prescribed?",
                                  "Tell me about any recent stressors in your life.",
                                  "Has anyone in your family experienced similar symptoms?"
                                ];
                                setSuggestedQuestions(newQuestions);
                              }}
                            >
                              <span className="material-icons text-xs">refresh</span>
                            </button>
                          </div>
                          
                          <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {suggestedQuestions.map((question, index) => (
                              <div 
                                key={index}
                                className="p-2 text-sm bg-blue-50 text-blue-800 rounded-md hover:bg-blue-100 cursor-pointer"
                                onClick={() => {
                                  // Copy to clipboard
                                  navigator.clipboard.writeText(question);
                                  toast({
                                    title: "Copied to clipboard",
                                    description: "Question has been copied to clipboard"
                                  });
                                }}
                              >
                                {question}
                                <div className="flex justify-end mt-1">
                                  <button className="text-xs text-blue-700 hover:text-blue-900">
                                    <span className="material-icons text-xs">content_copy</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Clara Agent Content */}
            {activeAgent === "clara" && (
              <div className="mb-5 p-4 border border-green-200 rounded-lg bg-green-50/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <span className="material-icons text-green-600 text-sm">rule</span>
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-neutral-800">Clara - Clinical Guidelines</h3>
                      <p className="text-xs text-neutral-600">
                        Checks treatment plans against the latest clinical practice guidelines
                      </p>
                    </div>
                  </div>
                  <button 
                    className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-md font-medium flex items-center"
                    onClick={() => {
                      // Call guidelines check function
                      const guidelinesBtn = document.getElementById('guidelines-btn');
                      guidelinesBtn?.click();
                    }}
                  >
                    <span className="material-icons text-xs mr-1">play_arrow</span>
                    Check Guidelines
                  </button>
                </div>
                <div className="bg-white border border-green-100 rounded-md p-3 h-64 overflow-auto">
                  <p className="text-sm text-neutral-600 italic">
                    Select a completed SOAP note to check against clinical guidelines and best practices.
                  </p>
                </div>
              </div>
            )}
            
            {/* Bill Agent Content */}
            {activeAgent === "bill" && (
              <div className="mb-5 p-4 border border-purple-200 rounded-lg bg-purple-50/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                      <span className="material-icons text-purple-600 text-sm">code</span>
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-neutral-800">Bill - Medical Coding</h3>
                      <p className="text-xs text-neutral-600">
                        Suggests appropriate CPT and ICD-10 codes based on documentation
                      </p>
                    </div>
                  </div>
                  <button 
                    className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-md font-medium flex items-center"
                    onClick={() => {
                      // Call medical codes function
                      const codesBtn = document.getElementById('coding-btn');
                      codesBtn?.click();
                    }}
                  >
                    <span className="material-icons text-xs mr-1">play_arrow</span>
                    Generate Codes
                  </button>
                </div>
                <div className="bg-white border border-purple-100 rounded-md p-3 h-64 overflow-auto">
                  <p className="text-sm text-neutral-600 italic">
                    Select a completed SOAP note to generate suggested billing codes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 bg-white shadow-xl rounded-lg p-4 flex items-center animate-in fade-in slide-in-from-bottom-5 z-50">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <span className="material-icons text-green-600">check_circle</span>
          </div>
          <div>
            <div className="text-base font-semibold text-neutral-800">SOAP Notes Generated</div>
            <div className="text-sm text-neutral-600">Notes are ready for review and customization</div>
          </div>
          <button 
            onClick={() => setShowNotification(false)}
            className="ml-4 text-neutral-400 hover:text-neutral-600 p-1"
            aria-label="Close notification"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      )}
    </div>
  );
}