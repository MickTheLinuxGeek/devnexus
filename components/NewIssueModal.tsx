import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

interface NewIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, body: string) => Promise<void>;
  isSubmitting: boolean;
}

const NewIssueModal: React.FC<NewIssueModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit(title, body);
    setTitle('');
    setBody('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-warp-panel border border-warp-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-warp-border bg-warp-bg/50">
          <h3 className="text-lg font-bold text-warp-textBright">Create New Issue</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-warp-bg rounded text-warp-text hover:text-warp-textBright transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-warp-text mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Fix memory leak in main loop"
              className="w-full bg-warp-bg border border-warp-border rounded-lg px-4 py-2 text-warp-textBright focus:border-warp-accent focus:outline-none transition-colors"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warp-text mb-1">Description</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="w-full h-32 bg-warp-bg border border-warp-border rounded-lg px-4 py-2 text-warp-textBright focus:border-warp-accent focus:outline-none transition-colors resize-none font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-warp-text hover:text-warp-textBright hover:bg-warp-bg rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-warp-accent hover:bg-warp-accent/90 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,188,255,0.2)]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewIssueModal;