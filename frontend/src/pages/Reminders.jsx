import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Bell,
  Mail,
  MessageSquare,
  Trash2,
  Edit3,
  X,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    reminderType: 'email',
    scheduledTime: '',
    isRecurring: false,
    recurringPattern: '',
    recipientEmail: '',
    recipientPhone: ''
  });

  useEffect(() => {
    fetchReminders();
  }, [filterStatus, filterType]);

  const fetchReminders = async () => {
    try {
      let url = '/reminders?';
      if (filterStatus) url += `status=${filterStatus}&`;
      if (filterType) url += `type=${filterType}&`;
      
      const response = await api.get(url);
      setReminders(response.data);
    } catch (error) {
      toast.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = { ...formData };
      
      // Keep time as IST - no conversion needed
      // The datetime-local input gives us local time, send it as-is
      
      if (!data.isRecurring) {
        data.recurringPattern = null;
      }

      if (editingReminder) {
        await api.put(`/reminders/${editingReminder._id}`, data);
        toast.success('Reminder updated!');
      } else {
        await api.post('/reminders', data);
        toast.success('Reminder created!');
      }
      
      setShowModal(false);
      resetForm();
      fetchReminders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save reminder');
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    // Time is already in IST, just format for datetime-local input
    const localISOTime = reminder.scheduledTime.slice(0, 16);
    
    setFormData({
      title: reminder.title,
      message: reminder.message,
      reminderType: reminder.reminderType,
      scheduledTime: localISOTime,
      isRecurring: reminder.isRecurring,
      recurringPattern: reminder.recurringPattern || '',
      recipientEmail: reminder.recipientEmail || '',
      recipientPhone: reminder.recipientPhone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    
    try {
      await api.delete(`/reminders/${id}`);
      toast.success('Reminder deleted!');
      fetchReminders();
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  const resetForm = () => {
    setEditingReminder(null);
    setFormData({
      title: '',
      message: '',
      reminderType: 'email',
      scheduledTime: '',
      isRecurring: false,
      recurringPattern: '',
      recipientEmail: '',
      recipientPhone: ''
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return <Mail size={18} className="text-blue-500" />;
      case 'sms': return <MessageSquare size={18} className="text-green-500" />;
      case 'both': return <Bell size={18} className="text-purple-500" />;
      default: return <Bell size={18} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'sent':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            <CheckCircle size={12} />
            Sent
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
            <AlertCircle size={12} />
            Failed
          </span>
        );
      default:
        return null;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
          <p className="text-gray-500">Schedule email and SMS reminders</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Reminder
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-full sm:w-40"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field w-full sm:w-40"
          >
            <option value="">All Types</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      {/* Reminders List */}
      {reminders.length > 0 ? (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder._id}
              className="card transition-all hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(reminder.reminderType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                      <p className="text-gray-500 text-sm mt-1 break-words">{reminder.message}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(reminder.status)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="flex-shrink-0" />
                      <span className="truncate">
                        {new Date(reminder.scheduledTime).toLocaleString('en-IN', { 
                          timeZone: 'Asia/Kolkata',
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })} IST
                      </span>
                    </span>
                    
                    {reminder.isRecurring && (
                      <span className="flex items-center gap-1 text-primary-600">
                        <RefreshCw size={14} className="flex-shrink-0" />
                        {reminder.recurringPattern}
                      </span>
                    )}
                    
                    {reminder.reminderType === 'email' || reminder.reminderType === 'both' ? (
                      <span className="flex items-center gap-1 min-w-0">
                        <Mail size={14} className="flex-shrink-0" />
                        <span className="truncate text-xs sm:text-sm">{reminder.recipientEmail}</span>
                      </span>
                    ) : null}
                    
                    {reminder.reminderType === 'sms' || reminder.reminderType === 'both' ? (
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{reminder.recipientPhone}</span>
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:gap-1 sm:flex-col lg:flex-row">
                  {reminder.status === 'pending' && (
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="flex-1 sm:flex-none p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(reminder._id)}
                    className="flex-1 sm:flex-none p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Bell size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">No reminders found</h3>
          <p className="text-gray-500 mt-1">Create your first reminder to get started</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingReminder ? 'Edit Reminder' : 'Create Reminder'}
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
                  placeholder="Enter reminder title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Reminder message..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={formData.reminderType}
                    onChange={(e) => setFormData({ ...formData, reminderType: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {(formData.reminderType === 'email' || formData.reminderType === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email (leave empty to use your email)
                  </label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                    className="input-field"
                    placeholder="recipient@email.com"
                  />
                </div>
              )}

              {(formData.reminderType === 'sms' || formData.reminderType === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Phone (leave empty to use your phone)
                  </label>
                  <input
                    type="tel"
                    value={formData.recipientPhone}
                    onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                    className="input-field"
                    placeholder="+1234567890"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                  Recurring reminder
                </label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repeat Pattern</label>
                  <select
                    value={formData.recurringPattern}
                    onChange={(e) => setFormData({ ...formData, recurringPattern: e.target.value })}
                    className="input-field"
                    required={formData.isRecurring}
                  >
                    <option value="">Select pattern</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1 w-full sm:w-auto">
                  {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="btn-secondary flex-1 w-full sm:w-auto"
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

export default Reminders;
