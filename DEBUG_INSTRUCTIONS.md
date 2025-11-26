# Debug Instructions - Why Inputs Don't Work

## Step 1: Open Browser Console

1. Open your browser (Chrome/Edge)
2. Press **F12** to open DevTools
3. Click **Console** tab
4. Clear the console (click the 🚫 icon)

## Step 2: Open Profile Edit Modal

1. Go to http://localhost:3000/visitor/profile
2. Click **"✏️ Edit Profile"** button
3. Modal should open

## Step 3: Try Typing in First Name

1. Click in the **"First Name"** input field
2. Try typing any letter (like "T")
3. **Watch the console**

### What You Should See:

If inputs are working, you'll see:
```
🔧 [ProfileEditModal] handleChange called: { field: "firstName", value: "T" }
📝 [ProfileEditModal] Updated profile: { firstName: "T", ... }
```

### What You Might See Instead:

**Option A: Nothing in console**
- This means `onChange` is NOT being called
- Input might be `readOnly` or `disabled`
- Or event is being blocked somewhere

**Option B: Console shows the logs but input doesn't change**
- This means React state update is failing
- Possible React version mismatch
- Or state is being overwritten immediately

## Step 4: Check Input Attributes

In the Console tab, type:
```javascript
document.querySelector('.profile-input').disabled
document.querySelector('.profile-input').readOnly
```

Should both return `false`

## Step 5: Manual Test

In Console, try to manually update the input:
```javascript
const input = document.querySelector('.profile-input');
input.value = 'TEST';
```

**If this works:** React is not updating the DOM (controlled input issue)
**If this doesn't work:** Input is disabled or protected somehow

## Step 6: Check React DevTools

1. Install React DevTools extension (if not installed)
2. Open DevTools → **Components** tab
3. Find **ProfileEditModal** component
4. Look at `profile` state
5. Try typing in input
6. **Watch if `profile.firstName` updates in real-time**

**If it updates:** React works, but DOM isn't re-rendering
**If it doesn't update:** `setProfile()` is not working

## Step 7: Report Results

Take a screenshot or copy-paste the console output showing:
1. What you see when you type "T" in First Name
2. The result of the disabled/readOnly check
3. What React DevTools shows for `profile` state

---

## Common Issues and Fixes

### Issue 1: Input is Controlled but State Isn't Updating

**Symptom:** You can't type anything, cursor appears but nothing changes

**Cause:** React controlled input with stale state

**Fix:**
```javascript
// In HeadlineEditor.jsx, change from:
value={profile?.firstName || ''}

// To:
value={profile?.firstName ?? ''}
defaultValue=""
```

### Issue 2: Browser Autofill Interfering

**Symptom:** Input fills automatically then becomes uneditable

**Fix:** Add to input:
```javascript
autoComplete="off"
data-form-type="other"
```

### Issue 3: CSS Preventing Clicks

**Symptom:** Can't even focus the input

**Fix:** Check if overlay is covering inputs:
```javascript
// In Console:
document.querySelector('.profile-edit-overlay').style.pointerEvents = 'none';
document.querySelector('.profile-edit-modal').style.pointerEvents = 'auto';
```

### Issue 4: Input Has `readOnly` or `disabled`

**Symptom:** Input is gray or won't accept focus

**Fix:** Remove these attributes from the input element

---

## Nuclear Option: Uncontrolled Input Test

If nothing works, let's test with an uncontrolled input.

Create a test file: `frontend/src/components/TestInput.jsx`

```javascript
import React, { useState } from 'react';

export default function TestInput() {
  const [value, setValue] = useState('');

  console.log('🧪 TestInput render, value:', value);

  return (
    <div style={{ padding: '20px', background: 'white' }}>
      <h2>Test Input</h2>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          console.log('🧪 onChange called:', e.target.value);
          setValue(e.target.value);
        }}
        style={{
          padding: '10px',
          border: '2px solid black',
          fontSize: '16px'
        }}
      />
      <p>Current value: {value}</p>
    </div>
  );
}
```

Then in VisitorProfilePage.jsx, temporarily add:
```javascript
import TestInput from '../components/TestInput';

// In the render:
<TestInput />
```

**If TestInput works:** Problem is in ProfileEditModal
**If TestInput doesn't work:** React itself is broken (very unlikely)

---

## After Debugging

Once you know which scenario applies, I can give you the exact fix.

**DO NOT** try random fixes until we know what's actually wrong.
