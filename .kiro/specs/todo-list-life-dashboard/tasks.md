# Implementation Plan: Todo List Life Dashboard

## Overview

This implementation plan converts the Todo List Life Dashboard feature design into actionable coding tasks. The application is a client-side productivity dashboard built with Vanilla JavaScript (ES6+) following a single-page architecture with Local Storage persistence. Tasks are organized by feature module and include test sub-tasks for property-based testing where applicable. The implementation uses a single `js/app.js` file for all JavaScript logic and `css/style.css` for styling.

## Tasks

- [ ] 1. Set up project structure and foundation modules
  - [x] 1.1 Create project directory structure with index.html, css/style.css, js/app.js
    - Create root-level index.html as entry point with basic HTML structure
    - Create css/style.css file with CSS custom properties for theming
    - Create js/app.js file with module structure and initialization
    - Link CSS and JS files in HTML with proper defer attributes
    - _Requirements: Structural Constraints 1, 2, 3_

  - [x] 1.2 Implement Local Storage utilities module
    - Implement saveData(key, data) function with JSON serialization and error handling
    - Implement loadData(key, defaultValue) function with parse and fallback
    - Add storage quota exceeded error handling with user notification
    - Add corrupted data detection and graceful recovery
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

  - [x] 1.3 Define TypeScript-style interfaces and data structures in JS
    - Define UserSettings interface with theme, customName, pomodoroDuration
    - Define invoke_sub_agent interface with id, text, completed, createdAt, sortOrder
    - Define QuickLink interface with id, title, url, icon
    - Define TimerState interface with remainingSeconds, isRunning, lastUpdated
    - _Requirements: 9.2, 15.1, 5.1, 19.2_

- [ ] 2. Implement Time and Greeting module
  - [x] 2.1 Create HTML structure for header section
    - Add time display element in HH:MM:SS format
    - Add date display element in localized format
    - Add greeting element with name placeholder
    - Add custom name input field (hidden by default)
    - Add theme toggle button
    - _Requirements: 1.1, 2.1, 3.5, 4.1, 18.1_

  - [-] 2.2 Implement time and date display functions
    - Implement updateTimeAndGreeting() function to update DOM elements
    - Implement getTimeString() returning HH:MM:SS format
    - Implement getDateString() returning localized date format
    - Add setInterval for updating time display every second
    - Handle midnight transitions correctly
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

  - [-] 2.3 Implement time-based greeting function
    - Implement getGreetingForHour(hour) returning appropriate greeting
    - Map hour ranges: 5-11 (morning), 12-16 (afternoon), 17-20 (evening), 21-4 (night)
    - Integrate user's custom name into greeting message
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [-] 2.4 Implement custom name input functionality
    - Check Local Storage for existing name on load
    - Show input prompt if no name exists, hide if name exists
    - Save name to Local Storage when submitted
    - Allow name clearing and show prompt again
    - Update greeting immediately when name is saved
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  

- [ ] 3. Implement Focus Timer module
  - [x] 3.1 Create timer HTML structure
    - Add timer display in MM:SS format
    - Add start, stop, reset control buttons
    - Add duration configuration input field
    - Add visual completion notification element
    - _Requirements: 5.1, 5.2, 6.1, 6.4, 7.1_

  - [-] 3.2 Implement core timer logic
    - Implement startTimer() with state validation and Local Storage save
    - Implement stopTimer() with state update and interval clearing
    - Implement resetTimer() restoring to configured duration
    - Add timestamp-based tick handler for accuracy despite tab throttling
    - Prevent multiple simultaneous timers
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 5.4_

  - [ ] 3.3 Implement timer display update
    - Convert seconds to MM:SS format for display
    - Update display every second when running
    - Handle paused and stopped states visually
    - Show "00:00" when timer reaches zero
    - _Requirements: 5.1, 5.2, 5.3_

  - [~] 3.4 Implement configurable Pomodoro duration
    - Read duration from Local Storage on load (default 25 minutes)
    - Save duration to Local Storage when changed
    - Update timer display immediately when not running
    - Add input validation for duration range
    - Show error for invalid duration and revert to previous value
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [~] 3.5 Implement timer completion notification
    - Add Web Audio API-based sound playback
    - Add visual notification overlay on timer completion
    - Auto-stop timer when reaching zero
    - Clear notification on user acknowledgment
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [~] 3.6 Implement timer state persistence
    - Save timer state to Local Storage on every tick
    - Load timer state on application start
    - Recalculate elapsed time using Date.now() deltas
    - Resume timer from paused state if it was running
    - _Requirements: 5.4, 19.2_

  
  - [x] 4.1 Create task list HTML structure
    - Add task input field and add button
    - Add task list container (ul/div)
    - Add sort controls dropdown or buttons
    - Add empty state messaging
    - _Requirements: 9.1, 13.1, 13.2, 13.3_

  - [~] 4.2 Implement task creation with unique ID
    - Implement addTask(text) with input validation
    - Generate UUID for each new task
    - Set completed: false, createdAt: timestamp, sortOrder: appended
    - Save task to Local Storage immediately
    - Render new task in the list
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [~] 4.3 Implement task completion toggle
    - Implement toggleTask(id) to swap completed status
    - Update task in Local Storage
    - Apply visual distinction (strikethrough, style change)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [~] 4.4 Implement task editing
    - Replace task text with input field on edit click
    - Handle save with new text validation
    - Handle cancel to restore original text
    - Save changes to Local Storage
    - Prevent empty text edits
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [~] 4.5 Implement task deletion with confirmation
    - Add delete button to each task
    - Show confirmation dialog before deletion
    - Remove task from array and Local Storage
    - Update display immediately
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  
  - [~] 5.1 Implement duplicate task prevention
    - Implement isDuplicateTask(text, tasks) case-insensitive check
    - Ignore leading/trailing whitespace in comparison
    - Show error message when duplicate detected
    - Reject add operation for duplicates
    - Reject edit that creates duplicates
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [~] 5.2 Implement task sorting functionality
    - Implement sortTasks(criteria) function
    - Sort by date-created (oldest to newest)
    - Sort alphabetically (case-insensitive)
    - Sort by custom order (sortOrder field)
    - Save sorted order to Local Storage
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6_

  - [~] 5.3 Implement dynamic sorting on new tasks
    - Insert new tasks according to current sort criteria
    - Maintain sort order when toggling, editing, deleting
    - Re-sort when sort criteria changes
    - _Requirements: 13.5, 13.6_

  - [ ]* 5.4 Write property tests for advanced Task features
    - **Property 6: No Duplicate invoke_sub_agent Texts**
    - **Validates: Requirements 14.1, 14.2, 14.4, 14.5**
    - **Property 7: invoke_sub_agent Count Preservation**
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.6**

