/**
 * Goal-Specific Questions Configuration
 *
 * Dynamic weekly check-in questions that adapt based on user's hair goal.
 * Q1, Q4, Q5 are universal. Q2 and Q3 are goal-specific.
 */

// ============================================
// GOAL-SPECIFIC PROGRESS OPTIONS (Q2)
// ============================================

export const GOAL_PROGRESS_OPTIONS = {
  length: [
    { value: "none", label: "No growth yet", emoji: "😔" },
    { value: "little", label: "A little growth", emoji: "🌱" },
    { value: "noticeable", label: "Noticeable growth!", emoji: "📏" }
  ],
  volume: [
    { value: "none", label: "Still flat", emoji: "😔" },
    { value: "little", label: "A bit more bounce", emoji: "💨" },
    { value: "noticeable", label: "Noticeably fuller!", emoji: "🎉" }
  ],
  repair: [
    { value: "none", label: "Still damaged", emoji: "😔" },
    { value: "little", label: "Slightly stronger", emoji: "💪" },
    { value: "noticeable", label: "Less breakage!", emoji: "✨" }
  ],
  curls: [
    { value: "none", label: "Curls still struggling", emoji: "😔" },
    { value: "little", label: "A bit more defined", emoji: "〰️" },
    { value: "noticeable", label: "Curls are popping!", emoji: "🌀" }
  ],
  scalp: [
    { value: "none", label: "Scalp still irritated", emoji: "😔" },
    { value: "little", label: "Some improvement", emoji: "🩹" },
    { value: "noticeable", label: "Scalp feels healthy!", emoji: "💆" }
  ],
  color: [
    { value: "none", label: "Color fading fast", emoji: "😔" },
    { value: "little", label: "Color holding okay", emoji: "🎨" },
    { value: "noticeable", label: "Color still vibrant!", emoji: "✨" }
  ]
};

// ============================================
// GOAL-SPECIFIC HABIT OPTIONS (Q3)
// ============================================

export const GOAL_HABIT_OPTIONS = {
  length: [
    { value: "scalp-massage", label: "Scalp Massage", emoji: "💆" },
    { value: "oil-treatment", label: "Oil Treatment", emoji: "🫒" },
    { value: "protective-styling", label: "Protective Styling", emoji: "🎀" },
    { value: "low-manipulation", label: "Low Manipulation", emoji: "✋" },
    { value: "moisture-balance", label: "Moisture Balance", emoji: "💧" },
    { value: "other", label: "Other", emoji: "✏️" }
  ],
  volume: [
    { value: "root-lifting", label: "Root Lifting Products", emoji: "⬆️" },
    { value: "volumizing-shampoo", label: "Volumizing Shampoo", emoji: "🧴" },
    { value: "blow-dry-technique", label: "Blow Dry Technique", emoji: "💨" },
    { value: "dry-shampoo", label: "Dry Shampoo", emoji: "✨" },
    { value: "light-conditioner", label: "Light Conditioner", emoji: "🪶" },
    { value: "other", label: "Other", emoji: "✏️" }
  ],
  repair: [
    { value: "deep-conditioning", label: "Deep Conditioning", emoji: "💆" },
    { value: "protein-treatment", label: "Protein Treatment", emoji: "💪" },
    { value: "heat-free", label: "No Heat Styling", emoji: "❄️" },
    { value: "silk-pillowcase", label: "Silk Pillowcase", emoji: "🛏️" },
    { value: "bond-repair", label: "Bond Repair Products", emoji: "🔗" },
    { value: "gentle-detangling", label: "Gentle Detangling", emoji: "🪮" },
    { value: "other", label: "Other", emoji: "✏️" }
  ],
  curls: [
    { value: "wet-styling", label: "Styling on Wet Hair", emoji: "💦" },
    { value: "diffusing", label: "Diffusing", emoji: "🌀" },
    { value: "leave-in", label: "Leave-in Conditioner", emoji: "💧" },
    { value: "curl-cream", label: "Curl Cream/Gel", emoji: "🧴" },
    { value: "refresh-spray", label: "Refresh Spray", emoji: "💨" },
    { value: "pineapple-sleep", label: "Pineapple at Night", emoji: "🍍" },
    { value: "other", label: "Other", emoji: "✏️" }
  ],
  scalp: [
    { value: "clarifying", label: "Clarifying Wash", emoji: "🧼" },
    { value: "scalp-oil", label: "Scalp Treatment Oil", emoji: "🫒" },
    { value: "gentle-shampoo", label: "Gentle Shampoo", emoji: "🧴" },
    { value: "exfoliating", label: "Scalp Exfoliation", emoji: "✨" },
    { value: "less-product", label: "Less Product Buildup", emoji: "📉" },
    { value: "other", label: "Other", emoji: "✏️" }
  ],
  color: [
    { value: "color-safe-products", label: "Color-safe Products", emoji: "🛡️" },
    { value: "cold-water-rinse", label: "Cold Water Rinse", emoji: "🧊" },
    { value: "less-washing", label: "Less Frequent Washing", emoji: "📅" },
    { value: "uv-protection", label: "UV Protection", emoji: "☀️" },
    { value: "gloss-treatment", label: "Gloss Treatment", emoji: "✨" },
    { value: "other", label: "Other", emoji: "✏️" }
  ]
};

