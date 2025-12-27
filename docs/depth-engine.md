# Depth Engine

## Overview

The Depth Engine is the core component that controls how StudyWithMe adapts its responses based on the student's current learning level.

## Depth Levels

### 1. Core (Fundamentals)

**Target Audience**: Beginners, students needing foundation review

**Characteristics**:
- Simple, clear explanations
- Heavy use of analogies
- Maximum 1 real-world example
- Focus on "What" and basic "Why"
- Avoids technical jargon

**Response Tokens**: ~250

**Example**:
> "A variable is like a labeled box. You give it a name, and you can put a value inside. When you need that value later, you just call the box by its name."

### 2. Applied (Practice)

**Target Audience**: Students who understand basics, ready for application

**Characteristics**:
- Context-driven explanations
- Problem-solving orientation
- Exactly 2 real-world scenarios
- Focus on "How" and "When"
- Bridges theory to practice

**Response Tokens**: ~500

**Example**:
> "Let's see how variables work in a real scenario. Imagine you're building a shopping cart. You'd use a variable to store the total price, updating it each time an item is added..."

### 3. Mastery (Deep Dive)

**Target Audience**: Advanced students, those seeking expert understanding

**Characteristics**:
- Rigorous, comprehensive analysis
- Explores edge cases
- Historical context and theoretical limits
- Trade-off discussions
- Academic tone

**Response Tokens**: ~1000

**Example**:
> "The choice between mutable and immutable variables reflects deeper computer science principles. In functional programming paradigms, immutability provides referential transparency, which aids in parallel computation..."

## Configuration

```typescript
interface DepthConfig {
  systemInstructionAddon: string;  // Added to base prompt
  maxTokens: number;                // Response length guide
  complexityLevel: 'low' | 'medium' | 'high';
  allowedExamples: number;          // Example count limit
}
```

## Adaptive Depth Adjustment

The system monitors student performance and suggests depth changes:

### Signals

| Signal | Condition | Action |
|--------|-----------|--------|
| INCREASE_DEPTH | Mastery > 85%, not at Mastery | Move up one level |
| REDUCE_COMPLEXITY | 3+ misconceptions, not at Core | Move down one level |
| PRACTICE_NEEDED | Mastery < 50%, attempts > 3 | More practice at current level |
| MASTERY_READY | Mastery > 75% at Applied | Suggest Mastery level |
| MAINTAIN | Otherwise | Stay at current level |

## Integration

The Depth Engine integrates with:
- **Prompt Builder**: Adds depth-specific instructions
- **Progress Tracker**: Receives performance data
- **Adaptive Engine**: Triggers adjustments
- **Dashboard**: Reports depth distribution

## Best Practices

1. **Start at Core** for new topics
2. **Allow student override** of suggested depth
3. **Review depth distribution** regularly
4. **Balance depth** across curriculum
