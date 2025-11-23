# 🎨 Owner Home Page - Visual Mockup & Design Specs

**Final Design Preview**
**Status:** Ready for Implementation

---

## 📐 Desktop Layout (1400px+)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        OWNER HOME PAGE (1400px Desktop)                     │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────┬──────────────────────────────────────┬────────────┐
│  LEFT      │         CENTER (EXISTING)            │   RIGHT    │
│  PANEL     │                                      │   PANEL    │
│  280px     │           800px                      │   280px    │
│            │                                      │            │
│ ┌────────┐ │  ┌──────────────────────────────┐  │ ┌────────┐ │
│ │🌟 SOTD │ │  │                              │  │ │📈 WEEK │ │
│ │        │ │  │    SalonHub Owner            │  │ │        │ │
│ │ Sarah  │ │  │                              │  │ │  #1    │ │
│ │ What's │ │  │  Connect with salon owners   │  │ │  Most  │ │
│ │ your   │ │  └──────────────────────────────┘  │ │  loved │ │
│ │ hairc..│ │                                      │ │        │ │
│ │        │ │  ┌──────────────────────────────┐  │ │  #2    │ │
│ │💜 45   │ │  │   [Search Box]               │  │ │  Best  │ │
│ └────────┘ │  └──────────────────────────────┘  │ │  prod..│ │
│            │                                      │ │        │ │
│ ┌────────┐ │  ┌──────────────────────────────┐  │ │  #3    │ │
│ │🔥TODAY │ │  │                              │  │ │  Tips  │ │
│ │        │ │  │  Post from Guest             │  │ │  for   │ │
│ │ #1 Best│ │  │  What hair service...        │  │ │        │ │
│ │ prod.. │ │  │                              │  │ │  #4    │ │
│ │ 💜38   │ │  │  ❤️ 12   💬 3   ⭐ 5        │  │ │  How   │ │
│ │        │ │  └──────────────────────────────┘  │ │  to    │ │
│ │ #2 Hair│ │                                      │ │        │ │
│ │ color..│ │  ┌──────────────────────────────┐  │ │  #5    │ │
│ │ 💜29   │ │  │                              │  │ │  Curly │ │
│ │        │ │  │  Survey from @SarahSalon     │  │ │  hair..│ │
│ │ #3 Curl│ │  │  What's your favorite...     │  │ └────────┘ │
│ │ care   │ │  │                              │  │            │
│ │ 💜27   │ │  │  ○ Haircut    ○ Coloring    │  │ (Sticky)   │
│ │        │ │  │  ○ Treatment  ○ Styling     │  │            │
│ │ #4 Spa │ │  │                              │  │            │
│ │ tips   │ │  │  ❤️ 45   💬 12               │  │            │
│ │ 💜23   │ │  └──────────────────────────────┘  │            │
│ │        │ │                                      │            │
│ │ #5 Best│ │  ┌──────────────────────────────┐  │            │
│ │ salon..│ │  │                              │  │            │
│ │ 💜21   │ │  │  Post from @DowntownSpa     │  │            │
│ └────────┘ │  │  New massage therapy...      │  │            │
│            │  │                              │  │            │
│ (Sticky)   │  │  ❤️ 8    💬 2                │  │            │
│            │  └──────────────────────────────┘  │            │
│            │                                      │            │
│            │  [More feed items...]               │            │
│            │                                      │            │
└────────────┴──────────────────────────────────────┴────────────┘
                             ↑                          ↑
                       NO CHANGES HERE            [📊] [✏️]
                                                   FABs
```

---

## 📱 Tablet Layout (768px - 1199px)

```
┌──────────────────────────────────────────┐
│     OWNER HOME PAGE (Tablet 900px)       │
└──────────────────────────────────────────┘

        ┌──────────────────────┐
        │                      │
        │  SalonHub Owner      │
        │                      │
        │  Connect with salon  │
        │  owners              │
        └──────────────────────┘

        ┌──────────────────────┐
        │   [Search Box]       │
        └──────────────────────┘

        ┌──────────────────────┐
        │                      │
        │  Post from Guest     │
        │  What hair service.. │
        │                      │
        │  ❤️ 12   💬 3       │
        └──────────────────────┘

        ┌──────────────────────┐
        │                      │
        │  Survey from @Sarah  │
        │  What's your fav...  │
        │                      │
        │  ○ A    ○ B         │
        │                      │
        │  ❤️ 45   💬 12      │
        └──────────────────────┘

     [More feed items...]

                        [📊] [✏️]
                         FABs