// ============================================
// UNIVERSAL HARM OPTIONS (Q4)
// ============================================

export const HARM_OPTIONS = [
  { value: "heat-styling", label: "Heat Styling", emoji: "🔥" },
  { value: "harsh-shampoo", label: "Harsh Shampoo", emoji: "🧪" },
  { value: "tight-styles", label: "Tight Styles/Tension", emoji: "🎀" },
  { value: "over-manipulation", label: "Over-manipulation", emoji: "✋" },
  { value: "skipping-moisture", label: "Skipping Moisture", emoji: "🏜️" },
  { value: "skipping-protein", label: "Skipping Protein", emoji: "💪" },
  { value: "weather-humidity", label: "Weather/Humidity", emoji: "🌧️" },
  { value: "chemical-treatment", label: "Chemical Treatment", emoji: "⚗️" },
  { value: "none", label: "Nothing", emoji: "✅" },
  { value: "other", label: "Other", emoji: "✏️" }
];

// ============================================
// FEELING SCALE (Q1)
// ============================================

export const FEELING_OPTIONS = [
  { value: 1, label: "Struggling", emoji: "😢", color: "#ef4444" },
  { value: 2, label: "Not great", emoji: "😕", color: "#f97316" },
  { value: 3, label: "Okay", emoji: "😐", color: "#eab308" },
  { value: 4, label: "Good", emoji: "😊", color: "#22c55e" },
  { value: 5, label: "Amazing!", emoji: "🤩", color: "#ec4899" }
];

// ============================================
// GOAL DISPLAY INFO
// ============================================

export const GOAL_INFO = {
  length: {
    label: "Grow Longer Hair",
    icon: "📏",
    color: "#22c55e"
  },
  volume: {
    label: "Add Volume",
    icon: "💨",
    color: "#8b5cf6"
  },
  repair: {
    label: "Repair Damage",
    icon: "💪",
    color: "#3b82f6"
  },
  curls: {
    label: "Define Curls",
    icon: "🌀",
    color: "#ec4899"
  },
  scalp: {
    label: "Heal Scalp",
    icon: "💆",
    color: "#14b8a6"
  },
  color: {
    label: "Protect Color",
    icon: "🎨",
    color: "#f59e0b"
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get progress options for a specific goal
 */
export function getProgressOptions(goal) {
  return GOAL_PROGRESS_OPTIONS[goal] || GOAL_PROGRESS_OPTIONS.repair;
}

/**
 * Get habit options for a specific goal
 */
export function getHabitOptions(goal) {
  return GOAL_HABIT_OPTIONS[goal] || GOAL_HABIT_OPTIONS.repair;
}

/**
 * Get goal display info
 */
export function getGoalInfo(goal) {
  return GOAL_INFO[goal] || { label: "Hair Goal", icon: "💇", color: "#6b7280" };
}

/**
 * Get feeling option by value
 */
export function getFeelingOption(value) {
  return FEELING_OPTIONS.find(opt => opt.value === value) || FEELING_OPTIONS[2];
}

/**
 * Get progress option label by value and goal
 */
export function getProgressLabel(goal, value) {
  const options = getProgressOptions(goal);
  const option = options.find(opt => opt.value === value);
  return option?.label || value;
}

/**
 * Get habit label by value and goal
 */
export function getHabitLabel(goal, value) {
  const options = getHabitOptions(goal);
  const option = options.find(opt => opt.value === value);
  return option?.label || value;
}

/**
 * Get harm label by value
 */
export function getHarmLabel(value) {
  const option = HARM_OPTIONS.find(opt => opt.value === value);
  return option?.label || value;
}
