# Evaluation Metrics

## Overview

StudyWithMe includes comprehensive evaluation metrics to ensure system quality and learning effectiveness.

## Quality Metrics

### 1. Depth Alignment Score

**Definition**: How well the response matches the requested depth level.

**Calculation**:
```typescript
// Core: 50-150 words optimal
// Applied: 100-250 words optimal
// Mastery: 200+ words optimal

if (depth === 'Core') {
  depthAlignment = wordCount >= 50 && wordCount <= 150 ? 1.0 : 0.6;
}
```

**Target**: > 0.85 average

### 2. Clarity Score

**Definition**: Readability and understandability of responses.

**Calculation**:
- Based on average word complexity
- Lower complexity = higher clarity for Core
- Higher complexity acceptable for Mastery

**Target**: > 0.75 average

### 3. Ethics Flag Rate

**Definition**: Percentage of interactions triggering ethics intervention.

**Calculation**: `(Flagged Interactions / Total) × 100`

**Target**: < 2%

## Learning Metrics

### 1. Mastery Score

**Definition**: Student's understanding level for a topic (0-100).

**Factors**:
- Explanation engagement (+5 × depth weight)
- Assignment performance (score-based)
- Time decay (reduces if inactive)

### 2. Confidence Level

**Definition**: System's confidence in the mastery score.

**Levels**:
- High: Mastery > 80%
- Medium: Mastery 50-80%
- Low: Mastery < 50%

### 3. Session Metrics

Tracked per session:
- Total interactions
- Depth distribution
- Mode distribution
- Ethics flags
- Token usage

## Dashboard Metrics

### Teacher View

| Metric | Description |
|--------|-------------|
| Total Students | Active student count |
| Avg Mastery | Mean mastery across all topics |
| At-Risk Topics | Topics with avg score < 50% |
| Active (7d) | Students active in last week |

### Institution View

| Metric | Description |
|--------|-------------|
| Total Interactions | All-time interaction count |
| Avg Depth Alignment | System quality indicator |
| Avg Clarity | Response understandability |
| Ethics Compliance | Safe interaction percentage |

## Logging Integration

### Simulated W&B Logging

```typescript
const logEntry = {
  timestamp: new Date().toISOString(),
  depth,
  mode,
  promptTokens,
  responseTokens,
  depthAlignmentScore,
  clarityScore,
  ethicsFlag
};
```

### Export Format

Logs can be exported for:
- Research analysis
- System auditing
- Performance optimization
- Compliance reporting

## Future Metrics

Planned additions:
- Learning velocity (improvement rate)
- Concept retention (spaced repetition)
- Engagement patterns
- Personalization effectiveness
