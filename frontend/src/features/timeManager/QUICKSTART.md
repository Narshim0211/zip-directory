# Time Manager 2.0 - Quick Start Guide

## For Developers

### Getting Started (5 minutes)

1. **Start the backend**
   ```powershell
   cd backend
   npm install
   npm run dev
   ```

2. **Start the frontend**
   ```powershell
   cd frontend
   npm install
   npm start
   ```

3. **Navigate to Time Manager**
   - Login as a visitor
   - Click "Time Manager" in the sidebar
   - Or visit: `http://localhost:3000/visitor/time`

### Default Behavior

**Without TIME_SERVICE_URL:**
- Backend uses in-memory stub endpoints
- Data persists only in browser session
- Perfect for frontend development

**With TIME_SERVICE_URL:**
```powershell
# In backend/.env
TIME_SERVICE_URL=http://localhost:4000
```
- Backend proxies to microservice
- Data persists in microservice database
- Required for production

## Using the Feature

### Daily Planner
```
/visitor/time/daily
```
- Select a date
- Add tasks by clicking "+ Add Task"
- Choose session: Morning, Afternoon, or Evening
- Toggle completion by clicking the checkbox
- Edit or delete using task card buttons

### Weekly Planner
```
/visitor/time/weekly
```
- Navigate weeks with < > buttons
- Add tasks (they'll appear on the first day by default)
- View all 7 days in a grid
- Edit task dates by editing the task

### Motivational Quote
Displays at the top of the Time Manager page. Refreshes on page load.

### Progress Analytics
Shows completion percentage based on today's tasks.

## Importing Components

```jsx
// Import the whole page
import { TimeManagerPage } from '../features/timeManager';

// Import individual components
import { 
  DailyPlanner, 
  WeeklyPlanner, 
  QuoteBanner, 
  ProgressAnalytics 
} from '../features/timeManager';

// Import hooks
import { usePlannerApi, useLocalSync } from '../features/timeManager';
```

## Using the Hooks

### usePlannerApi

```jsx
import { usePlannerApi } from '../features/timeManager';

function MyComponent() {
  const api = usePlannerApi();
  
  // Get daily tasks
  const tasks = await api.getDaily('2025-01-15');
  
  // Get weekly tasks
  const tasks = await api.getWeekly('2025-01-13');
  
  // Create task
  const newTask = await api.createTask({
    title: 'Task title',
    session: 'Morning',
    date: '2025-01-15'
  });
  
  // Update task
  const updated = await api.updateTask(taskId, { status: 'completed' });
  
  // Delete task
  await api.deleteTask(taskId);
  
  // Get quote
  const quote = await api.getQuote();
}
```

### useLocalSync

```jsx
import { useState } from 'react';
import { useLocalSync } from '../features/timeManager';

function MyComponent() {
  const [tasks, setTasks] = useState([]);
  
  // Auto-sync to localStorage on every tasks change
  useLocalSync('my.cache.key', tasks);
  
  // Tasks are automatically saved and restored
}
```

## Customizing Styles

All styles are in `features/timeManager/styles/timeManager.css`.

Key CSS classes:
- `.tm-head` - Top bar with title and actions
- `.tm-daily__grid` - 3-column grid for sessions
- `.tm-slot` - Individual session container
- `.tm-quote` - Quote banner
- `.tm-analytics` - Progress meter
- `.tm-nav` - Tab navigation

Override in your component:
```css
.tm-quote {
  background: #your-color;
  /* your overrides */
}
```

## API Response Format

### Daily Tasks
```json
{
  "tasks": [
    {
      "_id": "abc123",
      "title": "Task title",
      "session": "Morning",
      "status": "pending",
      "completed": false,
      "date": "2025-01-15"
    }
  ]
}
```

### Quote
```json
{
  "quote": "Your motivational quote here"
}
```

## Troubleshooting

### "No tasks" appears even after adding tasks
- Check browser console for API errors
- Verify backend is running
- Check `TIME_SERVICE_URL` if using microservice

### Quote doesn't appear
- Quote endpoint returns 501 in stub mode by default
- Add quote stub in `backend/routes/time/visitor.stub.js`

### Tasks don't persist after refresh
- This is expected in stub mode (in-memory only)
- Set `TIME_SERVICE_URL` for persistence
- Or localStorage caching is active (check DevTools → Application → Local Storage)

### Styling looks wrong
- Ensure `timeManager.css` is imported
- Check for CSS conflicts with global styles
- Verify `.tm-*` classes are applied

## Testing

### Manual Testing Checklist
- [ ] Can add a task
- [ ] Can edit a task
- [ ] Can delete a task
- [ ] Can toggle completion
- [ ] Date picker changes displayed tasks
- [ ] Week navigation works
- [ ] Quote displays (if backend supports)
- [ ] Progress bar updates on completion toggle
- [ ] Responsive on mobile (< 900px width)
- [ ] Error states show correctly (disable backend to test)

### Unit Tests (future)
```javascript
// Test hooks
test('usePlannerApi creates task', async () => {
  const api = usePlannerApi();
  const task = await api.createTask({ title: 'Test' });
  expect(task.title).toBe('Test');
});

// Test components
test('DailyPlanner renders sessions', () => {
  render(<DailyPlanner />);
  expect(screen.getByText('Morning')).toBeInTheDocument();
});
```

## Next Steps

1. **Backend Persistence**: Implement real database models and controllers
2. **Monthly View**: Add calendar heatmap
3. **Recurring Tasks**: Add pattern support (daily/weekly)
4. **Reminders**: Integrate cron notifications
5. **Analytics**: Add charts and trends
6. **Owner Parity**: Build owner-specific pages

## Resources

- [Time Manager README](./README.md) - Full feature documentation
- [Architecture Diagram](./ARCHITECTURE.md) - System design overview
- [Implementation Summary](./TIME_MANAGER_V2_IMPLEMENTATION.md) - Build details
- [PRD](../../../OWNER_SOCIAL_FEED_IMPLEMENTATION.md) - Original requirements

## Getting Help

- Check existing issues in the repository
- Review backend stub implementation in `backend/routes/time/`
- Inspect network requests in browser DevTools
- Review existing `visitorTimeApi.js` for API contract

---

**Happy coding!** 🚀

Built with ❤️ for SalonHub Time Manager 2.0
