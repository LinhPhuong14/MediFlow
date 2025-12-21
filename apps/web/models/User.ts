import mongoose, { Schema, Document, Model } from "mongoose"
import bcrypt from "bcryptjs"

// Interface cho User document
export interface IUser extends Document {
  _id: string
  name: string
  email: string
  password?: string
  image?: string
  provider: "credentials" | "google"
  emailVerified?: Date
  role: "user" | "admin"
  subscription: {
    plan: "free" | "premium" | "super-premium"
    status: "active" | "canceled" | "trialing"
    renewalDate?: Date
    stripeCustomerId?: string
  }
  preferences: {
    difficulty: "beginner" | "intermediate" | "advanced"
    practiceGoals: ("ielts" | "topic-practice" | "casual")[]
    reminderEnabled: boolean
    reminderTime?: string
    voiceSettings: {
      gender: "female" | "male"
      accent: "american" | "british" | "australian"
      speed: "slow" | "normal" | "fast"
      feedback: boolean
    }
  }
  statistics: {
    totalSessions: number
    totalPracticeTime: number
    averageScore: number
    bestScore: number
    streakDays: number
    longestStreak: number
    lastPracticeDate?: Date
    weeklyGoal: number
    weeklyCompleted: number
    improvement: string
  }
  progress: {
    skillScores: {
      pronunciation: number
      fluency: number
      vocabulary: number
      grammar: number
      coherence: number
    }
    recentSessions: Array<{
      id: string
      date: Date
      mode: "ielts" | "topic-practice" | "casual"
      score: number
      duration: number
      skills: {
        pronunciation: number
        fluency: number
        vocabulary: number
        grammar: number
        coherence: number
      }
    }>
    monthlyProgress: Array<{
      month: string
      sessions: number
      averageScore: number
      totalTime: number
    }>
    weeklyActivity: Array<{
      week: string
      sessions: number
      totalTime: number
      averageScore: number
    }>
    achievements: Array<{
      id: string
      title: string
      description: string
      category: "milestone" | "streak" | "performance" | "endurance" | "ielts"
      rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
      points: number
      completed: boolean
      completedDate?: Date
      progress: number
    }>
    initialAssessment?: {
      completed: boolean
      level: "beginner" | "intermediate" | "advanced"
      accuracy: number
      completedAt: Date
      assessmentId?: string
    }
  }
  topicHistory?: Array<{
    id: string
    title: string
    description: string
    mode: "casual" | "topic" | "ielts"
    difficulty: "beginner" | "intermediate" | "advanced"
    createdAt: string
    vocabulary_focus?: string[]
  }>
  createdAt: Date
  updatedAt: Date

  // Methods
  updateProgress(sessionData: any): Promise<IUser>
  getCurrentLevel(): string
  getWeeklyProgress(): any
  getCurrentWeek(): string
  updateSubscription(plan: "free" | "premium" | "super-premium", status: "active" | "canceled" | "trialing"): Promise<IUser>
  comparePassword(password: string): Promise<boolean>
}