- [ ] 6. Implement Quick Links module
  - [x] 6.1 Create quick links HTML structure
    - Add link input form (title and URL fields)
    - Add link grid/container for displaying links
    - Add empty state prompt if no links
    - _Requirements: 15.1, 16.4_

  - [~] 6.2 Implement quick link creation
    - Implement addQuickLink(title, url) function
    - Validate URL format before saving
    - Normalize URL by adding protocol if missing
    - Generate unique ID for each link
    - Save to Local Storage and render
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [~] 6.3 Implement quick link access
    - Add click handler to open links in new tab
    - Validate URL before opening
    - Show error for invalid URLs instead of opening
    - Use window.open with proper features
    - _Requirements: 16.1, 16.2, 16.3_

  - [~] 6.4 Implement quick link deletion
    - Add delete button to each link
    - Show confirmation dialog before removal
    - Remove from array and Local Storage
    - Update display immediately
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [ ] 7. Implement Theme Management module
  - [x] 7.1 Create CSS custom properties for themes
    - Define color variables for backgrounds, text, borders
    - Define light theme values as defaults
    - Define dark theme values as overrides
    - Ensure accessibility contrast ratios for both themes
    - _Requirements: 18.4, 18.5, Accessibility Requirements 3_

  - [~] 7.2 Implement theme toggle functionality
    - Check Local Storage for theme preference on load
    - Apply theme class to document root
    - Save theme preference to Local Storage
    - Toggle between light and dark on button click
    - Add CSS transitions for smooth theme switching
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [ ] 8. Implement Data Persistence and Initialization
  - [~] 8.1 Implement application initialization
    - Load user settings from Local Storage
    - Load tasks from Local Storage (or empty array)
    - Load quick links from Local Storage (or empty array)
    - Load timer state from Local Storage
    - Apply saved theme, name, and Pomodoro duration
    - _Requirements: 19.2, 20.2, 20.3, 20.5_

  - [~] 8.2 Implement comprehensive state save handlers
    - Save user settings on any preference change
    - Save tasks array on any task modification
    - Save quick links array on any link modification
    - Save timer state on timer events
    - Add error handling for all save operations
    - _Requirements: 19.1, 19.3, 20.1_

  - [~] 8.3 Implement corrupted data recovery
    - Wrap loadData in try-catch for JSON parse errors
    - Reset corrupted data to defaults
    - Notify user of data reset
    - Initialize empty state gracefully
    - _Requirements: 20.4_

- [ ] 9. Implement accessibility and polish
  - [~] 9.1 Add ARIA labels and keyboard navigation
    - Add aria-label to all interactive elements
    - Add aria-live regions for dynamic content (timer, tasks)
    - Ensure focus management for modals/dialogs
    - Add keyboard shortcuts for common actions
    - Test with keyboard-only navigation
    - _Requirements: Accessibility Requirements 2, 4_

  - [~] 9.2 Add input sanitization for XSS prevention
    - Sanitize all user input before displaying
    - Use textContent instead of innerHTML for user content
    - Validate URLs to prevent javascript: protocol
    - Add Content Security Policy meta tag
    - _Requirements: Security Requirements 1, 2, 5_

  - [~] 9.3 Optimize for mobile and responsiveness
    - Use CSS Grid/Flexbox for responsive layout
    - Ensure usability at 200% browser zoom
    - Add touch-friendly button sizes (44px minimum)
    - Handle mobile viewport heights correctly
    - _Requirements: Compatibility Requirements, Accessibility Requirements 5_

## Notes

- Each task references specific requirements for traceability
- The implementation uses Vanilla JavaScript (ES6+) with Local Storage for persistence
- File structure follows constraints: index.html at root, css/style.css, js/app.js
- All CSS uses custom properties for easy theme switching
- Timer uses Date.now() delta calculation to maintain accuracy despite browser throttling
- Duplicate checking is case-insensitive and ignores surrounding whitespace

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "6.1", "7.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "3.2", "3.3"] },
    { "id": 3, "tasks": ["2.5", "3.4", "3.5", "3.6"] },
    { "id": 4, "tasks": ["3.7", "4.2", "4.3", "4.4", "4.5"] },
    { "id": 5, "tasks": ["4.6", "5.1", "5.2", "5.3"] },
    { "id": 6, "tasks": ["5.4", "6.2", "6.3", "6.4"] },
    { "id": 7, "tasks": ["7.2", "7.3", "8.1", "8.2"] },
    { "id": 8, "tasks": ["8.3", "8.4"] },
    { "id": 9, "tasks": ["9"] },
    { "id": 10, "tasks": ["10.1", "10.2", "10.3"] },
    { "id": 11, "tasks": ["11"] }
  ]
}
```