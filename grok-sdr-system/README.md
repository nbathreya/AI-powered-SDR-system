# Grok SDR System

An AI-powered Sales Development Representative (SDR) system built with Grok AI, designed to streamline lead qualification, personalized messaging, and sales pipeline management.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-teal)
![React](https://img.shields.io/badge/React-18+-blue)

## 🚀 Overview

The Grok SDR System leverages Grok AI as its core intelligence layer to automate and enhance the sales development process. It provides intelligent lead scoring, context-aware message generation, automated pipeline progression, and comprehensive activity tracking—all through an intuitive, modern interface designed for sales teams.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Grok API Integration](#-grok-api-integration)
- [Model Evaluation Framework](#-model-evaluation-framework)
- [Lead Qualification & Management](#-lead-qualification--management)
- [Personalized Messaging](#-personalized-messaging)
- [User Interface](#-user-interface)
- [Data Management](#-data-management)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Future Enhancements](#-future-enhancements)

---

## ✨ Key Features

### 🤖 AI-Powered Intelligence
- **Grok AI Integration** - Core intelligence layer for lead scoring and message generation
- **Context-Aware Messaging** - Pipeline stage-aware message generation
- **Intelligent Lead Scoring** - Multi-factor assessment with customizable weights
- **Message Tune-Up** - AI-powered message revision based on user feedback

### 📊 Lead Management
- **Smart Lead Scoring** - Automated scoring with detailed reasoning
- **Customizable Scoring Criteria** - User-defined importance weights (company size, job title, industry, engagement)
- **7-Stage Pipeline** - New → Qualified → Contacted → Meeting → Negotiation → Closed Won/Lost
- **Automated Stage Progression** - Auto-qualification (score ≥80) and auto-contacted (message sent)
- **Multi-Select Operations** - Batch delete and manage multiple leads
- **Soft Delete with Restore** - Non-destructive deletion with audit trail

### 💬 Personalized Messaging
- **Context-Aware Generation** - Messages adapt to pipeline stage and relationship history
- **6 Message Types** - Initial outreach, follow-up, meeting request, value proposition, casual check-in, problem-solution
- **Stage-Specific Recommendations** - Intelligent message type suggestions based on lead status
- **AI Message Tuning** - Revise messages with natural language instructions
- **Message History** - Complete record of all generated and tuned messages

### 🔍 Advanced Search & Filtering
- **Full-Text Search** - Search across name, email, company, industry, job title, and notes
- **Advanced Filters** - Filter by company, industry, date range, and score range
- **Pipeline Stage Filtering** - Click stat boxes to filter by stage
- **Real-Time Updates** - Instant filtering as you type
- **Combined Filters** - All filters work together seamlessly

### 📈 Analytics & Tracking
- **Pipeline Analytics** - Real-time stats with average scores per stage
- **Activity Timeline** - Chronological history of all lead interactions
- **Detailed Activity Logging** - Lead creation, scoring, messaging, stage changes, deletions
- **Color-Coded Events** - Visual icons for different activity types
- **Audit Trail** - Complete history for compliance and review

### 🎨 Modern User Interface
- **Ford F-150 Lightning Antimatter Blue Theme** - Professional dark blue with teal highlights
- **Responsive Design** - Scales perfectly with browser window
- **Intuitive Navigation** - Clean, modern layout with easy access to all features
- **Visual Feedback** - Hover effects, transitions, and loading states
- **Collapsible Sections** - Activity timeline, advanced filters toggle
- **Interactive Stats** - Clickable pipeline stage boxes

---

## 🔌 Grok API Integration

### Core Intelligence Layer

The Grok API serves as the primary AI engine, powering all intelligent features through optimized prompt engineering and comprehensive response validation.

#### 1. Lead Scoring with Grok
**Multi-Factor Assessment:**
- Company size evaluation
- Job title relevance analysis  
- Industry fit scoring
- Engagement level assessment

**Customizable Weights:**
- Users define importance of each factor
- Real-time re-scoring with new criteria
- Detailed AI-generated reasoning for each score

**Implementation:**
```python
# Grok receives:
- Lead data (company, title, industry, notes)
- Custom scoring weights
- Target industry information

# Grok returns:
- Numerical score (0-100)
- Detailed reasoning
- Specific factor breakdowns
```

#### 2. Message Generation with Grok
**Context-Aware Intelligence:**
- Pipeline stage consideration
- Lead relationship history
- Industry-specific personalization
- Role-appropriate messaging

**6 Message Types:**
Each type has optimized prompts for tone, length, and goals:
- Initial Outreach
- Follow-Up
- Meeting Request
- Value Proposition
- Casual Check-In
- Problem-Solution

#### 3. Message Tuning with Grok
**AI-Powered Revision:**
- Takes original message + user instructions
- Maintains core value proposition
- Adjusts tone, length, focus per instructions
- Returns polished revision

### Optimized Prompt Engineering

#### Lead Scoring Prompts
```python
system_prompt = """You are an expert sales qualification analyst.
Assess leads based on:
- Company size and growth potential
- Decision-maker access (job title)
- Industry fit and relevance
- Engagement signals

Provide:
- Numerical score (0-100)
- Clear reasoning
- Actionable insights
"""

# Stage-specific context added for accuracy
```

#### Message Generation Prompts
```python
# Stage contexts prevent generic messaging:
stage_contexts = {
    "new": "First contact, make great impression",
    "contacted": "Acknowledge prior communication",
    "meeting": "Reference meetings, build momentum",
    "negotiation": "Focus on ROI, pricing, closing - NOT product intro",
    "closed_won": "Customer success, relationship building",
    "closed_lost": "Keep door open, non-pushy"
}

# Critical instruction:
"Make sure message reflects where lead is in sales process.
If negotiation stage, don't introduce product - they know it.
Focus on closing, ROI, addressing concerns."
```

### Comprehensive Response Validation

#### 1. Error Handling
- API timeout handling (30s default)
- Network error recovery
- Malformed response detection
- Fallback message system

#### 2. Response Validation
```python
# Required fields validated:
- subject (string, non-empty)
- content (string, 50+ chars)
- key_points (array)
- follow_up_timing (integer, days)

# Quality checks:
- Appropriate tone for stage
- Personalization present
- Call-to-action included
```

#### 3. Fallback Mechanisms
```python
# If Grok API fails:
- Use template-based fallback messages
- Log failure for monitoring
- Display user-friendly error
- Preserve lead data integrity
- Allow retry
```

---

## 📊 Model Evaluation Framework

### Systematic Prompt Engineering

The system includes comprehensive mechanisms for evaluating and continuously improving Grok's performance.

#### 1. Data Collection for Evaluation

**Score Reasoning Capture:**
- Every lead score includes detailed AI reasoning
- Reasoning stored in database for analysis
- Displayed in UI for qualitative review
- Enables feedback loop for prompt refinement

**Message Quality Tracking:**
- All generated messages stored with metadata
- User tune-up requests captured (what to change)
- Success/failure rates logged
- Performance metrics monitored

#### 2. Evaluation Framework Components

##### Lead Scoring Evaluation Tests

**Test Case Categories:**
```python
test_cases = {
    "high_value": {
        # C-level at Fortune 500 tech companies
        "expected": 85-100,
        "focus": "Proper weight to seniority and company size"
    },
    "low_value": {
        # Junior roles at small companies
        "expected": 0-30,
        "focus": "Appropriate low scoring"
    },
    "edge_cases": {
        # Missing data, unclear fit
        "expected": "Reasonable handling",
        "focus": "Graceful degradation"
    },
    "consistency": {
        # Same lead scored multiple times
        "expected": "±5 points variance",
        "focus": "Scoring stability"
    }
}
```

**Metrics Tracked:**
- Score distribution across leads
- Reasoning quality and clarity
- Scoring time (API performance)
- User override frequency (disagreement indicator)
- Auto-qualification accuracy

##### Message Generation Evaluation Tests

**Test Scenarios:**
```python
scenarios = {
    "stage_awareness": [
        ("new", "initial_outreach", "Should introduce company"),
        ("negotiation", "value_proposition", "Should focus on ROI, not intro"),
        ("closed_lost", "follow_up", "Should be non-pushy")
    ],
    "personalization": [
        ("complete_data", "High personalization expected"),
        ("minimal_data", "Generic but professional expected")
    ],
    "tone_appropriateness": [
        ("initial_outreach", "Professional and friendly"),
        ("negotiation", "Consultative and direct")
    ]
}
```

**Quality Criteria:**
- Personalization accuracy (uses company, title correctly)
- Tone matches stage and message type
- Call-to-action clarity and appropriateness
- Length within specified range (2-4 paragraphs)
- Professional quality (grammar, structure)

#### 3. Qualitative Analysis Process

**Underperformance Identification Methods:**

1. **Score Reasoning Review**
   - Manual review of 50+ scoring explanations
   - Check for accuracy, relevance, actionability
   - Identify patterns in poor reasoning

2. **Message Relevance Checks**
   - Sample messages from each pipeline stage
   - Verify stage-appropriate content
   - Ensure no product re-introduction in late stages

3. **User Tune-Up Pattern Analysis**
   - Common revision requests indicate gaps
   - "Make more formal" → tone calibration needed
   - "Add ROI focus" → missing in negotiation stage

4. **Activity Log Analysis**
   - Identify stages where leads get stuck
   - Correlate with message quality
   - Find conversion bottlenecks

**Specific Issues Identified & Solutions:**

| Issue Found | Root Cause | Solution Implemented |
|-------------|------------|---------------------|
| Generic messages regardless of stage | Prompt lacked stage context | Added stage-specific instructions with examples |
| Product introduction during negotiation | No explicit constraint | Added "CRITICAL: Don't introduce if negotiation stage" |
| Inconsistent tone | Template specs too vague | Detailed tone definitions per message type |
| Missing personalization | Lead context not emphasized | Enhanced lead data prominence in prompts |
| Overly long messages | No length enforcement | Added paragraph count guidelines and examples |

#### 4. Continuous Improvement Process

**Prompt Iteration Cycle:**
```
1. Deploy prompt version
2. Collect performance data (1-2 weeks)
3. Analyze metrics and user feedback
4. Identify specific weaknesses
5. Update prompts with targeted fixes
6. A/B test new vs old (if possible)
7. Deploy improved version
8. Repeat
```

**Actionable Recommendations Implemented:**

1. **Stage Context Enhancement**
   - ✅ Added stage_contexts dictionary with explicit instructions
   - ✅ Included stage in lead_context sent to Grok
   - ✅ Added examples of good/bad messages per stage

2. **Example-Driven Prompts**
   - ✅ Critical section with stage-specific examples
   - 🔄 Future: Few-shot examples for edge cases

3. **Reasoning Chain Improvements**
   - ✅ Request detailed reasoning breakdown
   - 🔄 Future: Ask for step-by-step thinking

4. **Constraint Enforcement**
   - ✅ Explicit "CRITICAL" section in prompts
   - ✅ Stage-specific do's and don'ts
   - ✅ Clear boundaries (e.g., "Never introduce product in negotiation")

#### 5. Future Evaluation Enhancements

**Planned Implementations:**

1. **Feedback Loop System**
   - User ratings for generated messages (👍/👎)
   - Collect correction data
   - Train on successful patterns

2. **Automated Eval Suite**
   ```python
   # Test suite structure:
   class GrokEvaluationSuite:
       def test_scoring_consistency(self):
           # Score same lead 10 times, check variance
       
       def test_stage_awareness(self):
           # Verify messages match pipeline stage
       
       def test_personalization(self):
           # Check company/title usage
       
       def test_fallback_quality(self):
           # Ensure graceful API failure handling
   ```

3. **Performance Dashboard**
   - Real-time Grok API success rates
   - Average score distribution
   - Message generation times
   - User satisfaction metrics

4. **Prompt Versioning System**
   - Track prompt changes over time
   - Correlate changes with performance
   - Enable rollback if degradation occurs

---

## 🎯 Lead Qualification & Management

### Intelligent Lead Assessment

#### Multi-Factor Scoring System

The system evaluates leads using Grok AI across four customizable dimensions:

**1. Company Size (Weight: User-Defined)**
```python
Evaluation Logic:
- Enterprise (1000+ employees): Highest scores
- Mid-market (100-1000): Moderate scores
- SMB (<100): Lower scores but not excluded
- Considers growth stage, funding, market presence
```

**2. Job Title Relevance (Weight: User-Defined)**
```python
Decision-Maker Tiers:
- C-Suite (CEO, CTO, CFO): 90-100 points
- VP/Director: 70-90 points
- Manager/Team Lead: 50-70 points
- Individual Contributor: 20-50 points
- Considers: Decision authority, budget control, influence
```

**3. Industry Relevance (Weight: User-Defined)**
```python
Industry Fit Assessment:
- Target industries (SaaS, Tech, etc.): High scores
- Adjacent industries: Moderate scores
- Non-target industries: Lower scores
- Factors: Market trends, typical budget, pain points
```

**4. Engagement Level (Weight: User-Defined)**
```python
Engagement Signals:
- Notes indicate pain points: +15 points
- Previous positive interactions: +20 points
- Proactive inquiry: +25 points
- Cold outreach: Baseline
```

#### User-Defined Scoring Criteria

**How It Works:**

1. **Access Scoring Settings**
   - Click "⚙️ Scoring Settings" button
   - Modern modal opens with sliders

2. **Adjust Importance Weights**
   - Four sliders with number inputs
   - Range: 0-100% for each factor
   - Real-time validation (must total 100%)
   - Visual feedback on total

3. **Apply New Criteria**
   - Click "Save Settings"
   - Re-score all leads with new weights
   - Instant UI updates

**Use Case Examples:**

```python
# Enterprise-focused sales team:
scoring_criteria = {
    "company_size_weight": 0.50,      # 50%
    "job_title_weight": 0.25,         # 25%
    "industry_relevance_weight": 0.15, # 15%
    "engagement_weight": 0.10          # 10%
}

# Vertical SaaS (industry-specific):
scoring_criteria = {
    "company_size_weight": 0.15,
    "job_title_weight": 0.25,
    "industry_relevance_weight": 0.50,  # 50% - most important!
    "engagement_weight": 0.10
}

# Inbound lead qualification:
scoring_criteria = {
    "company_size_weight": 0.20,
    "job_title_weight": 0.20,
    "industry_relevance_weight": 0.20,
    "engagement_weight": 0.40  # 40% - engagement signals matter most
}
```

### 7-Stage Sales Pipeline

```
┌────────┐   ┌───────────┐   ┌───────────┐   ┌─────────┐
│  New   │──>│ Qualified │──>│ Contacted │──>│ Meeting │
└────────┘   └───────────┘   └───────────┘   └─────────┘
                                                    │
                                                    ▼
┌────────────┐   ┌─────────────┐          ┌─────────────┐
│ Closed Won │<──│ Negotiation │          │ Closed Lost │
└────────────┘   └─────────────┘          └─────────────┘
```

**Stage Definitions:**

| Stage | Definition | Typical Activities |
|-------|-----------|-------------------|
| **New** | Freshly added, not yet assessed | Lead creation, initial research |
| **Qualified** | Assessed as good fit (score ≥80 or manual) | Preparation for outreach |
| **Contacted** | Initial outreach sent | Awaiting response, planning follow-up |
| **Meeting** | Meeting scheduled or occurred | Demo prep, discovery call, proposal |
| **Negotiation** | Active deal discussions | Pricing, implementation, closing |
| **Closed Won** | Deal successful, now customer | Onboarding, success planning |
| **Closed Lost** | Deal lost, future opportunity | Relationship maintenance, re-engagement |

### Automated Pipeline Progression

#### Rule-Based Automation

**1. Score-Based Auto-Qualification**
```python
Trigger: Lead scores ≥ 80
Condition: Current stage is "new"
Action: Auto-move to "qualified"
Logging: Activity recorded with score and reasoning

Example Activity Log:
"Auto-qualified based on high score (87)"
"Automatically moved to Qualified stage due to score >= 80"
```

**2. Message-Based Auto-Contact**
```python
Trigger: Initial outreach message generated
Condition: Current stage is "new" or "qualified"
Action: Auto-move to "contacted"
Logging: Activity recorded with message subject

Example Activity Log:
"Auto-moved to Contacted after initial_outreach message generated"
"Automatically moved to Contacted stage after initial outreach message was created"
```

**Benefits of Automation:**
- ✅ Reduces manual stage updates (saves time)
- ✅ Ensures consistent pipeline management
- ✅ Provides complete audit trail
- ✅ Prevents human error
- ✅ Enables accurate metrics

### Detailed Activity History & Interaction Logging

#### Comprehensive Event Tracking

**Automatically Logged Events:**

1. **Lead Created**
   ```
   Icon: 👤 (Teal)
   Description: "Lead John Smith was created"
   Notes: "Company: Acme Corp, Job Title: VP of Sales"
   Timestamp: Jan 15, 2025, 3:45 PM
   ```

2. **Lead Scored**
   ```
   Icon: ⭐ (Purple)
   Description: "Lead scored: 87/100 (was 0)"
   Notes: "Strong company fit (Enterprise, 2000 employees). VP-level decision maker..."
   Timestamp: Jan 15, 2025, 3:45 PM
   ```

3. **Message Generated**
   ```
   Icon: 💬 (Blue)
   Description: "Initial Outreach message generated"
   Notes: "Subject: Quick question for Acme Corp, John"
   Timestamp: Jan 15, 2025, 4:12 PM
   ```

4. **Message Tuned**
   ```
   Icon: ✏️ (Orange)
   Description: "Message tuned based on feedback"
   Notes: "Instructions: Make it more formal and add ROI focus"
   Timestamp: Jan 15, 2025, 4:15 PM
   ```

5. **Stage Changed (Manual)**
   ```
   Icon: ➡️ (Green)
   Description: "Stage changed to meeting"
   Notes: "Demo scheduled for Friday at 2pm"
   Timestamp: Jan 16, 2025, 10:30 AM
   ```

6. **Stage Changed (Auto)**
   ```
   Icon: ⚡ (Green with lightning)
   Description: "Auto-qualified based on high score (87)"
   Notes: "Automatically moved to Qualified stage due to score >= 80"
   Timestamp: Jan 15, 2025, 3:45 PM
   ```

7. **Lead Deleted**
   ```
   Icon: 🗑️ (Red)
   Description: "Lead John Smith was deleted"
   Notes: "Email: john.smith@acme.com"
   Timestamp: Jan 20, 2025, 9:00 AM
   ```

#### Activity Timeline UI Features

**Visual Design:**
- Vertical timeline with connector lines
- Circular icon badges (color-coded)
- Card-style activity items
- Scrollable (max 400px height)
- Custom scrollbar styling

**Interaction:**
- Collapsible (toggle show/hide)
- Most recent activities first
- Full detail on click/expand
- Links to related messages

**Data Integrity:**
- Complete audit trail for compliance
- Non-editable (append-only)
- Timestamped (UTC)
- User attribution (future: when auth added)

### Pipeline Monitoring & Analytics

#### Real-Time Statistics

**Pipeline Stats Display:**
```
┌─────────────┬──────────────┬──────────────┬──────────┐
│ New: 5      │ Qualified: 3 │ Contacted: 8 │ Meeting: 4 │
│ Avg: 65.2   │ Avg: 84.7    │ Avg: 72.3    │ Avg: 81.5  │
└─────────────┴──────────────┴──────────────┴──────────┘
```

**Interactive Features:**
- **Click to Filter**: Click any box to filter leads by that stage
- **Active Highlighting**: Selected stage gets teal gradient background
- **Show All**: Purple "Show All" button appears when filtering
- **Combined Filtering**: Works with search and advanced filters
- **Real-Time Updates**: Stats refresh after any pipeline change

---

## 💬 Personalized Messaging

### Context-Aware Message Generation

The system's most powerful feature: messages that intelligently adapt to where the lead is in the sales journey.

#### Pipeline Stage Intelligence

**How It Works:**
1. System checks lead's `pipeline_stage`
2. Loads stage-specific context for Grok
3. Grok generates message appropriate for relationship status
4. User gets contextually perfect message

**Stage Context Examples:**

**New/Qualified Stage:**
```python
Context: "First contact - make great impression"

Generated Message Example:
---
Subject: Quick question for Acme Corp, John

Hi John,

I noticed you're VP of Sales at Acme Corp. Companies in the technology
industry often struggle with lengthy sales cycles and manual lead qualification.

Our AI-powered platform has helped similar companies reduce qualification
time by 70% while increasing conversion rates. I'd love to share how we
specifically helped a company similar to yours achieve these results.

Would you be open to a brief 15-minute call next week?

Best regards,
[Your Name]
---
```

**Contacted Stage:**
```python
Context: "Acknowledge prior communication, move forward"

Generated Message Example:
---
Subject: Following up - Acme Corp

Hi John,

I wanted to follow up on my previous message about helping Acme Corp
streamline your sales process.

I understand you're busy, so I'll keep this brief. Based on what I know
about your role and Acme's growth trajectory, I think there's real value
in exploring how we've helped similar VPs of Sales cut qualification
time in half.

Would a quick 10-minute call make sense?

Looking forward to hearing from you.

Best,
[Your Name]
---
```

**Negotiation Stage:**
```python
Context: "They know the product - focus on ROI, closing, addressing concerns"

Generated Message Example:
---
Subject: Implementation timeline & ROI breakdown

Hi John,

Following up on our discussion about Acme Corp's implementation needs.

Based on your team size (12 SDRs) and current qualification rate, here's
a realistic ROI projection:

- Month 1-2: Onboarding and integration ($0 productivity gain)
- Month 3-6: Ramp up (20-30% efficiency increase)
- Month 6+: Full adoption (65-75% time savings on qualification)

For your specific case, this translates to approximately 8 hours/week
saved per SDR, allowing them to focus on high-value conversations rather
than initial screening.

Regarding your question about data migration from Salesforce - that's
a standard 2-week process on our end with zero downtime for your team.

Happy to jump on a call this week to finalize details and address any
remaining questions.

Best,
[Your Name]
---

Note: No product introduction! They're negotiating - they know what it is.
Focus is on implementation details, ROI, and closing.
```

### 6 Specialized Message Types

Each type has optimized tone, length, and goal definitions for Grok:

#### 1. Initial Outreach
- **Tone**: Professional and friendly
- **Goal**: Introduce solution and gauge interest
- **Length**: 3-4 paragraphs
- **Best For**: New or Qualified leads
- **Includes**: Company/role personalization, value prop, soft CTA

#### 2. Follow-Up
- **Tone**: Warm and persistent
- **Goal**: Re-engage and offer value
- **Length**: 2-3 paragraphs
- **Best For**: Contacted leads (no response)
- **Includes**: Reference to previous message, new angle, ask

#### 3. Meeting Request
- **Tone**: Confident and direct
- **Goal**: Schedule a meeting or demo
- **Length**: 2-3 paragraphs
- **Best For**: Contacted or Meeting stage
- **Includes**: Specific time suggestions, agenda preview, easy yes

#### 4. Value Proposition
- **Tone**: Consultative and insightful
- **Goal**: Demonstrate specific value for their business
- **Length**: 3-4 paragraphs
- **Best For**: Any stage (versatile)
- **Includes**: Industry-specific benefits, ROI data, case study hint

#### 5. Casual Check-In
- **Tone**: Informal and conversational
- **Goal**: Maintain relationship without being pushy
- **Length**: 2 paragraphs
- **Best For**: Closed Won or Closed Lost
- **Includes**: Relevant insight/content, soft offer to chat

#### 6. Problem-Solution
- **Tone**: Educational and helpful
- **Goal**: Address a specific pain point with our solution
- **Length**: 3-4 paragraphs
- **Best For**: New, Qualified, or Contacted
- **Includes**: Pain point articulation, solution mapping, proof

### Intelligent Message Recommendations

**Dynamic UI Based on Pipeline Stage:**

When a lead is selected, the system shows **3 recommended message types** with the top choice starred:

```python
Recommendations by Stage:

New/Qualified:
  ⭐ Initial Outreach (highlighted with teal border)
  - Value Proposition
  - Problem-Solution

Contacted:
  ⭐ Follow-Up (highlighted)
  - Value Proposition
  - Meeting Request

Meeting:
  ⭐ Meeting Confirmation (highlighted)
  - Pre-Meeting Info
  - Meeting Follow-Up

Negotiation:
  ⭐ Value Summary (highlighted)
  - Negotiation Follow-Up
  - Address Concerns

Closed Won:
  ⭐ Thank You Note (highlighted)
  - Onboarding Check-In
  - Success Story

Closed Lost:
  ⭐ Stay in Touch (highlighted)
  - Re-engagement
  - New Value Prop
```

**Visual Indicators:**
- ⭐ Star icon on recommended option
- Teal border highlight
- Bold font weight
- Positioned first in list

### AI Message Tuning System

**User-Driven Refinement Process:**

1. **Generate Initial Message**
   ```
   User clicks: "Initial Outreach"
   Grok generates: Professional 3-paragraph intro
   User reviews: "Good, but needs to be more formal"
   ```

2. **Enter Tuning Instructions**
   ```
   Textarea input examples:
   - "Make it more formal"
   - "Add specific focus on ROI and cost savings"
   - "Shorten to 2 paragraphs"
   - "Remove the second paragraph about the demo"
   - "Change tone to be more urgent"
   - "Include a reference to their recent funding round"
   ```

3. **AI Revises Message**
   ```python
   Grok receives:
   - Original message
   - User's instructions
   - Lead context
   
   Grok maintains:
   - Core value proposition
   - Personalization elements
   - Professional quality
   
   Grok adjusts:
   - Tone/formality
   - Length/structure
   - Focus areas
   - Specific elements per instructions
   ```

4. **Review & Save**
   ```
   Tuned message displayed
   Both versions saved to database
   Activity logged: "Message tuned based on feedback"
   Notes include: User's instructions
   ```

**Tuning Activity Tracking:**
- Original message preserved
- Revision instructions saved
- Timestamp recorded
- Visible in activity timeline
- Searchable message history

### Message History & Version Control

**Complete Message Archive:**

```python
Database Schema:
messages:
  - id
  - lead_id (foreign key)
  - message_type ("initial_outreach", "follow_up_tuned", etc.)
  - subject
  - content
  - created_at
  - sent (datetime, nullable - for future email integration)
```

**Viewing Message History:**
```
GET /api/leads/{lead_id}/messages

Returns chronological list:
[
  {
    "id": 1,
    "message_type": "initial_outreach",
    "subject": "Quick question for Acme Corp",
    "content": "Hi John, I noticed...",
    "created_at": "2025-01-15T15:45:00Z"
  },
  {
    "id": 2,
    "message_type": "initial_outreach_tuned",
    "subject": "Regarding Acme Corp's sales optimization",
    "content": "Dear John, I hope this message...",
    "created_at": "2025-01-15T15:50:00Z"
  }
]
```

**Benefits:**
- Never lose a good message
- Learn what resonates (future: add ratings)
- Consistency across sales team
- Training material for new SDRs
- Compliance documentation
- A/B testing insights (future)

---

## 🎨 User Interface

### Design Philosophy: Built for Sales Teams

**Core Principles:**
1. **Minimal Clicks** - Most tasks achievable in 1-3 clicks
2. **Clear Hierarchy** - Important info prominent, details accessible
3. **Instant Feedback** - Every action gets visual confirmation
4. **Zero Complexity** - No training required for basic use
5. **Professional Aesthetic** - Inspires confidence with clients

### Visual Design: Ford F-150 Lightning Antimatter Blue

**Color Palette:**
```css
Primary:
- Deep Blue: #0e3b4d, #0a1628, #0d1b2a
- Teal Accent: #14b8a6, #0d9488
- White: #ffffff (cards, backgrounds)
- Gray: #64748b, #94a3b8 (text, borders)

Semantic Colors:
- Success: #10b981 (green)
- Warning: #f59e0b (orange)
- Error: #ef4444 (red)
- Info: #06b6d4 (cyan)
```

**Background:**
```css
Dual radial gradients:
1. Ellipse at top-left: Dark blue to near-black
2. Ellipse at bottom-right: Teal to dark blue

Blend mode: Screen
Effect: Professional, high-tech, modern
Attachment: Fixed (no scroll)
```

### Intuitive Navigation

#### Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  HEADER                                             │
│  Grok SDR System - AI-Powered Sales Development    │
├─────────────────────────────────────────────────────┤
│  ACTION BAR (Centered)                              │
│  [+ Add Lead] [⚡ Score All] [⚙️ Settings] [↻ Refresh] │
├─────────────────────────────────────────────────────┤
│  PIPELINE STATS (Clickable Cards)                   │
│  [New: 5] [Qualified: 3] [Contacted: 8] [Meeting: 4] │
│  [Avg: 65]  [Avg: 85]    [Avg: 72]     [Avg: 82]    │
├───────────────────────┬─────────────────────────────┤
│   LEADS LIST (Left)   │   LEAD DETAILS (Right)      │
│ ┌─────────────────┐   │ ┌─────────────────────────┐ │
│ │ Search & Filter │   │ │ Name, Company, Email    │ │
│ └─────────────────┘   │ │ Score & Reasoning       │ │
│ ┌─────────────────┐   │ ├─────────────────────────┤ │
│ │ ☐ John Smith    │ ✓ │ │ Activity Timeline       │ │
│ │   VP Sales      │   │ │ - Created (3:45 PM)     │ │
│ │   Acme Corp     │   │ │ - Scored: 87/100        │ │
│ │   Score: 87 🟢   │   │ │ - Message generated     │ │
│ └─────────────────┘   │ └─────────────────────────┘ │
│ ┌─────────────────┐   │ ┌─────────────────────────┐ │
│ │ ☐ Jane Doe      │   │ │ Generate Message        │ │
│ │   Director      │   │ │ Recommended for Meeting │ │
│ │   Tech Inc      │   │ │ [⭐ Meeting Confirm]     │ │
│ │   Score: 72 🟡   │   │ │ [Pre-Meeting Info]      │ │
│ └─────────────────┘   │ │ [Meeting Follow-Up]     │ │
│                       │ └─────────────────────────┘ │
└───────────────────────┴─────────────────────────────┘
              (50/50 split, responsive)
```

### Key UX Features

#### 1. Search & Filtering System

**Quick Search Bar:**
```
┌─────────────────────────────────────────────┐
│ 🔍 Search leads by name, email, company...  │ [X] [⚙]
└─────────────────────────────────────────────┘
  │                                            │   │
  └─ Search icon                               │   │
                                               │   │
                               Clear button ───┘   │
                                                   │
                          Advanced filters toggle ─┘
```

**Features:**
- Real-time filtering as you type
- Searches 7 fields (name, email, company, title, industry, notes)
- Clear button (X) appears when active
- Advanced filter toggle (funnel icon)

**Advanced Filters Panel:**
```
┌─────────────────────────────────────────────┐
│  Company    [________________]              │
│  Industry   [________________]              │
│  Date From  [mm/dd/yyyy] To [mm/dd/yyyy]    │
│  Min Score  [___] Max Score [___]           │
└─────────────────────────────────────────────┘
```

**Filter Behavior:**
- All filters combine (AND logic)
- Real-time updates
- Works with stage filtering
- Preserved during navigation

#### 2. Interactive Pipeline Stats

**Click to Filter:**
```
Click [New: 5] → Shows only New leads
Click again → Toggles off
Click [Show All] → Clears stage filter
```

**Visual Feedback:**
- Active filter: Teal gradient background
- Hover: Raised shadow, lighter border
- Show All: Purple gradient (stands out)
- Smooth transitions

#### 3. Multi-Select Operations

**Checkbox Selection:**
```
☐ Lead 1
☑ Lead 2  ← Selected
☑ Lead 3  ← Selected
☐ Lead 4

Header shows: [🗑️ (2)] Delete selected leads
```

**Features:**
- Click checkbox to toggle
- Click lead name to view details
- Batch delete selected
- Selection persists across filters
- Clear indication of count

#### 4. Contextual Actions

**Stage Dropdown:**
```
Lead Item:
┌─────────────────────────────────┐
│ John Smith              [New ▼] │ ← Click to change
│ VP Sales, Acme Corp             │
│ john@acme.com          Score: 87│
└─────────────────────────────────┘
```

**Message Buttons:**
```
Lead in "Negotiation" stage shows:
┌──────────────────────────────────┐
│ Recommended for Negotiation      │
│ [⭐ Value Summary]      ← Starred │
│ [Negotiation Follow-Up]          │
│ [Address Concerns]               │
└──────────────────────────────────┘
```

#### 5. Visual Feedback System

**Loading States:**
```
Full-screen overlay (translucent teal):
┌─────────────────────────────┐
│                             │
│     ⏳ Loading spinner       │
│  Generating personalized    │
│  initial outreach...        │
│                             │
└─────────────────────────────┘
```

**Toast Notifications:**
```
Top-right corner:
┌────────────────────────────┐
│ ✓ Lead created successfully│ ← Success (green)
└────────────────────────────┘

┌────────────────────────────┐
│ ✗ Failed to generate message│ ← Error (red)
└────────────────────────────┘
```

**Hover Effects:**
- Buttons: Slight raise, shadow increase
- Cards: Border color change
- Dropdowns: Background tint
- All: Smooth 200ms transitions

### Responsive Design

**Browser Window Scaling:**
```css
Width: 98% (not fixed)
No max-width constraints
Grid columns: Responsive (1fr 1fr)
Breakpoints: 1200px, 768px, 480px
```

**Mobile Responsive:**
- < 1200px: Single column layout
- < 768px: Simplified header, stacked buttons
- < 480px: Full mobile optimization

**Maintains:**
- Aspect ratios
- Readability
- Touch targets (44px minimum)
- Functionality across devices

---

## 💾 Data Management

### Database Architecture: SQLite

**File-Based Database:** `leads.db`
- Location: Backend root directory
- Type: SQLite (SQLAlchemy ORM)
- Production-ready: Can migrate to PostgreSQL

#### Complete Schema

##### Leads Table
```sql
CREATE TABLE leads (
    -- Identity
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Basic Information (Required)
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    
    -- Contact Details (Optional)
    phone VARCHAR,
    
    -- Company Information (Optional but recommended)
    company VARCHAR,
    job_title VARCHAR,
    industry VARCHAR,
    company_size VARCHAR,
    location VARCHAR,
    website VARCHAR,
    linkedin_url VARCHAR,
    
    -- Scoring Data
    score FLOAT DEFAULT 0.0,
    score_reasoning TEXT,
    
    -- Pipeline Management
    pipeline_stage VARCHAR DEFAULT 'new',
    notes TEXT,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Soft Delete (Audit Trail)
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    deleted_by VARCHAR,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_is_deleted (is_deleted),
    INDEX idx_pipeline_stage (pipeline_stage),
    INDEX idx_created_at (created_at)
);
```

##### Messages Table
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    message_type VARCHAR NOT NULL,  -- 'initial_outreach', 'follow_up_tuned', etc.
    subject VARCHAR,
    content TEXT NOT NULL,
    sent DATETIME,  -- For future email integration
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_lead_id (lead_id),
    INDEX idx_created_at (created_at)
);
```

##### Activities Table
```sql
CREATE TABLE activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    activity_type VARCHAR NOT NULL,  -- 'lead_created', 'lead_scored', etc.
    description TEXT NOT NULL,
    notes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_lead_id (lead_id),
    INDEX idx_timestamp (timestamp)
);
```

### CRUD Operations with Validation

#### Create (POST /api/leads)

**Request Validation:**
```python
Required Fields:
- first_name (non-empty string)
- last_name (non-empty string)
- email (valid email format, unique)

Optional Fields:
- phone, company, job_title, industry, company_size,
  location, website, linkedin_url, notes

Validations Applied:
1. Email format check (must contain "@")
2. Email uniqueness (query existing leads)
3. Name validation (non-empty after strip())
4. Field length limits (per Pydantic schema)
```

**Automatic Actions:**
```python
On successful creation:
1. Insert lead into database
2. Log "lead_created" activity
3. Auto-score lead with Grok
   - On success: Update score + reasoning, log "lead_scored"
   - On failure: Set score=0, log warning, continue
4. Auto-qualify if score >= 80
   - Update stage to "qualified"
   - Log "auto_stage_change" activity
5. Commit transaction
6. Return complete lead object
```

**Error Handling:**
```python
Errors Handled:
- 422 Unprocessable Entity: Invalid email format, missing required fields
- 409 Conflict: Duplicate email address
- 500 Internal Server Error: Database errors, unexpected failures

User-Friendly Messages:
- "Please provide a valid email address."
- "A lead with email 'john@example.com' already exists."
- "An unexpected error occurred. Please try again."
```

#### Read (GET /api/leads, /api/leads/{id})

**List Leads:**
```python
GET /api/leads?skip=0&limit=100&include_deleted=false

Features:
- Pagination (skip, limit parameters)
- Soft delete filtering (exclude deleted by default)
- Option to include deleted leads
- Order by created_at DESC (newest first)

Response:
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Smith",
    "email": "john@acme.com",
    "company": "Acme Corp",
    "score": 87.0,
    "pipeline_stage": "qualified",
    ...
  },
  ...
]
```

**Get Single Lead:**
```python
GET /api/leads/{lead_id}

Features:
- Retrieve by ID
- Excludes soft-deleted (returns 404 if deleted)
- Includes all lead data

Response:
{
  "id": 1,
  "first_name": "John",
  ...
  "created_at": "2025-01-15T15:45:00Z",
  "updated_at": "2025-01-16T10:30:00Z"
}

Error:
- 404 Not Found: "Lead not found" (if deleted or doesn't exist)
```

**Related Data Endpoints:**
```python
GET /api/leads/{id}/messages
- Returns all messages for lead (chronological)

GET /api/leads/{id}/activities
- Returns activity timeline (newest first)

GET /api/analytics/pipeline
- Returns aggregated stats per stage
```

#### Update (PUT /api/leads/{id})

**Partial Updates:**
```python
PUT /api/leads/1
Content-Type: application/json

{
  "job_title": "Senior VP of Sales",  # Only updating title
  "company_size": "1000-5000"         # and company size
}

Behavior:
- Only provided fields are updated
- Omitted fields remain unchanged
- updated_at timestamp auto-refreshed
```

**Validation on Update:**
```python
Email Change:
- Must be valid format
- Must be unique (excluding current lead)
- Error 409 if duplicate

Name Changes:
- Cannot be empty strings
- Trimmed whitespace validated
- Error 422 if invalid

Stage Changes:
- Validated against enum
- Activity logged
- Error 422 if invalid stage
```

**Update Response:**
```python
Success (200 OK):
{
  "id": 1,
  "first_name": "John",
  "job_title": "Senior VP of Sales",  # Updated
  "updated_at": "2025-01-16T14:22:00Z",  # Refreshed
  ...
}

Errors:
- 404: Lead not found
- 409: Email conflict
- 422: Validation error
- 500: Database error
```

#### Delete (DELETE /api/leads/{id})

**Soft Delete (Non-Destructive):**
```python
DELETE /api/leads/1

Actions:
1. Find lead by ID (must not already be deleted)
2. Set is_deleted = True
3. Set deleted_at = current UTC timestamp
4. Set deleted_by = "system" (future: actual user ID)
5. Log "lead_deleted" activity with details
6. Commit transaction

Response:
{
  "message": "Lead deleted successfully",
  "lead_id": 1
}

Data Preserved:
- All lead data remains in database
- Messages and activities preserved
- Searchable if include_deleted=true
- Restorable via restore endpoint
```

**Restore Deleted Lead:**
```python
POST /api/leads/1/restore

Actions:
1. Find lead (must be deleted)
2. Set is_deleted = False
3. Clear deleted_at, deleted_by
4. Log "lead_restored" activity
5. Commit transaction

Response:
{
  "message": "Lead restored successfully",
  "lead_id": 1
}

Benefits:
- Undo accidental deletions
- Compliance with data retention
- Full audit trail
- No data loss
```

### Search & Metadata System

#### Full-Text Search Implementation

**Frontend Client-Side Search:**
```javascript
Search Fields:
- first_name
- last_name
- email
- company
- job_title
- industry
- notes

Logic:
- Case-insensitive (toLowerCase())
- Partial matching (includes())
- Real-time filtering
- Combined with other filters (AND logic)

Performance:
- Instant results (no API call)
- Efficient array filtering
- Scales to thousands of leads
- No database load
```

**Advanced Filters:**
```javascript
Available Filters:
1. Company (text search, partial match)
2. Industry (text search, partial match)
3. Date Range (created_at between from/to)
4. Score Range (score between min/max)

All Filters Combine:
filtered = leads
  .filter(search query match)
  .filter(company match)
  .filter(industry match)
  .filter(date range)
  .filter(score range)
  .filter(stage filter if active)
```

#### Metadata Organization

**Lead Metadata Structure:**
```python
Basic Information:
- Name: first_name, last_name
- Contact: email, phone

Company Data:
- Company name, size, location
- Website, LinkedIn URL
- Industry classification

Professional Context:
- Job title (decision-maker level)
- Role description (in notes)
- Seniority indicators

Scoring & Assessment:
- Numerical score (0-100)
- AI-generated reasoning
- Score timestamp (via updated_at)

Pipeline Context:
- Current stage
- Stage history (via activities)
- Notes (manual context)

Audit Metadata:
- created_at (when lead added)
- updated_at (last modification)
- deleted_at (if soft-deleted)
- deleted_by (who deleted)
```

**Message Metadata:**
```python
Message Context:
- Type (initial_outreach, follow_up, etc.)
- Subject line
- Full content
- Created timestamp
- Sent timestamp (future: email integration)
- Link to lead (foreign key)

Version Control:
- Original message: "initial_outreach"
- Tuned version: "initial_outreach_tuned"
- Linked via lead_id and created_at proximity
```

**Activity Metadata:**
```python
Event Tracking:
- Type (lead_created, lead_scored, message_generated, etc.)
- Description (human-readable summary)
- Notes (detailed context, AI reasoning, etc.)
- Timestamp (precise event time)
- Link to lead

Audit Capability:
- Complete event log
- Chronological order
- Immutable (append-only)
- Searchable and filterable
```

### Data Validation Framework

**Input Validation (Pydantic Schemas):**
```python
# backend/app/schemas.py

class LeadCreate(BaseModel):
    # Required
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr  # Pydantic email validation
    
    # Optional
    phone: Optional[str] = Field(None, max_length=20)
    company: Optional[str] = Field(None, max_length=200)
    job_title: Optional[str] = Field(None, max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    company_size: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=200)
    website: Optional[HttpUrl] = None  # URL validation
    linkedin_url: Optional[HttpUrl] = None
    notes: Optional[str] = None

class LeadUpdate(BaseModel):
    # All fields optional for partial updates
    first_name: Optional[str] = Field(None, min_length=1)
    last_name: Optional[str] = Field(None, min_length=1)
    email: Optional[EmailStr] = None
    # ... other fields
```

**Business Logic Validation:**
```python
Unique Constraints:
- Email must be unique across all leads
- Check on create and update

Referential Integrity:
- Foreign keys enforced (messages → leads, activities → leads)
- Cascade delete configured

State Validation:
- Can't restore non-deleted lead (check is_deleted)
- Can't delete already-deleted lead
- Pipeline stage must be valid enum value

Score Validation:
- Score range: 0.0 to 100.0
- Auto-qualify logic: >= 80 → qualified stage
- Reasoning required when score set
```

**Error Handling Strategy:**
```python
HTTP Status Codes:
- 200 OK: Successful operation
- 201 Created: Lead created successfully
- 400 Bad Request: Malformed request
- 404 Not Found: Lead doesn't exist
- 409 Conflict: Duplicate email, state conflict
- 422 Unprocessable Entity: Validation error
- 500 Internal Server Error: Unexpected error

User-Friendly Messages:
✓ Good: "A lead with email 'john@example.com' already exists."
✗ Bad: "IntegrityError: UNIQUE constraint failed: leads.email"

Error Response Format:
{
  "detail": "User-friendly error message"
}
```

**Transaction Management:**
```python
Database Transactions:
- All operations wrapped in transactions
- Rollback on any error
- Ensures data consistency

Example:
try:
    db_lead = create_lead(...)
    db.add(db_lead)
    activity = log_activity(...)
    db.add(activity)
    db.commit()  # Atomic: all or nothing
except Exception as e:
    db.rollback()  # Undo all changes
    raise HTTPException(...)
```

---

## 📦 Installation

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **npm or yarn**
- **Grok API key** from xAI (https://x.ai/)

### Backend Setup

```bash
# Clone repository (if applicable) or navigate to project
cd grok-sdr-system/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file with your Grok API key
cat > .env << EOF
GROK_API_KEY=your_actual_grok_api_key_here
DATABASE_URL=sqlite:///./leads.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
EOF

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Backend will be available at:** `http://localhost:8001`

**Verify backend:**
```bash
curl http://localhost:8001/health
# Should return: {"status":"healthy","grok_connected":true,...}
```

### Frontend Setup

```bash
# Open new terminal, navigate to frontend
cd grok-sdr-system/frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```

**Frontend will be available at:** `http://localhost:5173`

**Access the application:** Open browser to `http://localhost:5173`

### API Documentation

Once backend is running:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

---

## 🚀 Usage

### Adding a New Lead

1. Click **"+ Add Lead"** button in the action bar
2. Fill in the form (first name, last name, email are required)
3. Optional: Add company, job title, industry, notes, etc.
4. Click **"Create Lead"**
5. System automatically:
   - Validates and creates the lead
   - Scores it with Grok AI
   - Auto-qualifies if score ≥80
   - Logs all activities

### Scoring Leads

**Single Lead:**
- Select lead → System shows current score
- Click "Re-Score Lead" to update

**All Leads:**
- Click **"⚡ Score All Leads"** button
- Wait for batch processing to complete

**Custom Criteria:**
1. Click **"⚙️ Scoring Settings"**
2. Adjust sliders (must total 100%)
3. Click "Save Settings"
4. Re-score leads with new weights

### Generating Messages

1. Select a lead
2. View recommended message types (⭐ = best for stage)
3. Click message type button
4. Review generated message
5. Optional: Tune up with instructions
6. Message auto-saved to history

### Managing Pipeline

**Change Stage:**
- Click stage dropdown next to lead name
- Select new stage
- Change logged automatically

**Filter by Stage:**
- Click any pipeline stat box
- View only leads in that stage
- Click again to toggle off

### Searching & Filtering

**Quick Search:**
- Type in search bar
- Results filter instantly

**Advanced Filters:**
- Click filter icon (funnel)
- Set company, industry, date range, score range
- All filters combine

---

## 📚 API Documentation

### Key Endpoints

**Leads:**
- `POST /api/leads` - Create lead (auto-scores)
- `GET /api/leads` - List all leads
- `GET /api/leads/{id}` - Get single lead
- `PUT /api/leads/{id}` - Update lead
- `DELETE /api/leads/{id}` - Soft delete
- `POST /api/leads/{id}/restore` - Restore deleted

**Scoring:**
- `POST /api/leads/{id}/score` - Score single lead
- `POST /api/leads/score-batch` - Score all leads

**Messaging:**
- `POST /api/leads/{id}/generate-message` - Generate message
- `POST /api/leads/{id}/tune-message` - Tune/revise message
- `GET /api/leads/{id}/messages` - Message history

**Pipeline:**
- `PUT /api/leads/{id}/stage` - Update stage
- `GET /api/leads/{id}/activities` - Activity timeline

**Analytics:**
- `GET /api/analytics/pipeline` - Pipeline statistics

Full documentation: http://localhost:8001/docs

---

## 🔮 Future Enhancements

### Planned Features

**Short-Term:**
- Email integration (send directly from platform)
- Calendar sync (schedule meetings inline)
- User authentication & team collaboration
- Enhanced analytics dashboard

**Medium-Term:**
- CRM integration (Salesforce, HubSpot)
- Advanced AI features (sentiment analysis, next best action)
- Workflow automation (sequences, triggers)
- Mobile app (iOS/Android)

**Long-Term:**
- Multi-channel outreach (LinkedIn, SMS, WhatsApp)
- Predictive intelligence (deal outcome prediction)
- Enterprise features (custom workflows, advanced permissions)

---

## 📄 License

This project is proprietary and confidential.

---

**Built with ❤️ using Grok AI**