// Session data interface for type safety
export interface ISessionData {
  id: string
  mode: "ielts" | "topic-practice" | "casual"
  duration: number
  score: number
  skills: {
    pronunciation: number
    fluency: number
    vocabulary: number
    grammar: number
    coherence: number
  }
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    select: false,
    minlength: [6, "Password must be at least 6 characters"]
  },
  image: {
    type: String,
    default: null
  },
  provider: {
    type: String,
    enum: ["credentials", "google"],
    default: "credentials"
  },
  emailVerified: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  subscription: {
    plan: {
      type: String,
      enum: ["free", "premium", "super-premium"],
      default: "free"
    },
    status: {
      type: String,
      enum: ["active", "canceled", "trialing"],
      default: "trialing"
    },
    renewalDate: {
      type: Date,
      default: null
    },
    stripeCustomerId: {
      type: String,
      default: null
    }
  },
  preferences: {
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    practiceGoals: {
      type: [String],
      enum: ["ielts", "topic-practice", "casual"],
      default: ["ielts", "topic-practice"]
    },
    reminderEnabled: {
      type: Boolean,
      default: false
    },
    reminderTime: {
      type: String,
      default: null
    },
    voiceSettings: {
      gender: {
        type: String,
        enum: ["female", "male"],
        default: "female"
      },
      accent: {
        type: String,
        enum: ["american", "british", "australian"],
        default: "american"
      },
      speed: {
        type: String,
        enum: ["slow", "normal", "fast"],
        default: "normal"
      },
      feedback: {
        type: Boolean,
        default: true
      }
    }
  },
  statistics: {
    totalSessions: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPracticeTime: {
      type: Number,
      default: 0,
      min: 0
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    bestScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    streakDays: {
      type: Number,
      default: 0,
      min: 0
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    lastPracticeDate: {
      type: Date,
      default: null
    },
    weeklyGoal: {
      type: Number,
      default: 3,
      min: 0
    },
    weeklyCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    improvement: {
      type: String,
      default: "stable"
    }
  },
  progress: {
    skillScores: {
      pronunciation: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
      },
      fluency: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
      },
      vocabulary: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
      },
      grammar: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
      },
      coherence: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
      }
    },
    recentSessions: {
      type: [{
        id: {
          type: String,
          required: true
        },
        date: {
          type: Date,
          required: true,
          default: Date.now
        },
        mode: {
          type: String,
          enum: ["ielts", "topic-practice", "casual"],
          required: true
        },
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 10
        },
        duration: {
          type: Number,
          required: true,
          min: 0
        },
        skills: {
          pronunciation: {
            type: Number,
            required: true,
            min: 0,
            max: 10
          },
          fluency: {
            type: Number,
            required: true,
            min: 0,
            max: 10
          },
          vocabulary: {
            type: Number,
            required: true,
            min: 0,
            max: 10
          },
          grammar: {
            type: Number,
            required: true,
            min: 0,
            max: 10
          },
          coherence: {
            type: Number,
            required: true,
            min: 0,
            max: 10
          }
        }
      }],
      default: []
    },
    monthlyProgress: {
      type: [{
        month: {
          type: String,
          required: true
        },
        sessions: {
          type: Number,
          required: true,
          min: 0
        },
        averageScore: {
          type: Number,
          required: true,
          min: 0,
          max: 10
        },
        totalTime: {
          type: Number,
          required: true,
          min: 0
        }
      }],
      default: []
    },
    weeklyActivity: {
      type: [{
        week: {
          type: String,
          required: true
        },
        sessions: {
          type: Number,
          required: true,
          min: 0
        },
        totalTime: {
          type: Number,
          required: true,
          min: 0
        },
        averageScore: {
          type: Number,
          required: true,
          min: 0,
          max: 10
        }
      }],
      default: []
    },
    achievements: {
      type: [{
        id: {
          type: String,
          required: true
        },
        title: {
          type: String,
          required: true
        },
        description: {
          type: String,
          required: true
        },
        category: {
          type: String,
          enum: ["milestone", "streak", "performance", "endurance", "ielts"],
          required: true
        },
        rarity: {
          type: String,
          enum: ["common", "uncommon", "rare", "epic", "legendary"],
          required: true
        },
        points: {
          type: Number,
          required: true,
          min: 0
        },
        completed: {
          type: Boolean,
          default: false
        },
        completedDate: {
          type: Date,
          default: null
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        }
      }],
      default: []
    },
    initialAssessment: {
      completed: {
        type: Boolean,
        default: false
      },
      level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
      },
      accuracy: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      completedAt: {
        type: Date,
        default: null
      },
      assessmentId: {
        type: String,
        default: null
      }
    }
  },
  topicHistory: {
    type: [{
      id: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      mode: {
        type: String,
        enum: ["casual", "topic", "ielts"],
        required: true
      },
      difficulty: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        required: true
      },
      createdAt: {
        type: String,
        required: true
      },
      vocabulary_focus: {
        type: [String],
        default: []
      }
    }],
    default: []
  }
}, {
  timestamps: true,
  versionKey: false
})

// Indexes for better performance
userSchema.index({ "statistics.lastPracticeDate": 1 })
userSchema.index({ "subscription.status": 1 })
userSchema.index({ role: 1 })

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next()

  try {
    this.password = await bcrypt.hash(this.password, 12)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  if (!this.password) return false
  return await bcrypt.compare(password, this.password)
}

