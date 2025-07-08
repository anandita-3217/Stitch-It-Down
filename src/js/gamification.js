// gamification.js - Core gamification system
// import '@css/main.css';
class GamificationSystem {
  constructor() {
    this.data = this.loadData();
    this.achievements = this.initializeAchievements();
    this.listeners = [];
  }

  loadData() {
    const defaultData = {
      xp: 0,
      level: 1,
      streaks: {
        daily: { count: 0, lastDate: null },
        tasks: { count: 0, lastDate: null },
        notes: { count: 0, lastDate: null },
        calendar: { count: 0, lastDate: null }
      },
      stats: {
        tasksCompleted: 0,
        notesCreated: 0,
        calendarEventsCreated: 0,
        focusTimeMinutes: 0,
        perfectDays: 0
      },
      achievements: [],
      badges: [],
      dailyGoals: {
        tasks: 3,
        notes: 1,
        focusTime: 60,
        calendarEvents: 1
      },
      lastResetDate: new Date().toDateString()
    };

    try {
      const saved = localStorage.getItem('gamification_data');
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    } catch (error) {
      console.error('Error loading gamification data:', error);
      return defaultData;
    }
  }

  saveData() {
    try {
      localStorage.setItem('gamification_data', JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving gamification data:', error);
    }
  }

  initializeAchievements() {
    return {
      // Task achievements
      'first_task': { name: 'First Steps', description: 'Complete your first task', xp: 50, icon: '🎯' },
      'task_streak_7': { name: 'Week Warrior', description: 'Complete tasks for 7 days straight', xp: 200, icon: '🔥' },
      'task_streak_30': { name: 'Monthly Master', description: 'Complete tasks for 30 days straight', xp: 1000, icon: '🏆' },
      'tasks_100': { name: 'Centurion', description: 'Complete 100 tasks', xp: 500, icon: '💯' },
      
      // Note achievements
      'first_note': { name: 'Note Taker', description: 'Create your first note', xp: 50, icon: '📝' },
      'notes_streak_14': { name: 'Daily Scribe', description: 'Create notes for 14 days straight', xp: 300, icon: '✍️' },
      'notes_50': { name: 'Knowledge Keeper', description: 'Create 50 notes', xp: 250, icon: '📚' },
      
      // Calendar achievements
      'first_event': { name: 'Scheduler', description: 'Create your first calendar event', xp: 50, icon: '📅' },
      'calendar_streak_7': { name: 'Planning Pro', description: 'Add calendar events for 7 days', xp: 200, icon: '🗓️' },
      
      // Focus achievements
      'focus_1hour': { name: 'Focus Rookie', description: 'Focus for 1 hour total', xp: 100, icon: '⏱️' },
      'focus_10hours': { name: 'Focus Veteran', description: 'Focus for 10 hours total', xp: 300, icon: '🎯' },
      'focus_100hours': { name: 'Focus Master', description: 'Focus for 100 hours total', xp: 1000, icon: '🧠' },
      
      // Perfect day achievements
      'perfect_day': { name: 'Perfect Day', description: 'Complete all daily goals in one day', xp: 200, icon: '⭐' },
      'perfect_week': { name: 'Perfect Week', description: 'Complete 7 perfect days', xp: 500, icon: '🌟' },
      
      // Level achievements
      'level_5': { name: 'Rising Star', description: 'Reach level 5', xp: 0, icon: '🌟' },
      'level_10': { name: 'Productivity Pro', description: 'Reach level 10', xp: 0, icon: '🏆' },
      'level_20': { name: 'Master Achiever', description: 'Reach level 20', xp: 0, icon: '👑' }
    };
  }

  // XP and Level system
  addXP(amount, reason) {
    this.data.xp += amount;
    const oldLevel = this.data.level;
    this.data.level = this.calculateLevel(this.data.xp);
    
    this.saveData();
    this.notifyListeners('xp_gained', { amount, reason, newXP: this.data.xp });
    
    if (this.data.level > oldLevel) {
      this.notifyListeners('level_up', { 
        oldLevel, 
        newLevel: this.data.level,
        xp: this.data.xp 
      });
      this.checkLevelAchievements();
    }
  }

  calculateLevel(xp) {
    // Level formula: each level requires 100 * level XP
    let level = 1;
    let requiredXP = 100;
    let totalXP = 0;
    
    while (totalXP + requiredXP <= xp) {
      totalXP += requiredXP;
      level++;
      requiredXP = 100 * level;
    }
    
    return level;
  }

  getXPForNextLevel() {
    const currentLevelXP = 100 * this.data.level;
    const previousLevelXP = this.data.level === 1 ? 0 : 
      Array.from({length: this.data.level - 1}, (_, i) => 100 * (i + 1))
        .reduce((sum, xp) => sum + xp, 0);
    
    return {
      current: this.data.xp - previousLevelXP,
      required: currentLevelXP,
      percentage: ((this.data.xp - previousLevelXP) / currentLevelXP) * 100
    };
  }

  // Streak system
  updateStreak(type, date = new Date()) {
    const today = date.toDateString();
    const streak = this.data.streaks[type];
    
    if (!streak.lastDate) {
      // First time
      streak.count = 1;
      streak.lastDate = today;
    } else {
      const lastDate = new Date(streak.lastDate);
      const currentDate = new Date(today);
      const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        streak.count++;
        streak.lastDate = today;
      } else if (daysDiff === 0) {
        // Same day, don't change count
        return streak.count;
      } else {
        // Streak broken
        streak.count = 1;
        streak.lastDate = today;
      }
    }
    
    this.saveData();
    this.checkStreakAchievements(type, streak.count);
    this.notifyListeners('streak_updated', { type, count: streak.count });
    
    return streak.count;
  }

