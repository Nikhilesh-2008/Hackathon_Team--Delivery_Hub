/**
 * Deterministic local text embeddings for the rulebook RAG pipeline.
 *
 * No external model or API key is required: each document chunk is mapped to a
 * fixed-width, L2-normalised vector built from hashed unigrams and bigrams
 * (feature hashing). Cosine similarity between two such vectors gives a stable
 * semantic-ish signal, and it is fully reproducible across processes because
 * the hash is a deterministic FNV-1a function.
 *
 * Swap `embedText` for a hosted embedding model later without touching the
 * retrieval or answer code: the vector width is stored with each chunk.
 */

export const EMBEDDING_DIMENSIONS = 256;
export const EMBEDDING_MODEL = 'local-feature-hash-v1';

const STOPWORDS = new Set(
  (
    'a,an,the,and,or,but,if,then,than,that,this,these,those,is,are,was,were,be,been,being,am,' +
    'do,does,did,have,has,had,will,would,should,could,can,may,might,must,shall,' +
    'of,in,on,at,to,for,from,by,with,without,about,into,over,under,again,further,once,' +
    'here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,' +
    'no,nor,not,only,own,same,so,too,very,just,now,i,you,he,she,it,we,they,me,him,her,us,them,' +
    'my,your,his,its,our,their,what,which,who,whom,whose,also,per,via'
  ).split(',')
);

// FNV-1a 32-bit hash: fast, deterministic, good enough for feature hashing.
const fnv1a = (token) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
};

const normalizeWord = (word) => {
  if (word.length > 3 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith('ses')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
};

/** Tokenise into meaningful, normalised terms (stopwords and 1-2 char tokens removed). */
export const tokenize = (text) => {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
    .map(normalizeWord);
};

export const uniqueTerms = (text) => [...new Set(tokenize(text))];

const addFeature = (vector, feature, weight) => {
  const hash = fnv1a(feature);
  const index = hash % EMBEDDING_DIMENSIONS;
  // Sign derived from the high bits keeps collisions from always reinforcing.
  const sign = (hash >>> 16) & 1 ? 1 : -1;
  vector[index] += sign * weight;
};

/**
 * Produce an L2-normalised feature-hashed vector for a piece of text.
 * Unigrams carry full weight; bigrams add phrase sensitivity at half weight.
 */
export const embedText = (text) => {
  const tokens = tokenize(text);
  const vector = new Float64Array(EMBEDDING_DIMENSIONS);

  for (let i = 0; i < tokens.length; i += 1) {
    addFeature(vector, `u:${tokens[i]}`, 1);
    if (i + 1 < tokens.length) {
      addFeature(vector, `b:${tokens[i]}_${tokens[i + 1]}`, 0.5);
    }
  }

  let magnitude = 0;
  for (let i = 0; i < vector.length; i += 1) magnitude += vector[i] * vector[i];
  magnitude = Math.sqrt(magnitude);

  if (magnitude === 0) return new Array(EMBEDDING_DIMENSIONS).fill(0);
  return Array.from(vector, (value) => Number((value / magnitude).toFixed(6)));
};

/** Cosine similarity for L2-normalised vectors (falls back to raw cosine). */
export const cosineSimilarity = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || a.length !== b.length) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

export default { embedText, cosineSimilarity, tokenize, uniqueTerms, EMBEDDING_DIMENSIONS, EMBEDDING_MODEL };
