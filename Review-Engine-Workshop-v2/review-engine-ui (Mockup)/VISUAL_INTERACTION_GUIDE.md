# Natural Language Interface: Visual & Interaction Guide

## 📐 Interface Layout

### Desktop Layout (1024px+)

```
┌────────────────────────────────────────────────────────┐
│  Header: AI Analytics Assistant                         │
│  "Ask anything about reviews, sentiment, communities"  │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                                                         │
│  [Assistant Avatar] How are we doing?                   │
│  You're doing great! 68% positive, up 5%...            │
│  [Confidence: 96%] [436 data points] [847ms]          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Want to drill into any area?                    │  │
│  │ • See what changed                              │  │
│  │ • Compare communities                           │  │
│  │ • Check on loyalty program                      │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│                                    [User Avatar] ✓      │
│                            How are we doing?           │
│                                                         │
│  [Assistant Avatar] Strong momentum across...          │
│                                                         │
│                                                         │
│                                                         │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Try Asking:                                            │
│  ┌──────────────────┐ ┌──────────────────┐              │
│  │ What happened    │ │ Compare Google   │              │
│  │ with Westside?   │ │ vs Yelp?         │              │
│  └──────────────────┘ └──────────────────┘              │
│                                                         │
│  Input: [What's our sentiment? ........................]│
│  [Send]                                                 │
│                                                         │
│  📊 Sentiment  │ 🗺️  Communities │ 🎁 Loyalty │ 📈 Trends │
└────────────────────────────────────────────────────────┘
```

### Mobile Layout (320px+)

```
┌──────────────────────────┐
│ AI Analytics             │
│ Ask anything about...    │
└──────────────────────────┘

┌──────────────────────────┐
│ [A] How are we doing?    │
│                          │
│ You're doing great!      │
│ 68% positive, up 5%      │
│                          │
│ [96% confident]          │
│                          │
│ Want to drill in?        │
│ • See changes            │
│ • Compare communities    │
│ • Check loyalty          │
│                          │
│                [U] ✓     │
│        How are we...     │
│                          │
│ [A] Strong momentum...   │
│                          │
└──────────────────────────┘

┌──────────────────────────┐
│ Try Asking:              │
│ ┌────────────────────┐   │
│ │ What happened w    │   │
│ │ Westside?         │   │
│ └────────────────────┘   │
│                          │
│ [What's our sentiment?]  │
│          [→]             │
│                          │
│ 📊 Sentiment             │
│ 🗺️  Communities          │
│ 🎁 Loyalty               │
│ 📈 Trends                │
└──────────────────────────┘
```

---

## 🎨 Color & Typography Reference

### Message Styling

**User Message (Right-aligned, Blue)**
```
Background:     #007AFF (Blue 600)
Text:           White (#FFFFFF)
Border-radius:  12px, with rounded corner bottom-right
Padding:        12px 16px
Font:           System font, 14px, regular
```

**Assistant Message (Left-aligned, Gray)**
```
Background:     #F9FAFB (Gray 50)
Border:         1px solid #E5E7EB (Gray 200)
Text:           #111827 (Gray 900)
Border-radius:  12px, with rounded corner bottom-left
Padding:        12px 16px
Font:           System font, 14px, semi-bold (headline)
                System font, 13px, regular (supporting)
```

### Data Display (within message)

```
Key Metric:     Monospace, 16px, bold (#111827)
Supporting:     14px, regular (#4B5563)
Metadata:       12px, regular (#6B7280)
Badges:         12px rounded-full, background with tinted color
```

### Button Styling

**Primary Button (Send)**
```
Background:     #007AFF (Blue 600)
Hover:          #0056B3 (Blue 700)
Active:         Slightly darker
Text:           White, 14px, semi-bold
Padding:        12px 24px
Border-radius:  8px
Cursor:         pointer
Disabled:       #D1D5DB (Gray 300), cursor: not-allowed
```

**Suggestion Button**
```
Background:     #EFF6FF (Blue 50)
Border:         1px #DBEAFE (Blue 200)
Hover:          #BFDBFE (Blue 100)
Text:           #1F2937 (Gray 900)
Border-radius:  8px
Padding:        12px 16px
Font:           13px, regular
Cursor:         pointer
```

---

## 🔄 Interaction Patterns

### Message Send Flow

