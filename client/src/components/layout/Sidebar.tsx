import { useLocation } from "wouter";
import { format } from "date-fns";

interface SidebarProps {
  activeTool: string;
}

type ScheduledAppointment = {
  id: string;
  patientName: string;
  time: Date;
  visitType: "New patient" | "Follow up";
};

// Mock data for doctor's schedule
const todaysAppointments: ScheduledAppointment[] = [
  { 
    id: "845291", 
    patientName: "John Doe", 
    time: new Date(new Date().setHours(9, 0, 0, 0)), 
    visitType: "New patient" 
  },
  { 
    id: "845290", 
    patientName: "Emma Wilson", 
    time: new Date(new Date().setHours(10, 30, 0, 0)), 
    visitType: "Follow up" 
  },
  { 
    id: "845289", 
    patientName: "Robert Johnson", 
    time: new Date(new Date().setHours(13, 15, 0, 0)), 
    visitType: "Follow up" 
  },
  { 
    id: "845288", 
    patientName: "Maria Garcia", 
    time: new Date(new Date().setHours(14, 45, 0, 0)), 
    visitType: "New patient" 
  }
];

export default function Sidebar({ activeTool = "soap" }: SidebarProps) {
  const [location, navigate] = useLocation();

  const isActive = (tool: string) => {
    return activeTool === tool;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Get current time
  const currentTime = new Date();
  
  // Display appointments in time order
  const sortedAppointments = [...todaysAppointments].sort((a, b) => a.time.getTime() - b.time.getTime());

  return (
    <nav className="w-16 md:w-64 bg-white border-r border-neutral-100 flex flex-col overflow-y-auto">
      {/* Doctor's Schedule Section */}
      <div className="p-4">
        <h2 className="hidden md:block text-sm font-semibold text-neutral-500 mb-3">
          TODAY'S SCHEDULE
        </h2>
        <div className="hidden md:block text-xs text-neutral-600 mb-2">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </div>
        
        <div className="hidden md:flex flex-col space-y-2 mt-3">
          {sortedAppointments.map((appointment) => (
            <div 
              key={appointment.id}
              className={`p-2 rounded-md border ${currentTime > appointment.time ? 'border-neutral-200 bg-neutral-50' : 'border-primary/20 bg-primary/5'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">{appointment.patientName}</div>
                  <div className="text-xs text-neutral-500">#{appointment.id}</div>
                </div>
                <div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${appointment.visitType === "New patient" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                    {appointment.visitType}
                  </span>
                </div>
              </div>
              <div className="text-xs mt-1 flex items-center">
                <span className="material-icons text-neutral-400" style={{ fontSize: '0.875rem' }}>schedule</span>
                <span className="ml-1">{format(appointment.time, "h:mm a")}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="md:hidden flex justify-center">
          <span className="material-icons text-neutral-500">today</span>
        </div>
      </div>

      {/* Agents Section */}
      <div className="p-4 border-t border-neutral-100">
        <h2 className="hidden md:block text-sm font-semibold text-neutral-500 mb-3">AGENTS</h2>
        <ul>
          <li>
            <button 
              onClick={() => handleNavigation("/soap-notes")}
              className={`flex items-center py-2 px-3 my-1 rounded-md w-full ${isActive("soap") ? "text-primary bg-blue-50" : "text-neutral-700 hover:bg-neutral-50"}`}
            >
              <span className="material-icons mr-2">note_alt</span>
              <span className="hidden md:inline">SOAP Notes</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavigation("/chart-summary")}
              className={`flex items-center py-2 px-3 my-1 rounded-md w-full ${isActive("chart") ? "text-primary bg-blue-50" : "text-neutral-700 hover:bg-neutral-50"}`}
            >
              <span className="material-icons mr-2">summarize</span>
              <span className="hidden md:inline">Chart Summary</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavigation("/clinical-guidelines")}
              className={`flex items-center py-2 px-3 my-1 rounded-md w-full ${isActive("guidelines") ? "text-primary bg-blue-50" : "text-neutral-700 hover:bg-neutral-50"}`}
            >
              <span className="material-icons mr-2">rule</span>
              <span className="hidden md:inline">Clinical Guidelines</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavigation("/medical-codes")}
              className={`flex items-center py-2 px-3 my-1 rounded-md w-full ${isActive("codes") ? "text-primary bg-blue-50" : "text-neutral-700 hover:bg-neutral-50"}`}
            >
              <span className="material-icons mr-2">code</span>
              <span className="hidden md:inline">CPT/ICD-10 Codes</span>
            </button>
          </li>
        </ul>
      </div>
      
      {/* Recent Patients Section - mobile only as desktop shows schedule */}
      <div className="mt-4 p-4 border-t border-neutral-100 md:hidden">
        <h2 className="hidden md:block text-sm font-semibold text-neutral-500 mb-3">RECENT PATIENTS</h2>
        <div className="md:hidden flex justify-center">
          <span className="material-icons text-neutral-500">people</span>
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t border-neutral-100">
        <div className="hidden md:block text-xs text-neutral-500 mb-2">Storage: 75% used</div>
        <div className="hidden md:block h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
          <div className="bg-primary h-full" style={{ width: "75%" }}></div>
        </div>
        <div className="flex items-center justify-center md:justify-start mt-3">
          <button className="flex items-center text-sm text-neutral-700 hover:text-primary">
            <span className="material-icons text-sm mr-1">settings</span>
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
