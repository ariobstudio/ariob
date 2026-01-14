// Initial welcome content shown to new users
// Uses HTML format for TipTap editor

export const welcomeContent = `
<h1>Welcome to Brana</h1>

<p>A cozy corner for your thoughts, ideas, and tasks.</p>

<p>Brana is your lightweight writing companion—ready whenever inspiration strikes. Capture ideas, organize notes, manage tasks, or draft your next article, all in one calm, distraction-free space.</p>

<p>Press <kbd>Space</kbd> at the start of an empty line to open the flow menu.</p>

<p>Press <kbd>Shift</kbd> + <kbd>Space</kbd> on any block to change its format.</p>

<h2>Papers</h2>
<ul>
  <li><kbd>⌘</kbd> + <kbd>O</kbd> to create a new paper</li>
  <li><kbd>⌘</kbd> + <kbd>9</kbd> to go to previous paper</li>
  <li><kbd>⌘</kbd> + <kbd>0</kbd> to go to next paper</li>
</ul>

<h2>Formatting</h2>
<ul>
  <li><kbd>⌘</kbd> + <kbd>b</kbd> for bold</li>
  <li><kbd>⌘</kbd> + <kbd>i</kbd> for italic</li>
  <li><kbd>⌘</kbd> + <kbd>u</kbd> for underline</li>
  <li><kbd>⌘</kbd> + <kbd>5</kbd> for strikethrough</li>
  <li><kbd>⌘</kbd> + <kbd>k</kbd> to add a link</li>
</ul>

<h2>Blocks</h2>
<ul>
  <li><kbd>Tab</kbd> to indent</li>
  <li><kbd>Shift</kbd> + <kbd>Tab</kbd> to outdent</li>
  <li><kbd>⌘</kbd> + <kbd>Enter</kbd> to insert line below</li>
  <li><kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>Enter</kbd> to insert line above</li>
</ul>

<h2>Tasks</h2>
<ul>
  <li><kbd>⌘</kbd> + <kbd>.</kbd> to toggle a checkbox</li>
  <li><kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>.</kbd> to remove a checkbox</li>
</ul>
`.trim();
