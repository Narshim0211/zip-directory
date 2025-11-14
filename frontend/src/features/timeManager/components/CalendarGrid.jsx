import React from "react";
import "../styles/timeManagerNew.css";

export function WeeklyGrid({ 
  weekStart, 
  tasks = [], 
  onAddClick, 
  onTaskClick, 
  onToggleComplete,
  onDateClick 
}) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Generate dates for the week
  const weekDates = days.map((_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });

  // Group tasks by date
  const tasksByDate = weekDates.reduce((acc, date, index) => {
    const dateStr = date.toISOString().split('T')[0];
    acc[index] = tasks.filter(task => {
      const taskDateStr = new Date(task.taskDate).toISOString().split('T')[0];
      return taskDateStr === dateStr;
    });
    return acc;
  }, {});

  return (
    <div className="tm-weekly-grid">
      {days.map((dayName, index) => {
        const date = weekDates[index];
        const dayTasks = tasksByDate[index] || [];
        const dateStr = date.getDate();
        const isToday = new Date().toDateString() === date.toDateString();

        return (
          <div 
            key={dayName} 
            className={`tm-weekly-grid__day ${isToday ? 'tm-weekly-grid__day--today' : ''}`}
          >
            <div className="tm-weekly-grid__header">
              <div>
                <strong>{dayName}</strong>
                <span 
                  className="tm-weekly-grid__date-number"
                  onClick={() => onDateClick?.(date)}
                  style={{ cursor: 'pointer' }}
                >
                  {dateStr}
                </span>
              </div>
              <button 
                type="button" 
                className="tm-add-btn"
                onClick={() => onAddClick(date)}
                title={`Add task for ${dayName}`}
              >
                +
              </button>
            </div>
            <div className="tm-weekly-grid__tasks">
              {dayTasks.length === 0 && (
                <div className="tm-empty-state">No tasks</div>
              )}
              {dayTasks.slice(0, 5).map((task) => (
                <div 
                  key={task._id || task.id} 
                  className="tm-weekly-grid__task"
                  onClick={(e) => {
                    if (e.target.type !== 'checkbox') {
                      onTaskClick?.(task);
                    }
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={task.completed || false}
                    onChange={() => onToggleComplete?.(task)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={task.completed ? 'tm-task-completed' : ''}>
                    {task.title}
                  </span>
                  {task.priority && (
                    <span className={`tm-priority tm-priority--${task.priority}`}>
                      {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                    </span>
                  )}
                </div>
              ))}
              {dayTasks.length > 5 && (
                <small className="tm-more-tasks">+{dayTasks.length - 5} more</small>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MonthlyGrid({ 
  month, 
  year, 
  tasks = [], 
  onAddClick, 
  onDateClick, 
  onTaskClick, 
  onToggleComplete 
}) {
  // Generate calendar grid
  const generateCalendar = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDay = firstDay.getDay(); // 0=Sun, 6=Sat
    const daysInMonth = lastDay.getDate();
    
    const grid = [];
    let week = [];
    
    // Padding days from previous month (empty cells)
    for (let i = 0; i < startDay; i++) {
      week.push(null);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(new Date(year, month - 1, day));
      if (week.length === 7) {
        grid.push(week);
        week = [];
      }
    }
    
    // Final week padding
    while (week.length > 0 && week.length < 7) {
      week.push(null);
    }
    if (week.length > 0) grid.push(week);
    
    return grid;
  };

  const calendar = generateCalendar();
  const today = new Date();

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    const dateStr = new Date(task.taskDate).toISOString().split('T')[0];
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(task);
    return acc;
  }, {});

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="tm-monthly-grid">
      {/* Day name headers */}
      <div className="tm-monthly-grid__header">
        {dayNames.map(day => (
          <div key={day} className="tm-monthly-grid__day-name">{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      {calendar.map((week, weekIdx) => (
        <div key={weekIdx} className="tm-monthly-grid__row">
          {week.map((date, dayIdx) => {
            if (!date) {
              return <div key={`empty-${weekIdx}-${dayIdx}`} className="tm-monthly-grid__cell tm-monthly-grid__cell--empty" />;
            }

            const dateStr = date.toISOString().split('T')[0];
            const dateTasks = tasksByDate[dateStr] || [];
            const isToday = today.toDateString() === date.toDateString();
            const isCurrentMonth = date.getMonth() === month - 1;

            return (
              <div 
                key={dateStr} 
                className={`tm-monthly-grid__cell ${isToday ? 'tm-monthly-grid__cell--today' : ''} ${!isCurrentMonth ? 'tm-monthly-grid__cell--other-month' : ''}`}
              >
                <div className="tm-monthly-grid__cell-header">
                  <span 
                    className="tm-monthly-grid__date"
                    onClick={() => onDateClick?.(date)}
                  >
                    {date.getDate()}
                  </span>
                  <button 
                    className="tm-monthly-grid__add-btn"
                    onClick={() => onAddClick(date)}
                    title={`Add task for ${date.toLocaleDateString()}`}
                  >
                    +
                  </button>
                </div>
                
                <div className="tm-monthly-grid__tasks">
                  {dateTasks.slice(0, 3).map((task) => (
                    <div 
                      key={task._id || task.id} 
                      className="tm-monthly-grid__task"
                      onClick={(e) => {
                        if (e.target.type !== 'checkbox') {
                          onTaskClick?.(task);
                        }
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={task.completed || false}
                        onChange={() => onToggleComplete?.(task)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className={task.completed ? 'tm-task-completed' : ''}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {dateTasks.length > 3 && (
                    <small className="tm-more-tasks">+{dateTasks.length - 3} more</small>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
