# Detailed Documentation of TextualFeedbackAnalysis Component
## Component Overview

The `TextualFeedbackAnalysis` component (from `FeedbackTextAnalysis.jsx`) implements an advanced natural language processing (NLP) pipeline to extract meaningful topics from unstructured patient feedback. Rather than using traditional topic modeling approaches like LDA, it employs a custom semantic analysis strategy specifically designed for healthcare feedback.

## State Management

The component maintains several state variables to track the analysis workflow:

```jsx
const [selectedRating, setSelectedRating] = useState(5);
const [topicData, setTopicData] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedTopic, setSelectedTopic] = useState(null);
const [selectedComments, setSelectedComments] = useState([]);
const [rawFeedback, setRawFeedback] = useState([]);
```

The data flow is controlled by two key `useEffect` hooks:

```jsx
// Fetch data when rating changes
useEffect(() => {
  fetchFeedbackData(selectedRating);
}, [selectedRating]);

// Process data when raw feedback changes
useEffect(() => {
  if (rawFeedback.length > 0) {
    const processedTopics = processTopicModeling(rawFeedback);
    setTopicData(processedTopics);
    setSelectedTopic(null);
    setSelectedComments([]);
    setLoading(false);
  }
}, [rawFeedback]);
```

## NLP Pipeline Implementation

### 1. Hospital Term Extraction

The `extractHospitalTerms` function identifies healthcare-specific terminology by examining patterns and statistical significance:

```jsx
const extractHospitalTerms = (feedbackData) => {
  // Combine all feedback text into corpus
  const allText = feedbackData.map(item => item.comments).join(' ');
  const doc = nlp(allText);
  
  // Extract terms using pattern matching
  const medicalTerms = [];
  // Extract departments, staff mentions, and healthcare processes
  // ...
  
  // Calculate statistical significance by rating distribution
  // ...
  
  return significantTerms;
};
```

This function uses several strategies:
- Pattern-based extraction for departments, staff roles, and processes
- Bigram extraction to capture two-word healthcare terms
- Statistical analysis to identify terms that distinguish between rating categories
- Frequency and variance calculations to determine term significance

### 2. Quality Descriptor Extraction

The `extractHospitalQualityDescriptors` function identifies adjectives and phrases that describe healthcare quality:

```jsx
const extractHospitalQualityDescriptors = (feedbackData) => {
  const allText = feedbackData.map(item => item.comments).join(' ');
  const doc = nlp(allText);
  
  // Extract quality descriptors using patterns
  const qualityPhrases = [];
  
  // Extract adjective-noun pairs in healthcare context
  const healthcareAdjectivePatterns = [
    // Staff, facility, service, and time descriptors
    // ...
  ];
  
  // Extract sentiment adjectives and context-based descriptors
  // ...
  
  return descriptorScores;
};
```

The function specifically looks for:
- Adjective-noun pairs related to healthcare (e.g., "friendly staff", "clean facility")
- Comparative and superlative adjectives indicating quality judgments
- Adjectives in specific sentiment contexts (e.g., "was very helpful")

### 3. Term Relationship Discovery

The `discoverHospitalTermRelationships` function analyzes how healthcare terms relate to each other:

```jsx
const discoverHospitalTermRelationships = (feedbackData, hospitalTerms) => {
  const relationships = {};
  
  hospitalTerms.forEach(term => {
    // Find feedback containing this term
    // ...
    
    // Calculate co-occurrence with other terms
    // ...
    
    // Enhance with sentence-level analysis
    // ...
    
    // Select top related terms
    relationships[term] = /* top related terms */;
  });
  
  return relationships;
};
```

This function identifies relationships through:
- Document-level co-occurrence analysis (terms appearing in same feedback)
- Sentence-level proximity analysis (terms appearing in same sentence)
- Statistical significance of co-occurrences

### 4. Document-Level Phrase Extraction

Two complementary functions extract meaningful phrases from individual feedback:

```jsx
const extractNounPhrases = (text, hospitalTerms) => {
  const doc = nlp(text);
  
  // Extract noun phrases and subject-verb-object patterns
  // Filter for meaningful phrases containing hospital terms
  // ...
};

const extractKeyTerms = (text, hospitalTerms, qualityDescriptors) => {
  // Extract hospital terms appearing in the text
  // Extract quality descriptors with hospital terms
  // Extract healthcare-specific patterns
  // ...
};
```

These functions capture both syntactic structures (noun phrases) and semantic patterns (healthcare terms with quality descriptors), creating a richer set of candidate phrases than traditional keyword extraction.

### 5. Semantic TF-IDF Calculation

