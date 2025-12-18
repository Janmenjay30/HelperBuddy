import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Pin,
  Trash2,
  Edit3,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const noteColors = [
  { value: '#ffffff', label: 'White' },
  { value: '#fef3c7', label: 'Yellow' },
  { value: '#dbeafe', label: 'Blue' },
  { value: '#dcfce7', label: 'Green' },
  { value: '#fce7f3', label: 'Pink' },
  { value: '#f3e8ff', label: 'Purple' },
];

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    color: '#ffffff',
    tags: ''
  });

  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, [searchQuery, selectedCategory]);

  const fetchNotes = async () => {
    try {
      let url = '/notes?';
      if (searchQuery) url += `search=${searchQuery}&`;
      if (selectedCategory) url += `category=${selectedCategory}&`;
      
      const response = await api.get(url);
      setNotes(response.data);
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/notes/meta/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };

      if (editingNote) {
        await api.put(`/notes/${editingNote._id}`, data);
        toast.success('Note updated!');
      } else {
        await api.post('/notes', data);
        toast.success('Note created!');
      }
      
      setShowModal(false);
      resetForm();
      fetchNotes();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save note');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category || 'General',
      color: note.color || '#ffffff',
      tags: note.tags?.join(', ') || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Note deleted!');
      fetchNotes();
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const togglePin = async (note) => {
    try {
      await api.patch(`/notes/${note._id}/pin`);
      fetchNotes();
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const resetForm = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      category: 'General',
      color: '#ffffff',
      tags: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-500">Write and organize your thoughts</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Note
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field w-full sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note._id}
              className="card relative overflow-hidden transition-all hover:shadow-md"
              style={{ backgroundColor: note.color || '#ffffff' }}
            >
              {note.isPinned && (
                <div className="absolute top-2 right-2">
                  <Pin className="text-primary-600" size={16} fill="currentColor" />
                </div>
              )}
              
              <h3 className="font-semibold text-gray-900 pr-6">{note.title}</h3>
              <p className="text-gray-600 text-sm mt-2 line-clamp-4 whitespace-pre-wrap">
                {note.content}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="px-2 py-1 bg-gray-200/50 text-gray-600 text-xs rounded-full">
                  {note.category}
                </span>
                {note.tags?.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-200/50 text-gray-600 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50">
                <span className="text-xs text-gray-500">
                  {format(new Date(note.updatedAt), 'MMM dd, yyyy')}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePin(note)}
                    className={`p-2 rounded-lg transition-colors ${
                      note.isPinned ? 'text-primary-600 bg-primary-50' : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                  >
                    <Pin size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Edit3 size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">No notes found</h3>
          <p className="text-gray-500 mt-1">Create your first note to get started</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingNote ? 'Edit Note' : 'Create Note'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Enter note title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-field"
                  rows={6}
                  placeholder="Write your note..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    placeholder="General"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex gap-2">
                    {noteColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color.value ? 'border-primary-500 scale-110' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="input-field"
                  placeholder="idea, important, todo"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingNote ? 'Update Note' : 'Create Note'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