  // Activity tracking
  completeTask() {
    this.data.stats.tasksCompleted++;
    this.addXP(20, 'Task completed');
    this.updateStreak('tasks');
    this.updateDailyStreak();
    this.checkTaskAchievements();
    this.checkDailyGoals();
    this.saveData();
  }

  createNote() {
    this.data.stats.notesCreated++;
    this.addXP(15, 'Note created');
    this.updateStreak('notes');
    this.updateDailyStreak();
    this.checkNoteAchievements();
    this.checkDailyGoals();
    this.saveData();
  }

  createCalendarEvent() {
    this.data.stats.calendarEventsCreated++;
    this.addXP(10, 'Calendar event created');
    this.updateStreak('calendar');
    this.updateDailyStreak();
    this.checkCalendarAchievements();
    this.checkDailyGoals();
    this.saveData();
  }

  addFocusTime(minutes) {
    this.data.stats.focusTimeMinutes += minutes;
    this.addXP(Math.floor(minutes / 5), 'Focus time');
    this.checkFocusAchievements();
    this.checkDailyGoals();
    this.saveData();
  }

  updateDailyStreak() {
    const today = new Date().toDateString();
    if (this.data.streaks.daily.lastDate !== today) {
      this.updateStreak('daily');
    }
  }

  // Achievement system
  checkTaskAchievements() {
    const tasks = this.data.stats.tasksCompleted;
    const streak = this.data.streaks.tasks.count;
    
    if (tasks === 1) this.unlockAchievement('first_task');
    if (tasks === 100) this.unlockAchievement('tasks_100');
    if (streak === 7) this.unlockAchievement('task_streak_7');
    if (streak === 30) this.unlockAchievement('task_streak_30');
  }

  checkNoteAchievements() {
    const notes = this.data.stats.notesCreated;
    const streak = this.data.streaks.notes.count;
    
    if (notes === 1) this.unlockAchievement('first_note');
    if (notes === 50) this.unlockAchievement('notes_50');
    if (streak === 14) this.unlockAchievement('notes_streak_14');
  }

  checkCalendarAchievements() {
    const events = this.data.stats.calendarEventsCreated;
    const streak = this.data.streaks.calendar.count;
    
    if (events === 1) this.unlockAchievement('first_event');
    if (streak === 7) this.unlockAchievement('calendar_streak_7');
  }

  checkFocusAchievements() {
    const minutes = this.data.stats.focusTimeMinutes;
    const hours = Math.floor(minutes / 60);
    
    if (hours >= 1) this.unlockAchievement('focus_1hour');
    if (hours >= 10) this.unlockAchievement('focus_10hours');
    if (hours >= 100) this.unlockAchievement('focus_100hours');
  }

  checkLevelAchievements() {
    const level = this.data.level;
    if (level >= 5) this.unlockAchievement('level_5');
    if (level >= 10) this.unlockAchievement('level_10');
    if (level >= 20) this.unlockAchievement('level_20');
  }

  checkStreakAchievements(type, count) {
    // Additional streak achievements can be added here
  }

  unlockAchievement(id) {
    if (this.data.achievements.includes(id)) return;
    
    const achievement = this.achievements[id];
    if (!achievement) return;
    
    this.data.achievements.push(id);
    if (achievement.xp > 0) {
      this.addXP(achievement.xp, `Achievement: ${achievement.name}`);
    }
    
    this.saveData();
    this.notifyListeners('achievement_unlocked', { id, achievement });
  }

