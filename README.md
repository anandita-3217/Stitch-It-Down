<!-- TODO: Change calendar and scrolling and stuff
TODO: Save notes and tasks in app 
TODO: Auto update progress

TODO: change AddNotes to let the user specify the type of note or task or stuff. For task let the note displayed have a functionaity to choose 
 frequency of the task daily , weekly, bi weekly or monthly
 let the tasks have the prgress bar alone and only daily tasks get deleted everyday at 12:00 ist others wvery week 2 weeks and month. when 
 user says completed task on;y then is the task complete and the progress increases.
 allow u to make tasks for future date by  clicking on the date-div open a calendar modal and choose the date on which you want to create the task.
 make a digital clock under the the date of the date div -->
# Stitch It Down

*"Ohana means family, and family means nobody gets left behind or forgotten."*

A desktop notes application inspired by Lilo & Stitch, built with Electron.js to help you capture your thoughts, tasks, and experiments without leaving anything behind.

<!-- ![Stitch It Down](https://placeholder.com/logo) -->

## 🏝️ Features

- **Fast and Lightweight**: Like Stitch zooming through the Hawaiian skies, Stitch It Down starts up instantly and uses minimal system resources
- **Experiment 626 Mode**: Toggle between dark and light themes (blue alien or beach vibes)
- **Customizable "Ohana" Board**: Organize your notes in a way that works for your ʻohana
- **Focus Mode**: Block out distractions when you need to concentrate, just like Stitch on a mission
- **Offline First**: Works perfectly without an internet connection - ideal for note-taking on remote Hawaiian beaches or anywhere else
- **Auto-save**: Never lose your thoughts - all notes are automatically saved
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Task-Tracking**: Shows all tasks for the day, tasks that need to be done everyday and tasks that are done are crossed out and daily report at the end of the day

## 🌺 Installation

```bash
# Clone this repository
git clone https://github.com/anandita-3217/Stitch-It-Down
# Go into the repository
cd Stitch-It-Down
# Install dependencies
npm install
# Run the app
npm start
```

## 📷 Screenshots

###  Home Window
![Home Window](screenshots/home-page-dark.png)
![Home Window](screenshots/home-page-light.png)

###  Timer Window
![Timer Window](screenshots/timer-page-dark.png)
![Timer Window](screenshots/timer-page-light.png)

## 🚀 Development

Stitch It Down is built with Electron.js, using modern web technologies to create a native-like desktop experience.

```bash
# Run in development mode
npm run dev

# Build for your current platform
npm run build

# Build for all platforms
npm run build-all
```

<!-- ## 🌊 Contributing

Contributions are welcome! Whether you're fixing bugs, improving documentation, or proposing new features, your help is appreciated. Please check out our [contributing guidelines](CONTRIBUTING.md) to get started.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request -->

<!-- ## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. -->

## 🏆 Acknowledgements

- Inspired by the Disney movie "Lilo & Stitch"
- Built on the foundations of [GreenProductive](https://github.com/Btelgeuse/GreenProductive)


---

*"This is my family. I found it, all on my own. It's little, and broken, but still good. Yeah. Still good."* - Stitch

<!-- Functionality Suggestions (Without Code Changes):
Here are some exciting features you could add to your productivity app:
Core Productivity Features:

Task Management System: Convert notes into actionable tasks with checkboxes, due dates, and priority levels
Pomodoro Timer: Built-in focus timer with Stitch-themed breaks and motivational quotes
Goal Tracking: Weekly/monthly goal setting with visual progress indicators

Enhanced User Experience:

Drag & Drop: Reorder notes and tasks by dragging them around
Search & Filter: Quick search through notes and filter by categories/tags
Keyboard Shortcuts: Power-user shortcuts for quick note creation and navigation

Stitch Theme Enhancements:

Animated Stitch Character: A small Stitch that reacts to your productivity (happy when tasks are completed)
Achievement System: Unlock different Stitch expressions/quotes based on productivity milestones
Sound Effects: Subtle Disney/Stitch sound effects for interactions

Data & Analytics:

Productivity Insights: Weekly reports showing your most productive days/times
Habit Tracker: Track daily habits with streak counters
Export Features: Backup notes as PDF or text files

Social & Motivation:

Daily Challenges: Gamified productivity challenges with Stitch-themed rewards
Motivational Reminders: Smart notifications with encouraging Stitch quotes
Focus Mode: Distraction-free mode that dims everything except current task

Advanced Features:

Voice Notes: Record quick voice memos that get transcribed
Smart Categories: Auto-categorize notes based on content using keywords
Calendar Integration: Sync with external calendars for better time management -->

<!-- Easy to Implement (Great Starting Points):

Smart Task Categorization - Use simple keyword matching or a basic classification API to automatically sort tasks by type (work, personal, urgent, etc.)
Time Estimation Assistant - Analyze past task completion times to suggest realistic time estimates for new tasks
Smart Notifications - Send reminders based on task priority and user behavior patterns
Auto-Complete Suggestions - Suggest task names and descriptions based on what the user starts typing

Intermediate Features:

Productivity Insights Dashboard - Generate weekly/monthly reports showing productivity patterns, peak hours, and completion rates
Smart Scheduling - Automatically suggest optimal times to work on tasks based on energy levels and past performance
Goal Tracking with AI Coaching - Set goals and get AI-generated tips and encouragement based on progress
Document/Email Integration - Extract tasks and deadlines from uploaded documents or connected email

More Advanced (Impressive for Interviews):

Natural Language Task Creation - Let users type "Call mom tomorrow at 3pm" and automatically create structured tasks
Predictive Burnout Detection - Monitor work patterns and warn when the user might be overloading themselves
Intelligent Project Breakdown - Take large projects and suggest smaller, manageable sub-tasks
Context-Aware Suggestions - Recommend related tasks or resources based on what the user is currently working on

Technical Implementation Tips:

Start with OpenAI's API or Hugging Face models for text processing
Use simple machine learning libraries like scikit-learn for pattern recognition
Consider using pre-built APIs (like Google's Natural Language API) rather than building from scratch
 -->

 <!-- That sounds like an awesome and fun project—combining productivity with the charm of *Lilo & Stitch* could really set your app apart! Since you already have basic notes and tasks (add/delete/complete), here are some **feature ideas** you can implement to improve functionality, deepen engagement, and make the app more uniquely themed:

---

### 🌺 **Productivity Features (Core Enhancements)**

1. **Task Categories with Ohana Themes**

   * Group tasks into "Ohana" (family), "School", "Adventure", etc.
   * Use themed icons (surfboards, ukuleles, space blasters).

2. **Daily & Weekly Planner View**

   * Let users schedule tasks into a calendar-style layout.
   * Display a quote from Lilo or Stitch each day.

3. **Reminders and Notifications**

   * Push or in-app reminders with themed sounds (e.g. Stitch growl, spaceship beeping).

4. **Recurring Tasks**

   * Allow tasks like “Homework every Monday” or “Feed Pudge every Friday”.

5. **Note Tagging and Search**

   * Add tags like #Experiments or #HulaPractice to notes for easy search.

---

### 🌌 **Gamification and Motivation**

6. **“Experiment Energy” System**

   * Completing tasks earns you energy to unlock Stitch’s cousins (new “experiments”) as digital collectibles.

7. **Mood Tracker with Stitch’s Faces**

   * Let users track daily mood using Stitch’s expressions (happy, sad, mischief, etc.)

8. **Mini Challenges**

   * Daily/weekly goals like "Complete 3 tasks before 10 AM" with rewards.

9. **Soundboard or Visual Rewards**

   * Unlock quotes (“Blue Punch Buggy!”) or animations after streaks.

---

### 🌴 **Thematic/Immersive Features**

10. **Themed Backgrounds and Skins**

    * Users can switch between Hawaii beach, Lilo’s room, or space scenes.

11. **Stitch AI Assistant**

    * A mini Stitch character gives tips, encouragement, or sass when you complete tasks or procrastinate.

12. **Aloha Timer (Pomodoro)**

    * Hawaiian music plays during focus time. Stitch encourages breaks with "Break time, now!"

13. **Ohana Board**

    * A collaborative space for group goals or shared notes/tasks (especially cool for couples or families).

---

### 🛰️ **Advanced Features**

14. **Voice Notes with Stitch Filter**

    * Record quick notes and apply a fun audio filter (like Stitch’s voice).

15. **Sync Across Devices / Cloud Backup**

    * Allow users to access tasks/notes across phone, tablet, web.

16. **Offline Mode with Island Mode Theme**

    * When offline, activate a chill beach vibe with calming colors and animations.

17. **Experiment 626 Lab (Customization Hub)**

    * Customize app theme, stickers, icons, based on productivity streaks or achievements.

---

Would you like wireframes or implementation suggestions for any of these?

 -->