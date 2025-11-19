import React, { useState } from 'react';
import { ResearchNote } from '../types';
import { Plus, Bot, Trash2, Hash } from 'lucide-react';
import { generateResearchIdeas } from '../services/geminiService';

interface ResearchNotesProps {
  notes: ResearchNote[];
  setNotes: React.Dispatch<React.SetStateAction<ResearchNote[]>>;
}

const ResearchNotes: React.FC<ResearchNotesProps> = ({ notes, setNotes }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeNote = notes.find(n => n.id === selectedNoteId);

  const createNote = () => {
    const newNote: ResearchNote = {
      id: crypto.randomUUID(),
      title: 'Untitled Research',
      content: '# New Research Topic\n\nStart typing...',
      tags: ['draft'],
      created_at: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const updateNote = (id: string, updates: Partial<ResearchNote>) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const handleAIAssist = async () => {
    if (!activeNote) return;
    setIsGenerating(true);
    
    // Extract topic from title or first line
    const topic = activeNote.title === 'Untitled Research' 
      ? activeNote.content.split('\n')[0].replace('#', '').trim() 
      : activeNote.title;

    const ideas = await generateResearchIdeas(topic);
    
    const appendContent = `\n\n## AI Generated Research Avenues\n${ideas.map(idea => `- [ ] ${idea}`).join('\n')}`;
    
    updateNote(activeNote.id, {
      content: activeNote.content + appendContent,
      tags: [...activeNote.tags, 'ai-enhanced']
    });
    setIsGenerating(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-6 overflow-hidden">
      {/* List */}
      <div className="w-1/3 flex flex-col bg-warp-panel border border-warp-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-warp-border flex justify-between items-center">
          <h2 className="font-semibold text-warp-textBright">Notebooks</h2>
          <button onClick={createNote} className="p-2 bg-warp-accent/10 text-warp-accent rounded-lg hover:bg-warp-accent/20 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {notes.map(note => (
            <button
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
              className={`w-full text-left p-3 rounded-lg transition-all border ${
                selectedNoteId === note.id 
                ? 'bg-warp-bg border-warp-accent/50 shadow-inner' 
                : 'bg-transparent border-transparent hover:bg-warp-bg/50'
              }`}
            >
              <h3 className={`font-medium truncate ${selectedNoteId === note.id ? 'text-warp-accent' : 'text-warp-textBright'}`}>
                {note.title}
              </h3>
              <p className="text-xs text-warp-text mt-1 truncate opacity-70">{new Date(note.created_at).toLocaleDateString()}</p>
              <div className="flex gap-1 mt-2">
                {note.tags.slice(0, 2).map(t => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-warp-border/50 text-warp-text">{t}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-warp-panel border border-warp-border rounded-xl overflow-hidden flex flex-col">
        {activeNote ? (
          <>
            <div className="p-4 border-b border-warp-border flex justify-between items-center bg-warp-bg/30">
              <input 
                type="text" 
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                className="bg-transparent text-lg font-bold text-warp-textBright focus:outline-none w-full"
                placeholder="Note Title"
              />
              <div className="flex gap-2">
                 <button 
                  onClick={handleAIAssist}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors text-sm"
                >
                  <Bot className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
                  {isGenerating ? 'Thinking...' : 'Expand with AI'}
                </button>
                <button 
                  onClick={() => deleteNote(activeNote.id)}
                  className="p-2 text-warp-danger hover:bg-warp-danger/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              <textarea 
                value={activeNote.content}
                onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                className="w-full h-full bg-warp-panel p-6 text-warp-text font-mono text-sm resize-none focus:outline-none leading-relaxed"
                placeholder="Start writing your research notes here..."
                spellCheck={false}
              />
              {/* Floating Tags Bar */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-warp-bg border border-warp-border rounded-full shadow-lg">
                  <Hash className="w-3 h-3 text-warp-text" />
                  <input 
                    type="text" 
                    placeholder="Add tag..." 
                    className="bg-transparent text-xs text-warp-text focus:outline-none w-20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.currentTarget.value.trim();
                        if (val && !activeNote.tags.includes(val)) {
                          updateNote(activeNote.id, { tags: [...activeNote.tags, val] });
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-warp-text opacity-50">
            <Bot className="w-16 h-16 mb-4" />
            <p>Select or create a note to begin research.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchNotes;