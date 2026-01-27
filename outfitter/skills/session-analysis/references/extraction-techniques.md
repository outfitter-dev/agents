# Extraction Techniques

Technical methods for extracting signals from conversation history, including regex patterns, heuristics, and context analysis.

## Signal Detection Patterns

### Success Signals

#### Explicit Praise Detection

**Regex patterns**:

```regex
# High confidence praise
\b(perfect|excellent|exactly|amazing|brilliant|outstanding|superb)\b!*

# Medium confidence praise
\b(great|good|nice|wonderful|fantastic)\b

# Superlatives
\b(best|ideal|optimal|precisely)\s+(what|how|where)\s+

# Enthusiastic patterns
!{2,}|🎉|👍|✅
```

**Heuristic rules**:

1. Check for exclamation marks: 1 = medium confidence, 2+ = high confidence
2. Count positive adjectives in message: 2+ = high enthusiasm
3. Check for "exactly what I needed" or similar fulfillment language
4. Verify no contradictory signals in same message (e.g., "good but...")

**Context checks**:

```
If praise detected:
  - Check previous agent message: What did agent do?
  - Check next user message: Did user continue or correct?
  - Score based on continuation vs. correction
```

#### Continuation Detection

**Patterns**:

```regex
# Explicit continuation
\bnow\s+(do|apply|use|add|implement)\s+
\bapply\s+this\s+(to|pattern|approach)\s+
\bnext[,\s]+(let's|do|add)

# Extension language
\b(also|additionally|furthermore|moreover)\s+
\bsame\s+(for|with|to)\b
```

**Heuristic rules**:

1. Check if message references "this", "that", "same" without corrections
2. Verify previous agent message exists (continuation requires prior context)
3. Check for negation words: "now do X instead" is correction, not continuation
4. Look for expansion keywords: "also", "and", "too", "as well"

**Context checks**:

```
If continuation suspected:
  - Extract referenced prior work (parse "this", "that", "same")
  - Check for corrections between reference and current message
  - If corrections exist: Not continuation (likely correction signal)
  - If no corrections: Continuation (confidence based on explicitness)
```

#### Adoption Detection

**Patterns**:

This is primarily behavioral, not linguistic. Requires analyzing agent suggestions vs. user actions.

```
Detection algorithm:
1. Extract agent's suggestions from previous messages
2. Check user's next message or code changes
3. If user implements suggestion without modification:
   - Adoption signal (high confidence)
4. If user asks clarifying questions then implements:
   - Adoption signal (medium confidence)
5. If user modifies before implementing:
   - Partial adoption (low confidence) or correction signal
```

**Code comparison heuristic**:

```javascript
// Pseudocode for adoption detection
function detectAdoption(agentMessage, userResponse) {
  const agentSuggestions = extractSuggestions(agentMessage);
  const userActions = extractActions(userResponse);

  for (const suggestion of agentSuggestions) {
    const match = findMatchingAction(suggestion, userActions);
    if (match && match.similarity > 0.8) {
      return { signal: 'adoption', confidence: 'high' };
    } else if (match && match.similarity > 0.5) {
      return { signal: 'adoption', confidence: 'medium' };
    }
  }

  return null;
}
```

### Frustration Signals

#### Correction Detection

**Patterns**:

```regex
# Explicit negation
\b(no[,\s]|wrong|incorrect|not\s+what|that's\s+not)\b

# Correction language
\b(actually|instead|rather)\s+
\bI\s+meant\s+
\bdo\s+\w+\s+instead\b

# Contradiction markers
\bdon't\s+do\s+\w+
\bnot\s+\w+[,\s]+\w+
```

**Heuristic rules**:

1. Check for negation words followed by agent's previous output
2. Look for "instead" patterns: "X instead of Y" where Y was agent's choice
3. Check for contradiction: "I said X" where X contradicts recent agent action
4. Verify correction vs. iteration: correction references agent error, iteration builds on success

**Context checks**:

```
If correction suspected:
  - Extract what user is correcting (X → Y)
  - Check if agent did X in previous message
  - If yes: Correction signal (confidence based on negation strength)
  - If no: Possible misunderstanding or false positive
```

#### Repetition Detection

**Pattern**:

This requires multi-message analysis.

```
Detection algorithm:
1. Extract normalized intent from each user message
2. Build similarity matrix across messages
3. Find clusters of high-similarity messages (>0.7 similarity)
4. If cluster size >= 2 and spans multiple agent responses:
   - Repetition signal
5. Check for escalation language ("again", "already told you"):
   - High confidence
6. Otherwise: Medium confidence
```

**Normalization steps**:

```javascript
function normalizeIntent(message) {
  // Remove politeness/filler
  let normalized = message.toLowerCase();
  normalized = normalized.replace(/\b(please|thanks|thank you)\b/g, '');

  // Extract core imperative
  const imperatives = normalized.match(/\b(use|do|make|add|implement|fix)\s+\w+/g);

  // Extract prohibitions
  const prohibitions = normalized.match(/\bdon't\s+\w+/g);

  return { imperatives, prohibitions };
}

function calculateSimilarity(intent1, intent2) {
  // Check for matching imperatives or prohibitions
  // Return similarity score 0.0 - 1.0
}
```

**Escalation markers**:

```regex
\b(again|once again|already|I\s+told\s+you|I\s+said|still)\b
```

#### Explicit Frustration Detection

**Patterns**:

```regex
# Direct frustration language
\b(frustrat(ing|ed)|annoying|annoyed|confusion|confused)\b

# Problem statements
\b(not\s+working|doesn't\s+work|broken|failing|fails)\b

# Accusatory questions
\bwhy\s+(did|would|do)\s+you\s+

# Exasperation
\bcome\s+on\b|\bseriously\b|\breally\?\b
```

**Heuristic rules**:

1. Question marks with negative tone: medium frustration
2. Multiple question marks: high frustration
3. All caps words: high frustration
4. Repetition of negative words: escalating frustration

**Tone analysis**:

```javascript
function analyzeTone(message) {
  const negativeWords = message.match(/\b(not|no|never|don't|can't|won't)\b/g);
  const negativeWordCount = negativeWords ? negativeWords.length : 0;

  const questionMarks = message.match(/\?/g);
  const questionCount = questionMarks ? questionMarks.length : 0;

  const capsWords = message.match(/\b[A-Z]{2,}\b/g);
  const capsCount = capsWords ? capsWords.length : 0;

  // Frustration score
  const score = (negativeWordCount * 0.3) + (questionCount * 0.2) + (capsCount * 0.5);

  if (score > 1.5) return 'high';
  if (score > 0.7) return 'medium';
  return 'low';
}
```

### Workflow Signals

#### Sequence Marker Detection

**Patterns**:

```regex
# Ordinal markers
\b(first|second|third|fourth|fifth)\b[,\s]
\b(1st|2nd|3rd|4th|5th)\b[,\s]
\bstep\s+\d+[:\s]

# Temporal sequence
\b(before|after|then|next|finally)\b[,\s]
\bonce\s+\w+[,\s]+(then|do|we)\b
```

**Heuristic rules**:

1. Count ordinal markers: 2+ = high confidence sequence
2. Check for numbered lists (1., 2., 3.)
3. Look for temporal connectives in order (first...then...finally)
4. Verify sequence is prescriptive (steps to take) not descriptive (events that happened)

**List detection**:

```javascript
function detectSequence(message) {
  // Check for numbered list
  const numberedItems = message.match(/^\d+\.\s+.+$/gm);
  if (numberedItems && numberedItems.length >= 2) {
    return { signal: 'sequence', confidence: 'high', items: numberedItems };
  }

  // Check for ordinal markers
  const ordinals = message.match(/\b(first|second|third|then|next|finally)\b/gi);
  if (ordinals && ordinals.length >= 2) {
    return { signal: 'sequence', confidence: 'medium', markers: ordinals };
  }

  return null;
}
```

#### Stage Transition Detection

**Patterns**:

```regex
# Completion + new direction
\b(now\s+that|with\s+that|that's\s+done)\b.+\b(let's|next|moving|time\s+to)\b

# Explicit transitions
\bmoving\s+on\s+to\b
\bnext\s+up[:\s]
\bswitching\s+to\b
```

**Heuristic rules**:

1. Check for completion language: "done", "finished", "complete", "that's it"
2. Check for new direction: "now", "next", "let's", "time to"
3. Must have both completion and new direction for high confidence
4. If only new direction: context switch, not stage transition

**Context checks**:

```
If stage transition suspected:
  - Check if previous task mentioned in completion language
  - Verify previous task was in progress (not already complete)
  - Check if new direction is related (stage) or unrelated (context switch)
  - Related = stage transition, unrelated = context switch
```

#### Tool Chain Detection

**Pattern**:

Requires analyzing agent's tool usage across multiple tasks.

```
Detection algorithm:
1. Extract tool call sequences from agent messages
2. Group by task (task boundary = user message)
3. Find recurring sequences:
   - Use n-gram analysis (n=2 to 5)
   - Count frequency of each n-gram
   - Filter to sequences with frequency >= 3
4. For each recurring sequence:
   - Calculate confidence based on frequency and consistency
   - Extract as tool chain pattern
```

**N-gram analysis**:

```javascript
function extractToolChains(agentMessages) {
  const sequences = [];

  for (const message of agentMessages) {
    const tools = extractToolCalls(message); // ['Read', 'Edit', 'Bash']
    sequences.push(tools);
  }

  // Find recurring n-grams
  const ngrams = {};
  for (const seq of sequences) {
    for (let n = 2; n <= Math.min(5, seq.length); n++) {
      for (let i = 0; i <= seq.length - n; i++) {
        const gram = seq.slice(i, i + n).join(' → ');
        ngrams[gram] = (ngrams[gram] || 0) + 1;
      }
    }
  }

  // Filter to frequent patterns
  const chains = Object.entries(ngrams)
    .filter(([gram, count]) => count >= 3)
    .map(([gram, count]) => ({
      chain: gram,
      frequency: count,
      confidence: count >= 5 ? 'high' : count >= 3 ? 'medium' : 'low'
    }));

  return chains;
}
```

### Request Signals

#### Prohibition Detection

**Patterns**:

```regex
# Absolute prohibitions
\b(never|don't|do\s+not)\s+
\bavoid\s+(using|doing)\s+

# Explicit constraints
\bno\s+\w+\b
\bwithout\s+\w+\b
```

**Heuristic rules**:

1. "Never" = high confidence prohibition
2. "Don't" + imperative = high confidence
3. "Avoid" = medium confidence (softer prohibition)
4. "No X" = context-dependent (check if X is an action or noun)

**Context checks**:

```
If prohibition suspected:
  - Extract prohibited action/item
  - Check for exceptions: "don't X unless Y"
  - If exception: conditional signal, not absolute prohibition
  - If no exception: prohibition (confidence based on strength of negation)
```

#### Requirement Detection

**Patterns**:

```regex
# Modal verbs
\b(must|should|need\s+to|have\s+to|always)\s+

# Imperatives with emphasis
\bmake\s+sure\s+(to\s+)?
\bensure\s+(that\s+)?
\bremember\s+to\s+
```

**Heuristic rules**:

1. "Must" / "Always" = high confidence requirement
2. "Should" = medium confidence requirement
3. "Make sure" = medium confidence requirement
4. Bare imperative ("Run tests") = context-dependent

**Strength scoring**:

```javascript
function classifyRequirement(message) {
  if (/\b(must|always|required)\b/i.test(message)) {
    return { strength: 'strong', confidence: 'high' };
  }
  if (/\b(should|need\s+to|make\s+sure)\b/i.test(message)) {
    return { strength: 'moderate', confidence: 'medium' };
  }
  if (/\b(could|might\s+want\s+to|consider)\b/i.test(message)) {
    return { strength: 'weak', confidence: 'low' };
  }
  return null;
}
```

#### Preference Detection

**Patterns**:

```regex
# Explicit preference
\bI\s+prefer\s+
\bI'd\s+rather\s+
\bI\s+like\s+\w+\s+(better|more)\b

# Comparative language
\b(better|cleaner|easier|simpler)\s+to\s+
\bX\s+over\s+Y\b
```

