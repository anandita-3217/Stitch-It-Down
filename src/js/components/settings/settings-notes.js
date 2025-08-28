// settings-notes.js - Notes-specific settings logic
export const FONT_FAMILIES = {
    inter: { id: 'inter', name: 'Inter', value: 'Inter, sans-serif', category: 'sans-serif' },
    arial: { id: 'arial', name: 'Arial', value: 'Arial, sans-serif', category: 'sans-serif' },
    helvetica: { id: 'helvetica', name: 'Helvetica', value: 'Helvetica, sans-serif', category: 'sans-serif' },
    times: { id: 'times', name: 'Times New Roman', value: 'Times New Roman, serif', category: 'serif' },
    georgia: { id: 'georgia', name: 'Georgia', value: 'Georgia, serif', category: 'serif' },
    courier: { id: 'courier', name: 'Courier New', value: 'Courier New, monospace', category: 'monospace' },
    consolas: { id: 'consolas', name: 'Consolas', value: 'Consolas, monospace', category: 'monospace' },
    roboto: { id: 'roboto', name: 'Roboto', value: 'Roboto, sans-serif', category: 'sans-serif' }
};

export const FONT_SIZES = {
    'extra-small': { id: 'extra-small', name: 'Extra Small', value: 10 },
    'small': { id: 'small', name: 'Small', value: 12 },
    'medium': { id: 'medium', name: 'Medium', value: 14 },
    'large': { id: 'large', name: 'Large', value: 16 },
    'extra-large': { id: 'extra-large', name: 'Extra Large', value: 18 },
    'huge': { id: 'huge', name: 'Huge', value: 24 }
};

export const EDITOR_THEMES = {
    light: { id: 'light', name: 'Light', backgroundColor: '#ffffff', textColor: '#333333' },
    dark: { id: 'dark', name: 'Dark', backgroundColor: '#1e1e1e', textColor: '#d4d4d4' },
    sepia: { id: 'sepia', name: 'Sepia', backgroundColor: '#f4f1ea', textColor: '#5c4b37' },
    high_contrast: { id: 'high_contrast', name: 'High Contrast', backgroundColor: '#000000', textColor: '#ffffff' }
};

export const AUTO_SAVE_INTERVALS = {
    'disabled': { id: 'disabled', name: 'Disabled', value: 0 },
    '10s': { id: '10s', name: '10 seconds', value: 10000 },
    '30s': { id: '30s', name: '30 seconds', value: 30000 },
    '1m': { id: '1m', name: '1 minute', value: 60000 },
    '5m': { id: '5m', name: '5 minutes', value: 300000 },
    '10m': { id: '10m', name: '10 minutes', value: 600000 }
};

export class NotesSettings {
    constructor() {
        this.currentSettings = {};
        this.eventCallbacks = new Map();
        this.notes = [];
        this.editorInstances = new Map();
        this.autoSaveTimers = new Map();
    }

    // Event system
    emit(event, data) {
        if (this.eventCallbacks.has(event)) {
            this.eventCallbacks.get(event).forEach(callback => callback(data));
        }
        console.log(`Notes settings event: ${event}`, data);
    }

    on(event, callback) {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        this.eventCallbacks.get(event).push(callback);
    }

    // Settings management
    setCurrentSettings(settings) {
        this.currentSettings = settings;
        this.applyNotesSettings();
    }

    getCurrentSettings() {
        return this.currentSettings.notes || {};
    }

    getDefaultSettings() {
        return {
            defaultFont: 'inter',
            fontSize: 14,
            lineHeight: 1.6,
            editorTheme: 'light',
            markdownEnabled: true,
            markdownPreview: true,
            spellCheck: true,
            autoSave: true,
            autoSaveInterval: '30s',
            wordWrap: true,
            showLineNumbers: false,
            enableVimMode: false,
            enableEmacs: false,
            tabSize: 4,
            insertSpaces: true,
            trimWhitespace: true,
            enableMinimap: false,
            enableBracketMatching: true,
            enableAutoClosing: true,
            enableSyntaxHighlighting: true,
            enableSearch: true,
            enableReplace: true,
            defaultNoteTemplate: '',
            enableNoteTags: true,
            enableNoteCategories: true,
            enableNoteLinking: false,
            backupEnabled: true,
            backupInterval: '1h',
            maxBackupFiles: 10,
            enableVersionHistory: true,
            maxVersions: 20,
            enableExport: true,
            defaultExportFormat: 'markdown'
        };
    }

