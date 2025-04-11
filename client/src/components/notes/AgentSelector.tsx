import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SOAPNote } from "@/types";

interface AgentSelectorProps {
  soapNoteId?: number;
  soapNote?: SOAPNote;
}

export default function AgentSelector({ soapNoteId, soapNote }: AgentSelectorProps) {
  const [isLoading, setIsLoading] = useState({
    chart: false,
    guidelines: false,
    codes: false
  });
  const { toast } = useToast();

  const generateChartSummary = async () => {
    if (!soapNoteId || !soapNote) {
      toast({
        title: "Missing Data",
        description: "Please generate SOAP notes first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, chart: true }));
    
    try {
      const response = await apiRequest("POST", "/api/generate-chart-summary", {
        soapNoteId,
        ...soapNote
      });
      
      const result = await response.json();
      
      toast({
        title: "Chart Summary Generated",
        description: "The chart summary has been generated successfully"
      });
      
      // Show results in a modal dialog
      const dialogContent = document.createElement('div');
      dialogContent.innerHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" id="modalBackdrop">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto overflow-auto max-h-[80vh]">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-blue-800">Chart Summary</h2>
                <button id="closeModalBtn" class="p-2 rounded-full hover:bg-neutral-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div class="prose prose-blue max-w-none">
                ${result.content.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(dialogContent);
      
      // Add event listener to close button
      const closeButton = document.getElementById('closeModalBtn');
      const modalBackdrop = document.getElementById('modalBackdrop');
      
      const closeModal = () => {
        document.body.removeChild(dialogContent);
      };
      
      closeButton?.addEventListener('click', closeModal);
      modalBackdrop?.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    } catch (error) {
      toast({
        title: "Failed to Generate Chart Summary",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, chart: false }));
    }
  };

  const checkClinicalGuidelines = async () => {
    if (!soapNoteId || !soapNote) {
      toast({
        title: "Missing Data",
        description: "Please generate SOAP notes first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, guidelines: true }));
    
    try {
      const response = await apiRequest("POST", "/api/check-clinical-guidelines", {
        soapNoteId,
        ...soapNote
      });
      
      const result = await response.json();
      
      toast({
        title: "Guidelines Check Complete",
        description: "The clinical guidelines check has been completed"
      });
      
      // Show guidelines check results in a modal dialog
      const dialogContent = document.createElement('div');
      dialogContent.innerHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" id="guidelinesBackdrop">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto overflow-auto max-h-[80vh]">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-green-800">Clinical Guidelines Assessment</h2>
                <button id="closeGuidelinesBtn" class="p-2 rounded-full hover:bg-neutral-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div class="prose prose-green max-w-none">
                ${result.content.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(dialogContent);
      
      // Add event listener to close button
      const closeButton = document.getElementById('closeGuidelinesBtn');
      const modalBackdrop = document.getElementById('guidelinesBackdrop');
      
      const closeModal = () => {
        document.body.removeChild(dialogContent);
      };
      
      closeButton?.addEventListener('click', closeModal);
      modalBackdrop?.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    } catch (error) {
      toast({
        title: "Failed to Check Clinical Guidelines",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, guidelines: false }));
    }
  };

  const generateMedicalCodes = async () => {
    if (!soapNoteId || !soapNote) {
      toast({
        title: "Missing Data",
        description: "Please generate SOAP notes first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, codes: true }));
    
    try {
      const response = await apiRequest("POST", "/api/generate-medical-codes", {
        soapNoteId,
        ...soapNote
      });
      
      const result = await response.json();
      
      toast({
        title: "Medical Codes Generated",
        description: "The CPT/ICD-10 codes have been generated successfully"
      });
      
      // Show medical codes in a modal dialog
      const dialogContent = document.createElement('div');
      dialogContent.innerHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" id="codesBackdrop">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto overflow-auto max-h-[80vh]">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-purple-800">Medical Coding</h2>
                <button id="closeCodesBtn" class="p-2 rounded-full hover:bg-neutral-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div class="prose prose-purple max-w-none">
                ${result.content.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(dialogContent);
      
      // Add event listener to close button
      const closeButton = document.getElementById('closeCodesBtn');
      const modalBackdrop = document.getElementById('codesBackdrop');
      
      const closeModal = () => {
        document.body.removeChild(dialogContent);
      };
      
      closeButton?.addEventListener('click', closeModal);
      modalBackdrop?.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    } catch (error) {
      toast({
        title: "Failed to Generate Medical Codes",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, codes: false }));
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-800 mb-3">AI Assistant Agents</h3>
      <p className="text-sm text-neutral-600 mb-4">
        Select an AI assistant to help with additional documentation tasks
      </p>
      <div className="space-y-4">
        {/* Summer - Chart Summary Agent */}
        <div className="p-4 border rounded-md bg-white hover:bg-blue-50 transition-colors">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <span className="material-icons text-blue-600">{isLoading.chart ? "pending" : "summarize"}</span>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-800">Summer</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">{isLoading.chart ? "Processing..." : "Summarization Agent"}</p>
                </div>
              </div>
              <p className="text-sm mt-2 text-neutral-600">Pulls data from the EHR and creates a concise chart summary before the visit</p>
              <button 
                id="chart-summary-btn"
                onClick={generateChartSummary}
                disabled={isLoading.chart}
                type="button"
                className="mt-3 text-sm px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
              >
                {isLoading.chart ? "Generating..." : "Generate Summary"}
              </button>
            </div>
          </div>
        </div>

        {/* Penny - Primary Scribe Agent */}
        <div className="p-4 border rounded-md bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <span className="material-icons text-primary">psychology</span>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-primary">Penny</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">Primary Scribe Agent</p>
                </div>
              </div>
              <p className="text-sm mt-2 text-neutral-600">Listens to the doctor-patient conversation and generates SOAP notes</p>
              <div className="mt-3 px-2 py-1.5 bg-primary/10 text-primary rounded-md text-sm">
                <span className="material-icons text-xs align-text-bottom mr-1">check_circle</span> 
                {soapNoteId ? "SOAP notes generated successfully" : "Ready to process conversation"}
              </div>
            </div>
          </div>
        </div>

        {/* Clara - Guidelines Agent */}
        <div className="p-4 border rounded-md bg-white hover:bg-green-50 transition-colors">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <span className="material-icons text-green-600">{isLoading.guidelines ? "pending" : "rule"}</span>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-800">Clara</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">{isLoading.guidelines ? "Processing..." : "Guidelines Agent"}</p>
                </div>
              </div>
              <p className="text-sm mt-2 text-neutral-600">Verifies clinical guidelines and suggests best practices</p>
              <button 
                id="guidelines-btn"
                onClick={checkClinicalGuidelines}
                disabled={isLoading.guidelines || !soapNoteId}
                type="button"
                className="mt-3 text-sm px-4 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isLoading.guidelines ? "Checking..." : "Check Guidelines"}
              </button>
            </div>
          </div>
        </div>

        {/* Bill - Coding Agent */}
        <div className="p-4 border rounded-md bg-white hover:bg-purple-50 transition-colors">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <span className="material-icons text-purple-600">{isLoading.codes ? "pending" : "code"}</span>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-purple-800">Bill</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">{isLoading.codes ? "Processing..." : "Billing Agent"}</p>
                </div>
              </div>
              <p className="text-sm mt-2 text-neutral-600">Generates appropriate CPT and ICD-10 codes for billing</p>
              <button 
                id="coding-btn"
                onClick={generateMedicalCodes}
                disabled={isLoading.codes || !soapNoteId}
                type="button"
                className="mt-3 text-sm px-4 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isLoading.codes ? "Generating..." : "Generate Codes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