**Heuristic rules**:

1. "I prefer X" = high confidence preference
2. "X is better" = medium confidence (could be objective claim)
3. "I like X" = low confidence (weak preference)
4. Check for comparison: "X over Y" or "X not Y" strengthens signal

**Subjectivity detection**:

```javascript
function isSubjective(statement) {
  // Check for first-person markers
  const firstPerson = /\b(I|my|me)\b/i.test(statement);

  // Check for subjective language
  const subjective = /\b(prefer|like|rather|think|believe|feel)\b/i.test(statement);

  // Check for evaluative language
  const evaluative = /\b(better|worse|best|worst|cleaner|messier)\b/i.test(statement);

  return firstPerson || subjective || evaluative;
}
```

## Message Boundary Detection

Identify where user messages begin and end, separating from agent messages and tool outputs.

### Actor Classification

```javascript
function classifyActor(message) {
  // Check for role markers
  if (message.role === 'user') return 'user';
  if (message.role === 'assistant') return 'agent';

  // Fallback to content analysis
  if (/<function_calls>/i.test(message.content)) return 'agent';
  if (/<function_results>/i.test(message.content)) return 'tool';

  // Default to user for ambiguous cases
  return 'user';
}
```

### Message Filtering

```javascript
function filterMessages(conversation, options = {}) {
  const {
    actors = ['user', 'agent'],
    excludeToolOutput = true,
    excludeCodeBlocks = false,
    minLength = 0,
  } = options;

  return conversation
    .filter(msg => actors.includes(classifyActor(msg)))
    .filter(msg => !excludeToolOutput || !msg.content.includes('<function_results>'))
    .filter(msg => !excludeCodeBlocks || !msg.content.includes('```'))
    .filter(msg => msg.content.length >= minLength);
}
```

## Multi-Turn Pattern Recognition

Detect patterns that span multiple messages.

### Escalation Detection

```javascript
function detectEscalation(messages) {
  // Group messages by topic
  const topics = clusterByTopic(messages);

  for (const topic of topics) {
    // Check if frustration increases over time
    const frustrationScores = topic.messages.map(msg => {
      const signals = extractSignals(msg);
      return signals.filter(s => s.type === 'frustration').length;
    });

    // Check for monotonic increase
    let isEscalating = true;
    for (let i = 1; i < frustrationScores.length; i++) {
      if (frustrationScores[i] <= frustrationScores[i - 1]) {
        isEscalating = false;
        break;
      }
    }

    if (isEscalating && frustrationScores.length >= 2) {
      return {
        pattern: 'escalation',
        topic: topic.name,
        messages: topic.messages,
        confidence: frustrationScores.length >= 3 ? 'high' : 'medium'
      };
    }
  }

  return null;
}
```

### Topic Clustering

```javascript
function clusterByTopic(messages) {
  // Simple keyword-based clustering
  const clusters = [];

  for (const msg of messages) {
    const keywords = extractKeywords(msg);

    // Find existing cluster with matching keywords
    let matched = false;
    for (const cluster of clusters) {
      const overlap = keywords.filter(k => cluster.keywords.includes(k));
      if (overlap.length / keywords.length > 0.3) {
        cluster.messages.push(msg);
        cluster.keywords = [...new Set([...cluster.keywords, ...keywords])];
        matched = true;
        break;
      }
    }

    // Create new cluster if no match
    if (!matched) {
      clusters.push({
        name: keywords[0] || 'unnamed',
        keywords,
        messages: [msg]
      });
    }
  }

  return clusters;
}

function extractKeywords(message) {
  // Remove stop words and extract nouns/verbs
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);

  const words = message.content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  // Return top 5 most frequent words
  const freq = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}