    // Note operations
    createNote(noteData) {
        const note = {
            id: this.generateNoteId(),
            title: noteData.title || 'Untitled Note',
            content: noteData.content || '',
            plainTextContent: this.extractPlainText(noteData.content || ''),
            tags: noteData.tags || [],
            category: noteData.category || 'general',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            versions: [],
            isMarkdown: noteData.isMarkdown || this.getCurrentSettings().markdownEnabled || false,
            isFavorite: false,
            isPinned: false,
            isArchived: false,
            wordCount: this.countWords(noteData.content || ''),
            characterCount: (noteData.content || '').length,
            readingTime: this.estimateReadingTime(noteData.content || ''),
            linkedNotes: [],
            attachments: [],
            metadata: {
                font: noteData.font || this.getCurrentSettings().defaultFont,
                fontSize: noteData.fontSize || this.getCurrentSettings().fontSize,
                theme: noteData.theme || this.getCurrentSettings().editorTheme
            }
        };

        this.notes.push(note);
        this.emit('noteCreated', note);
        this.setupAutoSave(note.id);
        return note;
    }

    updateNote(noteId, updates) {
        const noteIndex = this.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) {
            this.emit('error', `Note with ID ${noteId} not found`);
            return null;
        }

        const note = this.notes[noteIndex];
        const updatedNote = {
            ...note,
            ...updates,
            updatedAt: new Date().toISOString(),
            version: note.version + 1
        };

        // Update text statistics if content changed
        if (updates.content !== undefined) {
            updatedNote.plainTextContent = this.extractPlainText(updates.content);
            updatedNote.wordCount = this.countWords(updates.content);
            updatedNote.characterCount = updates.content.length;
            updatedNote.readingTime = this.estimateReadingTime(updates.content);
        }

        // Save version history if enabled
        if (this.getCurrentSettings().enableVersionHistory) {
            this.saveVersionHistory(note);
        }