NO SIDE PANELS - CENTERED LAYOUT ONLY
```

---

## 📱 Mobile Layout (< 768px)

```
┌────────────────────┐
│  OWNER HOME PAGE   │
└────────────────────┘

┌────────────────────┐
│                    │
│  SalonHub Owner    │
│                    │
│  Connect with      │
│  salon owners      │
└────────────────────┘

┌────────────────────┐
│  [Search Box]      │
└────────────────────┘

┌────────────────────┐
│                    │
│  Post from Guest   │
│  What hair...      │
│                    │
│  ❤️ 12   💬 3     │
└────────────────────┘

┌────────────────────┐
│                    │
│  Survey @Sarah     │
│  What's your...    │
│                    │
│  ○ A    ○ B       │
│                    │
│  ❤️ 45   💬 12    │
└────────────────────┘

[Feed items...]

             [📊]
             [✏️]

NO SIDE PANELS
```

---

## 🎨 Component Closeups

### 1. Survey of the Day Card (Left Panel Top)

```
┌─────────────────────────────────────────┐
│  ⭐ SURVEY OF THE DAY                   │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🌟 [Premium Gold Border]          │ │
│  │                                   │ │
│  │  [Avatar] @SarahsSalon ⭐         │ │
│  │                                   │ │
│  │  "What's your go-to haircare     │ │
│  │   routine for frizzy hair?"       │ │
│  │                                   │ │
│  │  [Hair] 💜 45  📊 120            │ │
│  │                                   │ │
│  │  ← Gradient background (soft)     │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

**Colors:**
- Background: `linear-gradient(135deg, #FFF4E6 0%, #FFE5F4 100%)`
- Border: `2px solid #FFC861`
- Glow: `0 4px 16px rgba(255, 200, 97, 0.3)`

---

### 2. Trending Today Cards (Left Panel Bottom)

```
┌─────────────────────────────────────────┐
│  🔥 TRENDING TODAY                      │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [Avatar] @JohnsSalon              │ │
│  │                                   │ │
│  │ "Best product for curly hair?"    │ │
│  │                                   │ │
│  │ [Hair] 💜 38  📊 95              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [Avatar] @BeautyBar               │ │
│  │                                   │ │
│  │ "Hair coloring tips for summer"   │ │
│  │                                   │ │
│  │ [Hair] 💜 29  📊 78              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [... 3 more cards ...]                │
│                                         │
└─────────────────────────────────────────┘
```

**Styling:**
- White cards
- Purple accent on hover
- 12px gap between cards
- Soft shadow

---

### 3. Trending Week Cards (Right Panel)