```
1. User types in input field
   ↓
2. Text appears in input area
3. Send button highlights on hover
   ↓
4. User clicks Send or presses Enter
   ↓
5. Input text moves to chat (blue bubble, right)
6. Input field clears
7. Send button disabled (grayed out)
   ↓
8. Loading indicator appears:
   ┌─────────────────────────┐
   │ [A] •  •  •             │
   │       Analyzing data... │
   └─────────────────────────┘
   (bouncing dots animate)
   ↓
9. Response appears (gray bubble, left)
   ├─ Headline (bold)
   ├─ Insights (bullets)
   ├─ Confidence & metadata (small, gray)
   └─ Follow-up suggestions (blue links)
   ↓
10. Send button re-enabled
11. Input ready for next query
```

### Suggestion Interaction

```
User sees suggestion:
┌──────────────────────────────┐
│ 📊 Show me the trend         │
└──────────────────────────────┘
         ↓ (hover)
┌──────────────────────────────┐
│ 📊 Show me the trend  ✨      │
│ (border: blue, background: lighter)
└──────────────────────────────┘
         ↓ (click)
Input field populates with text:
[Show me the trend ...........................]
         ↓
Ready to send
```

### Accordion (How I Understood)

```
Closed:
┌──────────────────────────────────┐
│ ▶ How I understood this          │
│   (12px gray text, light style)  │
└──────────────────────────────────┘
         ↓ (click)
Open:
┌──────────────────────────────────┐
│ ▼ How I understood this          │
├──────────────────────────────────┤
│ Domain: sentiment analysis       │
│ Action: explain trend            │
│ Confidence: 94%                  │
│                                  │
│ "Analyzing positive sentiment..." │
└──────────────────────────────────┘
```

---

## 📊 Response Examples

### Executive Response (Headline-First)

```
VISUAL:
┌─────────────────────────────────────┐
│ [A] ✓ Overall Health: Strong        │
│                                     │
│ KEY METRICS:                        │
│ Reviews    436  ↑12% (4.65⭐ avg)   │
│ Sentiment  68%  ↑5%  (positive)     │
│ Loyalty    4.8k pts (↑12% month)    │
│                                     │
│ [Sparkline trending up]             │
│                                     │
│ ▶ Want to drill into any area?     │
│   • See what changed                │
│   • Compare communities             │
│   • Check on loyalty                │
│                                     │
│ [96% confident] [436 pts] [847ms]  │
└─────────────────────────────────────┘

COLORS:
- Headline: Bold #111827
- Metric values: Monospace #007AFF
- Trend arrows: Green ↑ (#34C759) or Red ↓ (#FF3B30)
- Badges: Blue tinted background
- Metadata: Gray #6B7280
```

### Manager Response (Action-Focused)

```
VISUAL:
┌──────────────────────────────────────┐
│ [A] 📉 Westside Declining (-8.7%)    │
│                                      │
│ ROOT CAUSES (by impact):             │
│                                      │
│ 1. PARKING (36% of complaints)      │
│    "limited spots", "slow valet"    │
│    → -40% sentiment impact           │
│                                      │
│ 2. RESPONSE TIME (28%)              │
│    "slow wait", "long queue"        │
│    → -28% sentiment impact           │
│                                      │
│ 3. STAFFING (23%)                   │
│    "understaffed", "busy"           │
│    → -23% sentiment impact           │
│                                      │
│ RECOMMENDATIONS:                     │
│ [HIGH] Fix staffing (recovery: 40%) │
│ [MEDIUM] Parking partner (35%)      │
│ [LOW] Messaging (10%)               │
│                                      │
│ Next: Flag for team? Show quotes?   │
│       Compare to Downtown?           │
│                                      │
│ [87% confident] [23 reviews] [1.2s]│
└──────────────────────────────────────┘

COLORS:
- Problem: Orange #FF9500 (warning)
- Causes: Gray with accent bullets
- HIGH impact: Red tinted
- MEDIUM impact: Orange tinted
- Recommendations: Green checkmark
```

### Analyst Response (Data-Heavy)

```
VISUAL:
┌──────────────────────────────────────┐
│ Query Interpretation:                │
│ ├─ Domain: sentiment + themes       │
│ ├─ Filter: keyword=parking, days=30 │
│ ├─ Grouping: by community           │
│ └─ Confidence: 94%                  │
│                                      │
│ RESULTS: 23 reviews analyzed        │
│                                      │
│ Community  Count  Sentiment  Trend   │
│ ─────────────────────────────────   │
│ Downtown   8      7.1 ⭐⭐⭐⭐⭐⭐⭐   ↓  │
│ Midtown    7      7.8 ⭐⭐⭐⭐⭐⭐⭐⭐  → │
│ Uptown     5      8.4 ⭐⭐⭐⭐⭐⭐⭐⭐⭐ ↑ │
│ Westside   3      6.2 ⭐⭐⭐⭐⭐⭐     ↓↓│
│                                      │
│ [Distribution Chart]                │
│                                      │
│ Methodology:                         │
│ Gemini Pro NLP sentiment analysis    │
│ Confidence: 94% (based on validation)│
│ Data points: 23 reviews              │
│                                      │
│ 💡 Westside trending down.          │
│    Suggest investigation.            │
│                                      │
│ Follow-ups:                          │
│ • Show actual parking complaints    │
│ • Compare to prior month             │
│ • Check other location themes        │
│                                      │
│ [94% confident] [23 pts] [1.8s]    │
└──────────────────────────────────────┘

COLORS:
- Data tables: Monospace, clean layout
- Confidence: Green badge #34C759
- Trends: Green ↑ / Red ↓ / Gray →
- Suggestions: Blue links
```