The `calculateTfIdf` function implements a domain-boosted variant of TF-IDF:

```jsx
const calculateTfIdf = (documentPhrases, feedbackData, hospitalTerms, qualityDescriptors) => {
  // Calculate document frequency for phrases
  // ...
  
  // For each phrase in each document:
  // - Calculate base TF-IDF score
  // - Apply domain-specific boosts:
  //   * 1.5x for phrases containing hospital terms
  //   * 1.3x for phrases containing quality descriptors
  //   * 1.2x for multi-word phrases
  //   * 0.8x penalty for very short phrases
  // ...
};
```

This approach weights phrases by their statistical significance while prioritizing healthcare-relevant content.

### 6. Semantic Phrase Grouping

The `groupSimilarPhrases` function clusters related phrases to reduce redundancy:

```jsx
const groupSimilarPhrases = (phraseTfidf, termRelationships) => {
  const phraseGroups = [];
  const processedPhrases = new Set();
  
  // For each phrase (starting with highest-scoring):
  // - Create a new group
  // - Find semantically related phrases to add to group
  // - Mark added phrases as processed
  // ...
  
  return phraseGroups;
};
```

Semantic relationships are determined by `areSemanticallyRelated`:

```jsx
const areSemanticallyRelated = (phrase1, phrase2, termRelationships) => {
  // Check for word overlap (excluding stopwords)
  // Check if one phrase contains the other
  // Check for related terms using the discovered relationships
  // ...
};
```

This approach creates coherent topic clusters by recognizing when phrases like "long wait time" and "excessive waiting" refer to the same underlying issue.

### 7. Topic Creation

The `createTopicPhrases` function builds the final topic structure:

```jsx
const createTopicPhrases = (phraseGroups, feedbackData) => {
  // Sort groups by combined score
  // For each group:
  //   - Find best representative phrase
  //   - Find related comments
  //   - Create topic data structure
  // ...
};
```

The best representative phrase is selected by `findBestPhrase`:

```jsx
const findBestPhrase = (phrases) => {
  // Prioritize 2-3 word phrases for readability
  // Fall back to first phrase if no suitable multi-word phrases
  // ...
};
```

This ensures that topic labels are concise and representative of the underlying content.

## Visualization and Interaction

### Bubble Chart Generation

The component visualizes topics using a bubble chart:

```jsx
const prepareBubbleChartData = () => {
  // Create a distributed layout for bubbles
  // Map topics to chart data points with:
  //   - Position (x, y)
  //   - Size based on count
  //   - Topic phrase and keyphrases
  // ...
};
```

The chart is configured with options for tooltips, data labels, and click handling:

```jsx
const bubbleOptions = {
  // Hide axes
  // Configure tooltips to show topic and related phrases
  // Configure data labels to show topic names
  // Set click handler
  // ...
};
```

### User Interaction

When a user clicks on a bubble, the related comments are displayed:

```jsx
const handleBubbleClick = (_, elements) => {
  if (elements && elements.length > 0) {
    const index = elements[0].index;
    const selectedTopicData = topicData[index];
    setSelectedTopic(selectedTopicData.phrase);
    setSelectedComments(selectedTopicData.recentComments);
  }
};
```

The component also highlights occurrences of the selected topic in comments:

```jsx
const highlightKeyPhrase = (comment, phrase) => {
  // Create regex to match the phrase
  // Split comment by matches
  // Return with highlighted spans for matches
  // ...
};
```

## Main Processing Flow

The `processTopicModeling` function orchestrates the entire NLP pipeline:

```jsx
const processTopicModeling = (feedbackData) => {
  // 1. Extract hospital terms and quality descriptors
  const hospitalTerms = extractHospitalTerms(feedbackData);
  const qualityDescriptors = extractHospitalQualityDescriptors(feedbackData);
  
  // 2. Discover relationships between terms
  const termRelationships = discoverHospitalTermRelationships(feedbackData, hospitalTerms);
  
  // 3. Extract phrases from each document
  // 4. Calculate TF-IDF with domain knowledge
  // 5. Group similar phrases
  // 6. Create topic data
  // ...
  
  return topicPhrases;
};
```

This pipeline runs entirely in the browser, performing sophisticated semantic analysis without requiring server-side processing or external APIs.

## Rendering Logic

The component renders several sections based on the current state:
- Rating selector (buttons 1-5)
- Either a loading spinner or the visualization
- Bubble chart of topics when data is loaded
- Key phrases section when a topic is selected
- Related comments when a topic is selected

Each comment displays the feedback text (with the selected topic highlighted), the creation date, and the rating.

This component enables data-driven improvements to hospital services without reading through hundreds of individual comments.
