// Extract keywords from text
export const extractKeywords = (text) => {
  // Remove common words and extract meaningful keywords
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ])

  // Clean and split text
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word))

  // Count word frequency
  const frequency = {}
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })

  // Sort by frequency and return top keywords
  const keywords = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)

  return keywords
}

// Generate keywords from video filename
export const generateKeywordsFromFilename = (filename) => {
  const keywords = extractKeywords(filename)
  
  // Add some common sports/content related keywords
  const additionalKeywords = [
    'highlights',
    'game',
    'match',
    'championship',
    'finals',
    'season',
    'recap',
    'analysis'
  ]

  // Combine and deduplicate
  const allKeywords = [...new Set([...keywords, ...additionalKeywords.slice(0, 5)])]
  
  return allKeywords.slice(0, 8)
}

// Extract keywords using NLP (placeholder for future ML integration)
export const extractKeywordsNLP = async (text) => {
  // In production, integrate with NLP services like:
  // - Google Cloud Natural Language API
  // - AWS Comprehend
  // - Azure Text Analytics
  
  return extractKeywords(text)
}