```

## Context Analysis Methods

### Recency Weighting

More recent signals should carry more weight than older ones.

```javascript
function applyRecencyWeight(signals, halfLifeDays = 7) {
  const now = Date.now();
  const halfLifeMs = halfLifeDays * 24 * 60 * 60 * 1000;

  return signals.map(signal => {
    const age = now - signal.timestamp;
    const weight = Math.pow(0.5, age / halfLifeMs);

    return {
      ...signal,
      weight,
      weightedConfidence: signal.confidence * weight
    };
  });
}
```

### Contradiction Resolution

When signals conflict, resolve using recency and confidence.

```javascript
function resolveContradictions(signals) {
  // Group by topic
  const groups = groupByTopic(signals);

  for (const group of groups) {
    // Sort by timestamp (newest first)
    group.signals.sort((a, b) => b.timestamp - a.timestamp);

    // Check for contradictions
    const contradictions = findContradictions(group.signals);

    for (const [newer, older] of contradictions) {
      if (newer.confidence >= older.confidence) {
        // Mark older signal as superseded
        older.superseded = true;
        older.supersededBy = newer.message_id;
      }
    }
  }

  // Filter out superseded signals
  return signals.filter(s => !s.superseded);
}

function findContradictions(signals) {
  const pairs = [];

  for (let i = 0; i < signals.length; i++) {
    for (let j = i + 1; j < signals.length; j++) {
      if (areContradictory(signals[i], signals[j])) {
        pairs.push([signals[i], signals[j]]);
      }
    }
  }

  return pairs;
}

function areContradictory(signal1, signal2) {
  // Example: "Use X" vs. "Don't use X"
  if (signal1.type === 'request' && signal2.type === 'request') {
    // Extract actions
    const action1 = signal1.quote.match(/\b(use|do|make|add)\s+(\w+)/i);
    const action2 = signal2.quote.match(/\b(don't|never|avoid)\s+(use|do|make|add)?\s*(\w+)/i);

    if (action1 && action2 && action1[2] === action2[3]) {
      return true; // Contradiction: "use X" vs. "don't use X"
    }
  }

  return false;
}
```

## Performance Optimization

### Incremental Analysis

For long conversations, analyze incrementally rather than re-analyzing entire history.

```javascript
class IncrementalAnalyzer {
  constructor() {
    this.lastAnalyzedIndex = 0;
    this.signals = [];
    this.patterns = [];
  }

  analyze(messages) {
    // Only analyze new messages
    const newMessages = messages.slice(this.lastAnalyzedIndex);

    // Extract signals from new messages
    const newSignals = newMessages.flatMap(msg => extractSignals(msg));
    this.signals.push(...newSignals);

    // Update patterns with new signals
    this.patterns = detectPatterns(this.signals);

    // Update index
    this.lastAnalyzedIndex = messages.length;

    return {
      signals: this.signals,
      patterns: this.patterns
    };
  }

  reset() {
    this.lastAnalyzedIndex = 0;
    this.signals = [];
    this.patterns = [];
  }
}
```

### Caching

Cache expensive operations like topic clustering and keyword extraction.

```javascript
class AnalysisCache {
  constructor(ttlMs = 5 * 60 * 1000) { // 5 minute TTL
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

// Usage
const cache = new AnalysisCache();

function extractSignalsWithCache(message) {
  const key = `signals:${message.id}`;
  const cached = cache.get(key);

  if (cached) return cached;

  const signals = extractSignals(message);
  cache.set(key, signals);

  return signals;
}
```

## Error Handling

### Graceful Degradation

If signal extraction fails for a message, continue with remaining messages.

```javascript
function extractSignalsSafe(messages) {
  const results = {
    signals: [],
    errors: []
  };

  for (const msg of messages) {
    try {
      const signals = extractSignals(msg);
      results.signals.push(...signals);
    } catch (error) {
      results.errors.push({
        message_id: msg.id,
        error: error.message
      });
      // Continue with next message
    }
  }

  return results;
}
```

### Validation

Validate extracted signals before adding to results.

```javascript
function validateSignal(signal) {
  const required = ['type', 'subtype', 'message_id', 'quote', 'confidence'];

  for (const field of required) {
    if (!(field in signal)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const validTypes = ['success', 'frustration', 'workflow', 'request'];
  if (!validTypes.includes(signal.type)) {
    throw new Error(`Invalid signal type: ${signal.type}`);
  }

  if (signal.confidence < 0 || signal.confidence > 1) {
    throw new Error(`Confidence must be 0-1, got: ${signal.confidence}`);
  }

  return true;
}
```
