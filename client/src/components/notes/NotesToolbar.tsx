interface NotesToolbarProps {
  onSave?: () => void;
  onPrint?: () => void;
}

export default function NotesToolbar({ onSave, onPrint }: NotesToolbarProps) {
  return (
    <div className="border-t border-neutral-200 p-3 flex items-center justify-between bg-white">
      {/* Text Formatting Tools */}
      <div className="flex items-center space-x-1">
        <button 
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
          title="Bold"
        >
          <span className="material-icons text-sm">format_bold</span>
        </button>
        <button 
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
          title="Italic"
        >
          <span className="material-icons text-sm">format_italic</span>
        </button>
        <div className="w-px h-5 bg-neutral-200 mx-1"></div>
        <button 
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
          title="Bullet List"
        >
          <span className="material-icons text-sm">format_list_bulleted</span>
        </button>
        <button 
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
          title="Numbered List"
        >
          <span className="material-icons text-sm">format_list_numbered</span>
        </button>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={onPrint}
          className="px-4 py-2 text-sm font-medium bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition-colors flex items-center"
          title="Print"
        >
          <span className="material-icons text-sm mr-1">print</span>
          Print
        </button>
        <button 
          onClick={onSave}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          title="Save"
        >
          <span className="material-icons text-sm mr-1">save</span>
          Save Notes
        </button>
      </div>
    </div>
  );
}
