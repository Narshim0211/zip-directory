import React, { useEffect, useState } from 'react';
import ownerTimeApi from '../../../../api/ownerTimeApi';
import TaskCard from '../../../../shared/components/time/TaskCard';
import GoalCard from '../../../../shared/components/time/GoalCard';
import TaskForm from '../../../../shared/components/time/TaskForm';
import GoalForm from '../../../../shared/components/time/GoalForm';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import './OwnerOperationsDashboard.css';

const OwnerOperationsDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksData, goalsData] = await Promise.all([
        ownerTimeApi.getTasks({}),
        ownerTimeApi.getGoals({}),
      ]);
      setTasks(Array.isArray(tasksData) ? tasksData : tasksData?.tasks || []);
      setGoals(Array.isArray(goalsData) ? goalsData : goalsData?.goals || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load data');
      setTasks([]);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (formData) => {
    try {
      const newTask = await ownerTimeApi.createTask(formData);
      setTasks(prev => [newTask, ...prev]);
      setShowTaskForm(false);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (formData) => {
    try {
      const updated = await ownerTimeApi.updateTask(editingTask._id, formData);
      setTasks(prev => prev.map(t => t._id === editingTask._id ? updated : t));
      setEditingTask(null);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    
    try {
      await ownerTimeApi.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleCreateGoal = async (formData) => {
    try {
      const newGoal = await ownerTimeApi.createGoal(formData);
      setGoals(prev => [newGoal, ...prev]);
      setShowGoalForm(false);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create goal');
    }
  };

  const handleUpdateGoal = async (formData) => {
    try {
      const updated = await ownerTimeApi.updateGoal(editingGoal._id, formData);
      setGoals(prev => prev.map(g => g._id === editingGoal._id ? updated : g));
      setEditingGoal(null);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update goal');
    }
  };

  return (
    <div className="owner-operations-dashboard">
      <div className="dashboard-header">
        <h2>Operations Dashboard</h2>
        <div className="header-actions">
          <button
            onClick={() => setShowTaskForm(true)}
            className="btn-primary"
            disabled={showTaskForm || editingTask}
          >
            + New Task
          </button>
          <button
            onClick={() => setShowGoalForm(true)}
            className="btn-primary"
            disabled={showGoalForm || editingGoal}
          >
            + New Goal
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks ({tasks.length})
        </button>
        <button
          className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          Goals ({goals.length})
        </button>
      </div>

      {(showTaskForm || editingTask) && (
        <div className="form-modal">
          <TaskForm
            initialData={editingTask || {}}
            mode={editingTask ? 'edit' : 'create'}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
          />
        </div>
      )}

      {(showGoalForm || editingGoal) && (
        <div className="form-modal">
          <GoalForm
            initialData={editingGoal || {}}
            mode={editingGoal ? 'edit' : 'create'}
            onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
            onCancel={() => {
              setShowGoalForm(false);
              setEditingGoal(null);
            }}
          />
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading dashboard data..." />
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      ) : (
        <>
          {activeTab === 'tasks' && (
            <section className="dashboard-section">
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <p>No tasks yet.</p>
                  <button onClick={() => setShowTaskForm(true)} className="btn-secondary">
                    Create your first task
                  </button>
                </div>
              ) : (
                <div className="cards-grid">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task._id || task.id}
                      task={task}
                      showAssignee
                      showStatus
                      onEdit={() => setEditingTask(task)}
                      onDelete={() => handleDeleteTask(task._id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'goals' && (
            <section className="dashboard-section">
              {goals.length === 0 ? (
                <div className="empty-state">
                  <p>No goals yet.</p>
                  <button onClick={() => setShowGoalForm(true)} className="btn-secondary">
                    Create your first goal
                  </button>
                </div>
              ) : (
                <div className="cards-grid">
                  {goals.map((goal) => (
                    <GoalCard
                      key={goal._id || goal.id}
                      goal={goal}
                      onEdit={() => setEditingGoal(goal)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default OwnerOperationsDashboard;