  // Daily goals system
  checkDailyGoals() {
    const today = new Date().toDateString();
    const goals = this.data.dailyGoals;
    
    // Reset daily stats if new day
    if (this.data.lastResetDate !== today) {
      this.data.lastResetDate = today;
      this.data.dailyStats = {
        tasksCompleted: 0,
        notesCreated: 0,
        calendarEventsCreated: 0,
        focusTimeMinutes: 0
      };
    }
    
    // Update daily stats
    if (!this.data.dailyStats) {
      this.data.dailyStats = {
        tasksCompleted: 0,
        notesCreated: 0,
        calendarEventsCreated: 0,
        focusTimeMinutes: 0
      };
    }
    
    // Check if all goals are met
    const goalsCompleted = 
      this.data.dailyStats.tasksCompleted >= goals.tasks &&
      this.data.dailyStats.notesCreated >= goals.notes &&
      this.data.dailyStats.calendarEventsCreated >= goals.calendarEvents &&
      this.data.dailyStats.focusTimeMinutes >= goals.focusTime;
    
    if (goalsCompleted) {
      this.data.stats.perfectDays++;
      this.unlockAchievement('perfect_day');
      
      if (this.data.stats.perfectDays === 7) {
        this.unlockAchievement('perfect_week');
      }
    }
  }

  // Event system
  addEventListener(event, callback) {
    this.listeners.push({ event, callback });
  }

  removeEventListener(event, callback) {
    this.listeners = this.listeners.filter(
      listener => listener.event !== event || listener.callback !== callback
    );
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(listener => listener.event === event)
      .forEach(listener => listener.callback(data));
  }

  // Getters
  getLevel() { return this.data.level; }
  getXP() { return this.data.xp; }
  getStreaks() { return this.data.streaks; }
  getStats() { return this.data.stats; }
  getAchievements() { 
    return this.data.achievements.map(id => ({
      id,
      ...this.achievements[id]
    }));
  }
  getDailyGoals() { return this.data.dailyGoals; }
  getDailyStats() { return this.data.dailyStats || {}; }
}

// UI Components for gamification
class GamificationUI {
  constructor(gamification) {
    this.gamification = gamification;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.gamification.addEventListener('xp_gained', this.showXPGain.bind(this));
    this.gamification.addEventListener('level_up', this.showLevelUp.bind(this));
    this.gamification.addEventListener('achievement_unlocked', this.showAchievement.bind(this));
    this.gamification.addEventListener('streak_updated', this.updateStreakDisplay.bind(this));
  }

  showXPGain(data) {
    this.showNotification(`+${data.amount} XP`, data.reason, 'xp-gain');
  }

  showLevelUp(data) {
    this.showNotification(
      `Level Up! 🎉`,
      `You reached level ${data.newLevel}!`,
      'level-up'
    );
  }

  showAchievement(data) {
    this.showNotification(
      `${data.achievement.icon} Achievement Unlocked!`,
      `${data.achievement.name} - ${data.achievement.description}`,
      'achievement'
    );
  }

  showNotification(title, message, type) {
    const notification = document.createElement('div');
    notification.className = `gamification-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <h4>${title}</h4>
        <p>${message}</p>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 4000);
  }

  updateStreakDisplay() {
    // Update streak displays in UI
    const streakElements = document.querySelectorAll('[data-streak]');
    streakElements.forEach(element => {
      const streakType = element.dataset.streak;
      const streak = this.gamification.getStreaks()[streakType];
      if (streak) {
        element.textContent = streak.count;
      }
    });
  }

  createStatsWidget() {
    const stats = this.gamification.getStats();
    const level = this.gamification.getLevel();
    const xp = this.gamification.getXP();
    const xpProgress = this.gamification.getXPForNextLevel();
    const streaks = this.gamification.getStreaks();
    
    return `
      <div class="gamification-widget">
        <div class="level-display">
          <span class="level-number">${level}</span>
          <div class="xp-bar">
            <div class="xp-fill" style="width: ${xpProgress.percentage}%"></div>
            <span class="xp-text">${xpProgress.current}/${xpProgress.required} XP</span>
          </div>
        </div>
        
        <div class="streak-display">
          <div class="streak-item">
            <span class="streak-icon">🔥</span>
            <span class="streak-count" data-streak="daily">${streaks.daily.count}</span>
            <span class="streak-label">Day</span>
          </div>
          <div class="streak-item">
            <span class="streak-icon">✅</span>
            <span class="streak-count" data-streak="tasks">${streaks.tasks.count}</span>
            <span class="streak-label">Tasks</span>
          </div>
          <div class="streak-item">
            <span class="streak-icon">📝</span>
            <span class="streak-count" data-streak="notes">${streaks.notes.count}</span>
            <span class="streak-label">Notes</span>
          </div>
        </div>
        
        <div class="stats-summary">
          <div class="stat-item">
            <span class="stat-value">${stats.tasksCompleted}</span>
            <span class="stat-label">Tasks Done</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${Math.floor(stats.focusTimeMinutes / 60)}h</span>
            <span class="stat-label">Focus Time</span>
          </div>
        </div>
      </div>
    `;
  }
}

// Export for use in your Electron app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GamificationSystem, GamificationUI };
}