        this.notes[noteIndex] = updatedNote;
        this.emit('noteUpdated', updatedNote);
        return updatedNote;
    }

    deleteNote(noteId) {
        const noteIndex = this.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) {
            this.emit('error', `Note with ID ${noteId} not found`);
            return false;
        }

        const note = this.notes.splice(noteIndex, 1)[0];
        this.clearAutoSave(noteId);
        this.emit('noteDeleted', note);
        return true;
    }

    // Auto-save functionality
    setupAutoSave(noteId) {
        const settings = this.getCurrentSettings();
        if (!settings.autoSave) return;

        const interval = AUTO_SAVE_INTERVALS[settings.autoSaveInterval]?.value || 30000;
        if (interval === 0) return;

        this.clearAutoSave(noteId);
        
        const timer = setInterval(() => {
            this.autoSaveNote(noteId);
        }, interval);

        this.autoSaveTimers.set(noteId, timer);
    }

    clearAutoSave(noteId) {
        if (this.autoSaveTimers.has(noteId)) {
            clearInterval(this.autoSaveTimers.get(noteId));
            this.autoSaveTimers.delete(noteId);
        }
    }

    autoSaveNote(noteId) {
        const editorInstance = this.editorInstances.get(noteId);
        if (editorInstance && editorInstance.hasUnsavedChanges) {
            const content = editorInstance.getContent();
            this.updateNote(noteId, { content });
            editorInstance.hasUnsavedChanges = false;
            this.emit('noteAutoSaved', { noteId, content });
        }
    }

    // Text processing utilities
    extractPlainText(content) {
        if (!content) return '';
        
        // Remove markdown formatting
        return content
            .replace(/#{1,6}\s+/g, '') // Headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
            .replace(/\*(.*?)\*/g, '$1') // Italic
            .replace(/`(.*?)`/g, '$1') // Code
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
            .replace(/!\[.*?\]\(.*?\)/g, '') // Images
            .replace(/>\s+/g, '') // Blockquotes
            .replace(/^\s*[-*+]\s+/gm, '') // Lists
            .replace(/^\s*\d+\.\s+/gm, '') // Numbered lists
            .trim();
    }

    countWords(content) {
        if (!content) return 0;
        const plainText = this.extractPlainText(content);
        return plainText.split(/\s+/).filter(word => word.length > 0).length;
    }

    estimateReadingTime(content, wordsPerMinute = 200) {
        const wordCount = this.countWords(content);
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return Math.max(1, minutes);
    }

    // Version history
    saveVersionHistory(note) {
        const settings = this.getCurrentSettings();
        if (!settings.enableVersionHistory) return;

        const maxVersions = settings.maxVersions || 20;
        
        if (!note.versions) note.versions = [];
        
        const version = {
            id: `${note.id}_v${note.version}`,
            content: note.content,
            createdAt: note.updatedAt,
            version: note.version
        };

        note.versions.unshift(version);
        
        // Limit version history
        if (note.versions.length > maxVersions) {
            note.versions = note.versions.slice(0, maxVersions);
        }

        this.emit('versionSaved', { note, version });
    }

    restoreVersion(noteId, versionId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) {
            this.emit('error', `Note with ID ${noteId} not found`);
            return null;
        }

        const version = note.versions.find(v => v.id === versionId);
        if (!version) {
            this.emit('error', `Version with ID ${versionId} not found`);
            return null;
        }

        const restoredNote = this.updateNote(noteId, {
            content: version.content,
            title: note.title + ' (Restored)'
        });

        this.emit('versionRestored', { note: restoredNote, version });
        return restoredNote;
    }

    // Search and filtering
    searchNotes(query, options = {}) {
        if (!query || query.trim().length === 0) {
            return this.notes;
        }

        const searchTerm = query.toLowerCase().trim();
        const searchOptions = {
            includeContent: options.includeContent !== false,
            includeTitle: options.includeTitle !== false,
            includeTags: options.includeTags !== false,
            caseSensitive: options.caseSensitive || false,
            wholeWord: options.wholeWord || false,
            useRegex: options.useRegex || false
        };

        return this.notes.filter(note => {
            if (note.isArchived && !options.includeArchived) return false;

            const title = searchOptions.caseSensitive ? note.title : note.title.toLowerCase();
            const content = searchOptions.caseSensitive ? note.plainTextContent : note.plainTextContent.toLowerCase();
            const tags = note.tags.map(tag => searchOptions.caseSensitive ? tag : tag.toLowerCase());

            let matches = false;

            if (searchOptions.useRegex) {
                try {
                    const regex = new RegExp(query, searchOptions.caseSensitive ? 'g' : 'gi');
                    if (searchOptions.includeTitle && regex.test(title)) matches = true;
                    if (searchOptions.includeContent && regex.test(content)) matches = true;
                    if (searchOptions.includeTags && tags.some(tag => regex.test(tag))) matches = true;
                } catch (e) {
                    // Fallback to simple search if regex is invalid
                    matches = this.simpleSearch(note, searchTerm, searchOptions);
                }
            } else {
                matches = this.simpleSearch(note, searchTerm, searchOptions);
            }

            return matches;
        });
    }

    simpleSearch(note, searchTerm, options) {
        const title = options.caseSensitive ? note.title : note.title.toLowerCase();
        const content = options.caseSensitive ? note.plainTextContent : note.plainTextContent.toLowerCase();
        const tags = note.tags.map(tag => options.caseSensitive ? tag : tag.toLowerCase());

        if (options.wholeWord) {
            const wordRegex = new RegExp(`\\b${searchTerm}\\b`, options.caseSensitive ? 'g' : 'gi');
            if (options.includeTitle && wordRegex.test(title)) return true;
            if (options.includeContent && wordRegex.test(content)) return true;
            if (options.includeTags && tags.some(tag => wordRegex.test(tag))) return true;
        } else {
            if (options.includeTitle && title.includes(searchTerm)) return true;
            if (options.includeContent && content.includes(searchTerm)) return true;
            if (options.includeTags && tags.some(tag => tag.includes(searchTerm))) return true;
        }

        return false;
    }

    getNotesStatistics(notes = this.notes) {
        const stats = {
            total: notes.length,
            archived: notes.filter(n => n.isArchived).length,
            favorites: notes.filter(n => n.isFavorite).length,
            pinned: notes.filter(n => n.isPinned).length,
            totalWords: 0,
            totalCharacters: 0,
            averageReadingTime: 0,
            byCategory: {},
            byTag: {},
            recentlyModified: 0
        };

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        notes.forEach(note => {
            stats.totalWords += note.wordCount || 0;
            stats.totalCharacters += note.characterCount || 0;

            // Category stats
            const category = note.category || 'uncategorized';
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

            // Tag stats
            note.tags.forEach(tag => {
                stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
            });

            // Recently modified
            if (new Date(note.updatedAt) > oneWeekAgo) {
                stats.recentlyModified++;
            }
        });

        if (notes.length > 0) {
            const totalReadingTime = notes.reduce((sum, note) => sum + (note.readingTime || 0), 0);
            stats.averageReadingTime = Math.round(totalReadingTime / notes.length);
        }

        return stats;
    }

    // Settings validation
    validateNotesSettings(settings) {
        const errors = [];

        if (settings.fontSize !== undefined) {
            if (typeof settings.fontSize !== 'number' || settings.fontSize < 8 || settings.fontSize > 72) {
                errors.push('Font size must be between 8 and 72');
            }
        }

        if (settings.lineHeight !== undefined) {
            if (typeof settings.lineHeight !== 'number' || settings.lineHeight < 0.8 || settings.lineHeight > 3) {
                errors.push('Line height must be between 0.8 and 3');
            }
        }

        if (settings.tabSize !== undefined) {
            if (typeof settings.tabSize !== 'number' || settings.tabSize < 1 || settings.tabSize > 8) {
                errors.push('Tab size must be between 1 and 8');
            }
        }

        if (settings.maxVersions !== undefined) {
            if (typeof settings.maxVersions !== 'number' || settings.maxVersions < 1 || settings.maxVersions > 100) {
                errors.push('Max versions must be between 1 and 100');
            }
        }

        if (settings.maxBackupFiles !== undefined) {
            if (typeof settings.maxBackupFiles !== 'number' || settings.maxBackupFiles < 1 || settings.maxBackupFiles > 50) {
                errors.push('Max backup files must be between 1 and 50');
            }
        }

        if (settings.defaultFont && !FONT_FAMILIES[settings.defaultFont]) {
            errors.push('Invalid default font');
        }

        if (settings.editorTheme && !EDITOR_THEMES[settings.editorTheme]) {
            errors.push('Invalid editor theme');
        }

        if (settings.autoSaveInterval && !AUTO_SAVE_INTERVALS[settings.autoSaveInterval]) {
            errors.push('Invalid auto-save interval');
        }

        return errors;
    }

    // Apply settings
    applyNotesSettings() {
        const settings = this.getCurrentSettings();
        
        // Update auto-save for all notes
        this.notes.forEach(note => {
            if (settings.autoSave) {
                this.setupAutoSave(note.id);
            } else {
                this.clearAutoSave(note.id);
            }
        });

        // Apply font settings globally
        if (typeof document !== 'undefined') {
            this.applyGlobalEditorStyles(settings);
        }

        this.emit('settingsApplied', settings);
    }

    applyGlobalEditorStyles(settings) {
        const fontFamily = FONT_FAMILIES[settings.defaultFont]?.value || 'Inter, sans-serif';
        const fontSize = settings.fontSize || 14;
        const lineHeight = settings.lineHeight || 1.6;
        const theme = EDITOR_THEMES[settings.editorTheme] || EDITOR_THEMES.light;

        // Create or update global styles
        let styleElement = document.getElementById('notes-global-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'notes-global-styles';
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
            .note-editor {
                font-family: ${fontFamily} !important;
                font-size: ${fontSize}px !important;
                line-height: ${lineHeight} !important;
                background-color: ${theme.backgroundColor} !important;
                color: ${theme.textColor} !important;
            }
            
            .note-editor .line-numbers {
                display: ${settings.showLineNumbers ? 'block' : 'none'} !important;
            }
            
            .note-editor .minimap {
                display: ${settings.enableMinimap ? 'block' : 'none'} !important;
            }
            
            .note-editor textarea,
            .note-editor .editor-content {
                tab-size: ${settings.tabSize || 4} !important;
                white-space: ${settings.wordWrap ? 'pre-wrap' : 'pre'} !important;
                spellcheck: ${settings.spellCheck ? 'true' : 'false'} !important;
            }
        `;
    }

    // Editor instance management
    registerEditorInstance(noteId, editorInstance) {
        this.editorInstances.set(noteId, editorInstance);
        
        // Apply current settings to the editor
        const settings = this.getCurrentSettings();
        if (editorInstance.applySettings) {
            editorInstance.applySettings(settings);
        }
    }

    unregisterEditorInstance(noteId) {
        this.clearAutoSave(noteId);
        this.editorInstances.delete(noteId);
    }

    // Export and import
    exportNote(noteId, format = 'markdown') {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) {
            this.emit('error', `Note with ID ${noteId} not found`);
            return null;
        }

        const exportData = {
            note,
            format,
            exportedAt: new Date().toISOString()
        };

        this.emit('noteExported', exportData);
        return exportData;
    }

    exportAllNotes(format = 'json') {
        const exportData = {
            notes: this.notes,
            settings: this.getCurrentSettings(),
            format,
            exportedAt: new Date().toISOString()
        };

        this.emit('notesExported', exportData);
        return exportData;
    }

    importNotes(data) {
        if (data.notes) {
            data.notes.forEach(noteData => {
                // Generate new ID to avoid conflicts
                const newNote = {
                    ...noteData,
                    id: this.generateNoteId(),
                    importedAt: new Date().toISOString()
                };
                this.notes.push(newNote);
            });
            
            this.emit('notesImported', data);
        }

        if (data.settings) {
            this.currentSettings.notes = { ...this.currentSettings.notes, ...data.settings };
            this.emit('settingsImported', data.settings);
        }
    }

    // Note linking
    linkNotes(sourceNoteId, targetNoteId) {
        const sourceNote = this.notes.find(n => n.id === sourceNoteId);
        const targetNote = this.notes.find(n => n.id === targetNoteId);

        if (!sourceNote || !targetNote) {
            this.emit('error', 'One or both notes not found for linking');
            return false;
        }

        if (!sourceNote.linkedNotes.includes(targetNoteId)) {
            sourceNote.linkedNotes.push(targetNoteId);
        }

        if (!targetNote.linkedNotes.includes(sourceNoteId)) {
            targetNote.linkedNotes.push(sourceNoteId);
        }

        this.emit('notesLinked', { sourceNote, targetNote });
        return true;
    }

    unlinkNotes(sourceNoteId, targetNoteId) {
        const sourceNote = this.notes.find(n => n.id === sourceNoteId);
        const targetNote = this.notes.find(n => n.id === targetNoteId);

        if (!sourceNote || !targetNote) {
            this.emit('error', 'One or both notes not found for unlinking');
            return false;
        }

        sourceNote.linkedNotes = sourceNote.linkedNotes.filter(id => id !== targetNoteId);
        targetNote.linkedNotes = targetNote.linkedNotes.filter(id => id !== sourceNoteId);

        this.emit('notesUnlinked', { sourceNote, targetNote });
        return true;
    }

    // Utility methods
    generateNoteId() {
        return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    resetSettings() {
        const defaultSettings = this.getDefaultSettings();
        this.currentSettings.notes = defaultSettings;
        this.applyNotesSettings();
        this.emit('settingsReset', defaultSettings);
        return defaultSettings;
    }

    // Cleanup
    cleanup() {
        // Clear all auto-save timers
        this.autoSaveTimers.forEach((timer, noteId) => {
            clearInterval(timer);
        });
        this.autoSaveTimers.clear();

        // Unregister all editor instances
        this.editorInstances.clear();

        this.emit('cleanup');
    }
}