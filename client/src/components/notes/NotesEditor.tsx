import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import NotesToolbar from "./NotesToolbar";
import { SOAPNote } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NotesEditorProps {
  soapNotes?: SOAPNote;
  conversationId?: number;
  isGenerating?: boolean;
  onSave?: (notes: SOAPNote) => void;
}

// Note display options
export type NoteFormat = "paragraph" | "bullets";
export type NoteDetail = "detailed" | "concise";

interface SectionFormat {
  format: NoteFormat;
  detail: NoteDetail;
}

interface NotesFormat {
  subjective: SectionFormat;
  objective: SectionFormat;
  assessment: SectionFormat;
  plan: SectionFormat;
}

export default function NotesEditor({ 
  soapNotes,
  conversationId,
  isGenerating = false,
  onSave
}: NotesEditorProps) {
  const [notes, setNotes] = useState<SOAPNote>({
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });
  const [format, setFormat] = useState<NoteFormat>("paragraph");
  const [detail, setDetail] = useState<NoteDetail>("detailed");
  const [customizeMode, setCustomizeMode] = useState<boolean>(false);
  const [sectionFormats, setSectionFormats] = useState<NotesFormat>({
    subjective: { format: "paragraph", detail: "detailed" },
    objective: { format: "paragraph", detail: "detailed" },
    assessment: { format: "paragraph", detail: "detailed" },
    plan: { format: "paragraph", detail: "detailed" }
  });
  const { toast } = useToast();

  // Update local state when notes prop changes
  useEffect(() => {
    if (soapNotes) {
      setNotes(soapNotes);
    }
  }, [soapNotes]);

  const handleContentChange = (section: keyof SOAPNote, content: string) => {
    setNotes(prev => ({
      ...prev,
      [section]: content
    }));
  };

  const handleSave = async () => {
    try {
      // If we have a SOAP note ID, update it
      if (soapNotes?.id) {
        await apiRequest("PUT", `/api/soap-notes/${soapNotes.id}`, notes);
        toast({
          title: "SOAP Notes Saved",
          description: "Your notes have been successfully saved"
        });
        if (onSave) {
          onSave(notes);
        }
      } 
      // If we have a conversation ID but no SOAP note ID, create a new one
      else if (conversationId) {
        const now = new Date();
        const response = await apiRequest("POST", "/api/generate-soap-notes", {
          transcript: "",  // We're not using transcript here since we're directly saving the notes
          conversationId,
          ...notes,
          createdAt: now,
          updatedAt: now
        });
        const data = await response.json();
        toast({
          title: "SOAP Notes Saved",
          description: "Your notes have been successfully saved"
        });
        if (onSave) {
          onSave({ ...notes, id: data.id });
        }
      } else {
        toast({
          title: "Cannot Save Notes",
          description: "Missing conversation or note ID",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Save Notes",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SOAP Notes - Print</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h1 { color: #333; }
          h2 { color: #0078D4; margin-top: 20px; }
          .section { margin-bottom: 20px; }
          .medical-term { color: #0078D4; font-weight: 500; }
        </style>
      </head>
      <body>
        <h1>SOAP Notes</h1>
        <div class="section">
          <h2>Subjective</h2>
          <div>${notes.subjective.replace(/\n/g, '<br>')}</div>
        </div>
        <div class="section">
          <h2>Objective</h2>
          <div>${notes.objective.replace(/\n/g, '<br>')}</div>
        </div>
        <div class="section">
          <h2>Assessment</h2>
          <div>${notes.assessment.replace(/\n/g, '<br>')}</div>
        </div>
        <div class="section">
          <h2>Plan</h2>
          <div>${notes.plan.replace(/\n/g, '<br>')}</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="border rounded-lg bg-white flex-1 flex flex-col overflow-hidden">
      {/* Format Selection Controls */}
      <div className="p-3 bg-neutral-50 border-b">
        {!customizeMode ? (
          <div className="flex flex-wrap justify-between items-center">
            <div className="text-sm font-medium text-neutral-800">Global Format Options:</div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="format-switch"
                  checked={format === "bullets"}
                  onCheckedChange={(checked) => {
                    const newFormat = checked ? "bullets" : "paragraph";
                    setFormat(newFormat);
                    
                    // Update all section formats
                    setSectionFormats(prev => ({
                      subjective: { ...prev.subjective, format: newFormat },
                      objective: { ...prev.objective, format: newFormat },
                      assessment: { ...prev.assessment, format: newFormat },
                      plan: { ...prev.plan, format: newFormat }
                    }));
                  }}
                />
                <Label htmlFor="format-switch" className="text-sm">
                  {format === "bullets" ? "Bullets" : "Paragraphs"}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="detail-switch"
                  checked={detail === "concise"}
                  onCheckedChange={(checked) => {
                    const newDetail = checked ? "concise" : "detailed";
                    setDetail(newDetail);
                    
                    // Update all section formats
                    setSectionFormats(prev => ({
                      subjective: { ...prev.subjective, detail: newDetail },
                      objective: { ...prev.objective, detail: newDetail },
                      assessment: { ...prev.assessment, detail: newDetail },
                      plan: { ...prev.plan, detail: newDetail }
                    }));
                  }}
                />
                <Label htmlFor="detail-switch" className="text-sm">
                  {detail === "concise" ? "Concise" : "Detailed"}
                </Label>
              </div>
              
              <button
                id="customize-notes-button"
                onClick={() => setCustomizeMode(true)}
                className="text-xs px-3 py-1 bg-neutral-100 text-primary rounded hover:bg-neutral-200 transition-colors"
              >
                Customize Per Section
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-neutral-800">Section-Specific Formats:</div>
              <button
                onClick={() => setCustomizeMode(false)}
                className="text-xs px-3 py-1 bg-neutral-100 text-primary rounded hover:bg-neutral-200 transition-colors"
              >
                Use Global Format
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-sm">
              {/* Subjective Format */}
              <div className="bg-white p-2 rounded border">
                <div className="font-medium mb-1 text-primary">Subjective</div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs">Format:</span>
                  <div className="flex items-center">
                    <Switch
                      id="subject-format-switch"
                      checked={sectionFormats.subjective.format === "bullets"}
                      onCheckedChange={(checked) => {
                        setSectionFormats(prev => ({
                          ...prev,
                          subjective: { 
                            ...prev.subjective, 
                            format: checked ? "bullets" : "paragraph" 
                          }
                        }));
                      }}
                      className="scale-75"
                    />
                    <Label htmlFor="subject-format-switch" className="text-xs ml-1">
                      {sectionFormats.subjective.format === "bullets" ? "Bullets" : "Para"}
                    </Label>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Detail:</span>
                  <div className="flex items-center">
                    <Switch
                      id="subjective-detail-switch"
                      checked={sectionFormats.subjective.detail === "concise"}
                      onCheckedChange={(checked) => {
                        setSectionFormats(prev => ({
                          ...prev,
                          subjective: { 
                            ...prev.subjective, 
                            detail: checked ? "concise" : "detailed" 
                          }
                        }));
                      }}
                      className="scale-75"
                    />
                    <Label htmlFor="subjective-detail-switch" className="text-xs ml-1">
                      {sectionFormats.subjective.detail === "concise" ? "Concise" : "Detailed"}
                    </Label>
                  </div>
                </div>
              </div>
              
              {/* Objective Format */}
              <div className="bg-white p-2 rounded border">
                <div className="font-medium mb-1 text-primary">Objective</div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs">Format:</span>
                  <div className="flex items-center">
                    <Switch
                      id="objective-format-switch"
                      checked={sectionFormats.objective.format === "bullets"}
                      onCheckedChange={(checked) => {
                        setSectionFormats(prev => ({
                          ...prev,
                          objective: { 
                            ...prev.objective, 
                            format: checked ? "bullets" : "paragraph" 
                          }
                        }));
                      }}
                      className="scale-75"
                    />
                    <Label htmlFor="objective-format-switch" className="text-xs ml-1">
                      {sectionFormats.objective.format === "bullets" ? "Bullets" : "Para"}
                    </Label>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Detail:</span>
                  <div className="flex items-center">
                    <Switch
                      id="objective-detail-switch"
                      checked={sectionFormats.objective.detail === "concise"}
                      onCheckedChange={(checked) => {
                        setSectionFormats(prev => ({
                          ...prev,
                          objective: { 
                            ...prev.objective, 
                            detail: checked ? "concise" : "detailed" 
                          }
                        }));
                      }}
                      className="scale-75"
                    />
                    <Label htmlFor="objective-detail-switch" className="text-xs ml-1">
                      {sectionFormats.objective.detail === "concise" ? "Concise" : "Detailed"}
                    </Label>
                  </div>
                </div>
              </div>
              
              {/* Assessment Format */}
              <div className="bg-white p-2 rounded border">
                <div className="font-medium mb-1 text-primary">Assessment</div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs">Format:</span>
                  <div className="flex items-center">
                    <Switch
                      id="assessment-format-switch"
                      checked={sectionFormats.assessment.format === "bullets"}
                      onCheckedChange={(checked) => {
                        setSectionFormats(prev => ({
                          ...prev,
                          assessment: { 
                            ...prev.assessment, 
                            format: checked ? "bullets" : "paragraph" 
                          }
                        }));
                      }}
                      className="scale-75"
                    />
                    <Label htmlFor="assessment-format-switch" className="text-xs ml-1">
                      {sectionFormats.assessment.format === "bullets" ? "Bullets" : "Para"}
                    </Label>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Detail:</span>
                  <div className="flex items-center">
                    <Switch
                      id="assessment-detail-switch"
                      checked={sectionFormats.assessment.detail === "concise"}
                      onCheckedChange={(checked) => {
                        setSectionFormats(prev => ({
                          ...prev,
                          assessment: { 
                            ...prev.assessment, 
                            detail: checked ? "concise" : "detailed" 
                          }
                        }));
                      }}
                      className="scale-75"
                    />
                    <Label htmlFor="assessment-detail-switch" className="text-xs ml-1">
                      {sectionFormats.assessment.detail === "concise" ? "Concise" : "Detailed"}
                    </Label>
                  </div>
                </div>
              </div>
              
              {/* Plan Format */}
              <div className="bg-white p-2 rounded border">
                <div className="font-medium mb-1 text-primary">Plan</div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs">Format:</span>
                  <div className="flex items-center">
                    <Switch
                      id="plan-format-switch"
                      checked={sectionFormats.plan.format === "bullets"}
                      onCheckedChange={(checked) => {
                        setSectionFormats(prev => ({
                          ...prev,
                          plan: { 
                            ...prev.plan, 
                            format: checked ? "bullets" : "paragraph" 
                          }
                        }));
                      }}
                      className="scale-75"
                    />
                    <Label htmlFor="plan-format-switch" className="text-xs ml-1">
                      {sectionFormats.plan.format === "bullets" ? "Bullets" : "Para"}
                    </Label>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Detail:</span>
                  <div className="flex items-center">
                    <Switch
                      id="plan-detail-switch"
                      checked={sectionFormats.plan.detail === "concise"}
                      onCheckedChange={(checked) => {
                        setSectionFormats(prev => ({
                          ...prev,
                          plan: { 
                            ...prev.plan, 
                            detail: checked ? "concise" : "detailed" 
                          }
                        }));
                      }}
                      className="scale-75"
                    />
                    <Label htmlFor="plan-detail-switch" className="text-xs ml-1">
                      {sectionFormats.plan.detail === "concise" ? "Concise" : "Detailed"}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Processing Indicator */}
      {isGenerating && (
        <div className="p-2 bg-blue-50 text-primary text-sm flex items-center justify-center ai-processing">
          <span className="material-icons text-sm mr-1">psychology</span>
          AI is analyzing conversation...
        </div>
      )}
      
      {/* Continuous SOAP Notes */}
      <div className="p-4 flex-1 overflow-auto">
        <div className="space-y-6">
          {/* Subjective */}
          <div className="pb-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-primary mb-2">Subjective</h3>
            <div 
              className="prose max-w-none" 
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleContentChange("subjective", e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: notes.subjective }}
              style={{ minHeight: '100px' }}
            />
          </div>
          
          {/* Objective */}
          <div className="py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-primary mb-2">Objective</h3>
            <div 
              className="prose max-w-none" 
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleContentChange("objective", e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: notes.objective }}
              style={{ minHeight: '100px' }}
            />
          </div>
          
          {/* Assessment */}
          <div className="py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-primary mb-2">Assessment</h3>
            <div 
              className="prose max-w-none" 
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleContentChange("assessment", e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: notes.assessment }}
              style={{ minHeight: '100px' }}
            />
          </div>
          
          {/* Plan */}
          <div className="pt-4">
            <h3 className="text-lg font-semibold text-primary mb-2">Plan</h3>
            <div 
              className="prose max-w-none" 
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleContentChange("plan", e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: notes.plan }}
              style={{ minHeight: '100px' }}
            />
          </div>
        </div>
      </div>
      
      <NotesToolbar onSave={handleSave} onPrint={handlePrint} />
    </div>
  );
}
