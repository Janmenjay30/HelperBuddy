import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  CheckSquare, 
  FileText, 
  Bell, 
  Plus,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    tasks: { total: 0, pending: 0, completed: 0 },
    notes: { total: 0 },
    reminders: { total: 0, pending: 0 }
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, notesRes, remindersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/notes'),
        api.get('/reminders?status=pending')
      ]);

      const tasks = tasksRes.data;
      const notes = notesRes.data;
      const reminders = remindersRes.data;

      setStats({
        tasks: {
          total: tasks.length,
          pending: tasks.filter(t => t.status === 'pending').length,
          completed: tasks.filter(t => t.status === 'completed').length
        },
        notes: { total: notes.length },
        reminders: {
          total: reminders.length,
          pending: reminders.filter(r => r.status === 'pending').length
        }
      });

      setRecentTasks(tasks.slice(0, 5));
      setUpcomingReminders(reminders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-2">Here's what's happening today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.tasks.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="text-primary-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="text-yellow-600">{stats.tasks.pending} pending</span>
            <span className="text-green-600">{stats.tasks.completed} completed</span>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Notes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.notes.total}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Reminders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.reminders.pending}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Bell className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <Link to="/tasks" className="card hover:shadow-md transition-shadow bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Quick Add</p>
              <p className="text-xl font-semibold mt-1">Create New Task</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus className="text-white" size={24} />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            <Link to="/tasks" className="text-primary-600 text-sm hover:underline">View All</Link>
          </div>
          {recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Clock size={14} />
                        {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckSquare size={40} className="mx-auto mb-2 opacity-50" />
              <p>No tasks yet. Create your first task!</p>
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Reminders</h2>
            <Link to="/reminders" className="text-primary-600 text-sm hover:underline">View All</Link>
          </div>
          {upcomingReminders.length > 0 ? (
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <div key={reminder._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{reminder.title}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Clock size={14} />
                      {format(new Date(reminder.scheduledTime), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reminder.reminderType === 'email' ? 'bg-blue-100 text-blue-700' :
                    reminder.reminderType === 'sms' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {reminder.reminderType}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell size={40} className="mx-auto mb-2 opacity-50" />
              <p>No upcoming reminders</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