```
┌─────────────────────────────────────────┐
│  📈 TRENDING THIS WEEK                  │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ #1 [Avatar] @TopSalon             │ │
│  │                                   │ │
│  │ "Most important salon service?"   │ │
│  │                                   │ │
│  │ [General] 💜 245  📊 890         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ #2 [Avatar] @SpaLife              │ │
│  │                                   │ │
│  │ "Best relaxation technique?"      │ │
│  │                                   │ │
│  │ [Spa] 💜 198  📊 654             │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [... 3 more cards with #3, #4, #5 ...] │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Rank badge (#1, #2, etc.)
- Magenta/pink accent
- Larger numbers (week-long accumulation)

---

## 🎨 MiniSurveyCard Design Specs

### Default State
```css
width: 100%;
height: auto;
min-height: 140px;
background: #FFFFFF;
border: 1px solid #E2E8F0;
border-radius: 12px;
padding: 16px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
transition: all 0.2s ease;
cursor: pointer;
```

### Hover State
```css
transform: translateY(-3px);
box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
border-color: #9B5FFF;
```

### Active/Click State
```css
transform: translateY(-1px) scale(0.98);
```

### Premium Author Border
```css
border: 2px solid;
border-image: linear-gradient(135deg, #FFD700 0%, #FFA500 100%) 1;
```

---

## 🎨 Color Palette

### Primary Colors
```css
--purple-primary: #9B5FFF;
--purple-light: #F5F1FF;
--magenta-primary: #FF37A6;
--magenta-light: #FFE5F4;
--gold-primary: #FFC861;
--gold-light: #FFF4E6;
```

### Text Colors
```css
--text-primary: #1a202c;
--text-secondary: #4a5568;
--text-tertiary: #718096;
--text-white: #FFFFFF;
```

### Background Colors
```css
--bg-page: #f5f7fa;
--bg-card: #FFFFFF;
--bg-panel: #FFFFFF;
```

### Border Colors
```css
--border-light: #E2E8F0;
--border-medium: #CBD5E0;
--border-dark: #A0AEC0;
```

---

## 📏 Spacing Scale

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
```

---

## 🔤 Typography Scale

```css
/* Panel Headers */
--font-panel-header: 18px / 600 / #1a202c;

/* Card Question */
--font-card-question: 14px / 500 / #2D3748;

/* Card Meta (author, stats) */
--font-card-meta: 12px / 400 / #718096;

/* Category Badge */
--font-category: 11px / 600 / #9B5FFF;
```

---

## 🎬 Animation Specifications

### Panel Fade-In
```css
@keyframes panelFadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.survey-insights-panel,
.trending-week-panel {
  animation: panelFadeIn 0.5s ease-out;
}
```

### Card Hover Animation
```css
.mini-survey-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.mini-survey-card:hover {
  transform: translateY(-3px);
}
```

### Stagger Animation
```css
.mini-survey-card:nth-child(1) { animation-delay: 0.1s; }
.mini-survey-card:nth-child(2) { animation-delay: 0.2s; }
.mini-survey-card:nth-child(3) { animation-delay: 0.3s; }
.mini-survey-card:nth-child(4) { animation-delay: 0.4s; }
.mini-survey-card:nth-child(5) { animation-delay: 0.5s; }
```

---

## 📐 Responsive Breakpoints

```css
/* Desktop Large */
@media (min-width: 1400px) {
  .owner-home-page__layout {
    grid-template-columns: 280px 1fr 280px;
  }
}

/* Desktop Small */
@media (min-width: 1200px) and (max-width: 1399px) {
  .owner-home-page__layout {
    grid-template-columns: 240px 1fr 240px;
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1199px) {
  .owner-home-page__layout {
    grid-template-columns: 1fr;
  }

  .owner-home-page__left-panel,
  .owner-home-page__right-panel {
    display: none;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .owner-home-page__layout {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .owner-home-page__left-panel,
  .owner-home-page__right-panel {
    display: none;
  }
}
```

---

## ✅ Final Result Preview

### Before (Current)
```
┌────────────────────────────────────┐
│                                    │
│        [Hero + Search]             │
│                                    │
│   [EMPTY]  [Feed]  [EMPTY]        │
│                                    │
│   [EMPTY]  [Feed]  [EMPTY]        │
│                                    │
│   [EMPTY]  [Feed]  [EMPTY]        │
│                                    │
└────────────────────────────────────┘
```

### After (Enhanced)
```
┌────────────────────────────────────┐
│                                    │
│        [Hero + Search]             │
│                                    │
│ [SOTD]   [Feed]   [Week #1]       │
│ [Today]  [Feed]   [Week #2]       │
│ [Today]  [Feed]   [Week #3]       │
│ [Today]  [Feed]   [Week #4]       │
│ [Today]  [Feed]   [Week #5]       │
│                                    │
└────────────────────────────────────┘
```

**Changes:**
- ✅ Empty space → Valuable insights
- ✅ Zero modification to center feed
- ✅ Sticky panels for easy access
- ✅ Responsive (hidden on mobile)
- ✅ Beautiful, non-overwhelming design

---

## 🎯 User Experience Flow

### 1. Owner Opens Home Page
```
Page loads → Panels fade in → Cards stagger animate
↓
Owner sees: "Oh, Sarah's survey is trending today!"
```

### 2. Owner Explores Trending
```
Hover card → Lifts up → Shows full question
↓
Click → Opens full survey modal
```

### 3. Owner Engages
```
Vote on survey → Love the survey → Comment
↓
Engagement tracked → Feeds personalization algorithm
```

### 4. Owner Feels Motivated
```
"I should create a survey too!"
↓
Click FAB → Create survey
↓
Might appear in trending later
```

---

## ✅ Design Approval Checklist

- [x] Layout preserves existing center content
- [x] Side panels only use empty space
- [x] Design is not overwhelming
- [x] Responsive breakpoints defined
- [x] Color palette harmonious
- [x] Typography hierarchy clear
- [x] Animations smooth and subtle
- [x] Accessibility considered
- [x] Premium features highlighted
- [x] Mobile experience preserved

---

## 🚀 Ready for Implementation

This design is:
- ✅ **Non-invasive** - Zero changes to existing layout
- ✅ **Beautiful** - Premium beauty-tech aesthetic
- ✅ **Functional** - Drives engagement
- ✅ **Responsive** - Works on all devices
- ✅ **Performant** - Lightweight components

**Next Step:** Begin Day 1 backend implementation! 🎉