---

## 🎯 Key Interactions Summary

| Interaction | Visual Feedback | Outcome |
|------------|-----------------|---------|
| **Hover suggestion** | Blue border, lighter background | Shows clickability |
| **Click suggestion** | Input field populates | Ready to send |
| **Type in input** | Char counter appears (right) | User aware of length |
| **Send button hover** | Darker blue, shadow | Indicates clickability |
| **Send button disabled** | Gray, not-allowed cursor | Prevents empty submit |
| **Loading state** | Bouncing dots, "Analyzing..." | Shows processing |
| **Message appears** | Smooth fade in | Doesn't startle |
| **Scroll to bottom** | Smooth scroll (chat follows) | Always visible |
| **Confidence badge** | Green checkmark + %  | Signals quality |
| **Expand accordion** | Smooth height transition | Details available |

---

## 🚀 Responsive Behavior

### Breakpoints

```
Mobile (320px - 639px):
├─ Single column layout
├─ Full-width input
├─ Smaller padding (12px)
├─ 2-column suggestion grid
└─ Stacked metadata

Tablet (640px - 1023px):
├─ Wider message area
├─ Better spacing
├─ 2-column capability messages
└─ More breathing room

Desktop (1024px+):
├─ Max-width container (960px)
├─ Centered on screen
├─ Generous padding
├─ 4-column capability grid
└─ Full visual impact
```

### Touch Optimization (Mobile)

```
Button sizes:   44px minimum (44x44 touch target)
Spacing:        16px minimum between interactive elements
Input area:     Larger tap zone (48px height)
Font:           14px minimum (readable without zoom)
Padding:        More generous on mobile (16px vs 12px desktop)
```

---

## 🎬 Animation Timings

```
Smooth Transitions:    0.2s ease-in-out
Hover States:          0.15s
Loading Dots:          0.8s (bounce)
Scroll to Bottom:      0.3s ease-out
Message Fade-in:       0.3s ease-out
Accordion Expand:      0.25s ease-in-out
Button Press:          0.1s scale(0.98)
```

---

## ♿ Accessibility Features

```
Color Contrast:
├─ Blue #007AFF on White: 5.48:1 (AAA)
├─ Gray #6B7280 on White: 8.79:1 (AAA)
└─ All text meets WCAG AA minimum 4.5:1

Keyboard Navigation:
├─ Tab between messages and buttons
├─ Enter to send (in input field)
├─ Focus visible (blue outline)
├─ No keyboard traps

Screen Readers:
├─ Semantic HTML (header, main, footer)
├─ ARIA labels for icons
├─ Message roles defined
├─ Confidence badges described

Focus Management:
├─ Focus visible on all buttons (blue outline, 2px)
├─ Skip to content link (optional)
├─ Logical tab order
└─ Focus returns to input after send
```

---

## 🔍 Testing Checklist

### Visual Testing
- [ ] Messages appear with correct colors/sizes
- [ ] Suggestions highlight on hover
- [ ] Loading indicator animates smoothly
- [ ] Responsive at all breakpoints
- [ ] No text overflow in any view
- [ ] Icons render correctly

### Interaction Testing
- [ ] Send button works with click
- [ ] Send button works with Enter key
- [ ] Suggestions populate input
- [ ] Scroll follows new messages
- [ ] Loading state shows during processing
- [ ] Confidence badges display

### Accessibility Testing
- [ ] Tab navigation works smoothly
- [ ] Focus indicators visible
- [ ] Color not only differentiator
- [ ] Keyboard-only navigation possible
- [ ] Screen reader friendly

### Performance Testing
- [ ] No layout shift (CLS)
- [ ] Scroll smooth (60fps)
- [ ] Input responsive (<100ms)
- [ ] Animations jank-free

---

This visual guide ensures consistent, polished implementation across all devices and states.