// Method to update user progress after a session
userSchema.methods.updateProgress = async function(sessionData: ISessionData): Promise<IUser> {
  try {
    // Update basic statistics
    this.statistics.totalSessions += 1
    this.statistics.totalPracticeTime += sessionData.duration
    
    // Calculate new average score
    const totalScore = this.statistics.averageScore * (this.statistics.totalSessions - 1) + sessionData.score
    this.statistics.averageScore = Math.round((totalScore / this.statistics.totalSessions) * 100) / 100
    
    // Update best score
    if (sessionData.score > this.statistics.bestScore) {
      this.statistics.bestScore = sessionData.score
    }
    
    // Update skill scores (weighted average)
    const weight = 0.1
    Object.keys(sessionData.skills).forEach(skill => {
      const skillKey = skill as keyof typeof sessionData.skills
      if (this.progress.skillScores[skillKey] !== undefined) {
        this.progress.skillScores[skillKey] = Math.round(
          ((this.progress.skillScores[skillKey] * (1 - weight)) + 
          (sessionData.skills[skillKey] * weight)) * 100
        ) / 100
      }
    })
    
    // Add to recent sessions (keep only last 10)
    this.progress.recentSessions.unshift({
      id: sessionData.id,
      date: new Date(),
      mode: sessionData.mode,
      score: sessionData.score,
      duration: sessionData.duration,
      skills: sessionData.skills
    })
    
    if (this.progress.recentSessions.length > 10) {
      this.progress.recentSessions = this.progress.recentSessions.slice(0, 10)
    }
    
    // Update monthly progress
    const currentMonth = new Date().toISOString().slice(0, 7)
    let monthlyRecord = this.progress.monthlyProgress.find(m => m.month === currentMonth)
    
    if (!monthlyRecord) {
      monthlyRecord = {
        month: currentMonth,
        sessions: 0,
        averageScore: 0,
        totalTime: 0
      }
      this.progress.monthlyProgress.push(monthlyRecord)
    }
    
    monthlyRecord.sessions += 1
    monthlyRecord.totalTime += sessionData.duration
    monthlyRecord.averageScore = Math.round(
      ((monthlyRecord.averageScore * (monthlyRecord.sessions - 1) + sessionData.score) / monthlyRecord.sessions) * 100
    ) / 100
    
    // Update weekly activity
    const currentWeek = this.getCurrentWeek()
    let weeklyRecord = this.progress.weeklyActivity.find(w => w.week === currentWeek)
    
    if (!weeklyRecord) {
      weeklyRecord = {
        week: currentWeek,
        sessions: 0,
        totalTime: 0,
        averageScore: 0
      }
      this.progress.weeklyActivity.push(weeklyRecord)
    }
    
    weeklyRecord.sessions += 1
    weeklyRecord.totalTime += sessionData.duration
    weeklyRecord.averageScore = Math.round(
      ((weeklyRecord.averageScore * (weeklyRecord.sessions - 1) + sessionData.score) / weeklyRecord.sessions) * 100
    ) / 100
    
    // Update streak
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const lastPractice = this.statistics.lastPracticeDate ? 
      this.statistics.lastPracticeDate.toISOString().split('T')[0] : null
    
    if (lastPractice !== todayStr) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      
      if (lastPractice === yesterday) {
        // Yesterday - continue streak
        this.statistics.streakDays += 1
      } else {
        // Gap in practice - reset streak
        this.statistics.streakDays = 1
      }
      
      if (this.statistics.streakDays > this.statistics.longestStreak) {
        this.statistics.longestStreak = this.statistics.streakDays
      }
      
      this.statistics.lastPracticeDate = today
    }
    
    // Update weekly completed count
    this.statistics.weeklyCompleted = weeklyRecord.sessions
    
    return await this.save()
  } catch (error) {
    throw new Error(`Error updating progress: ${error}`)
  }
}

// Method to update user's subscription
userSchema.methods.updateSubscription = async function(
  plan: "free" | "premium" | "super-premium", 
  status: "active" | "canceled" | "trialing"
): Promise<IUser> {
  try {
    this.subscription.plan = plan
    this.subscription.status = status
    
    if (status === "active") {
      this.subscription.renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
    }
    
    return await this.save()
  } catch (error) {
    throw new Error(`Error updating subscription: ${error}`)
  }
}

// Method to get user's current level based on average score
userSchema.methods.getCurrentLevel = function(): string {
  const avgScore = this.statistics.averageScore
  
  if (avgScore >= 8.5) return "Advanced"
  if (avgScore >= 6.5) return "Intermediate"
  return "Beginner"
}

// Method to get weekly progress
userSchema.methods.getWeeklyProgress = function() {
  const currentWeek = this.getCurrentWeek()
  const weeklyRecord = this.progress.weeklyActivity.find(w => w.week === currentWeek)
  
  return weeklyRecord || {
    week: currentWeek,
    sessions: 0,
    totalTime: 0,
    averageScore: 0
  }
}

// Helper method to get current week in format "2024-W01"
userSchema.methods.getCurrentWeek = function(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`
}

// Safe model creation for Next.js
let User: Model<IUser>

try {
  User = mongoose.model<IUser>("User")
} catch (error) {
  User = mongoose.model<IUser>("User", userSchema)
}

export default User