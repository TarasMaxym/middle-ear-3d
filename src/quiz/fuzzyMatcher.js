import { STRUCTURE_LIST } from '../data/anatomyData.js';

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'of',
  'for',
  'to',
  'in',
  'on',
  'at',
  'by',
  'and',
  'or',
  'with',
  'part',
  'portion',
  'region',
  'area',
  'structure',
  'landmark'
]);

// Mutually exclusive anatomical qualifier families:
// If an alias contains a concept from one slot of a group and the user explicitly typed a DIFFERENT slot
// from that same group, fuzzy edit-distance is forbidden from treating it as a spelling typo.
const MUTEX_CONCEPT_GROUPS = [
  [['anterior', 'anterius'], ['posterior', 'posterius']],
  [['superior', 'superius'], ['inferior', 'inferius']],
  [['medial'], ['lateral', 'lateralis']],
  [['internal'], ['external']],
  [['greater', 'major'], ['lesser', 'minor']],
  [['short', 'breve', 'brevis'], ['long', 'longum']],
  [['oval', 'ovalis', 'vestibuli', 'vestibular'], ['round', 'rotunda', 'cochleae']],
  [['tensa'], ['flaccida', 'shrapnell', 'shrapnells']],
  [['malleus', 'mallei', 'mallear', 'hammer'], ['incus', 'incudis', 'incudal', 'anvil'], ['stapes', 'stapedis', 'stapedial', 'stirrup']],
  [
    ['head', 'caput', 'capitulum'],
    ['neck', 'collum'],
    ['handle', 'manubrium'],
    ['footplate', 'base', 'basis'],
    ['lenticular', 'lenticularis']
  ],
  [['tendon', 'tendo'], ['belly'], ['semicanal', 'semicanalis']],
  [['cn5'], ['cn7'], ['cn8'], ['cn9'], ['cn10']],
  [['artery', 'carotid', 'ica'], ['vein', 'jugular', 'ijv']]
];

const PARENT_SYNONYMS = {
  malleus: ['malleus', 'hammer', 'mallear'],
  incus: ['incus', 'anvil', 'incudal'],
  stapes: ['stapes', 'stirrup', 'stapedial'],
  tympanic_membrane: ['tympanic membrane', 'eardrum', 'ear drum', 'drum', 'tm', 'membrana tympani'],
  tensor_tympani: ['tensor tympani', 'tensor tympani muscle'],
  stapedius_muscle: ['stapedius', 'stapedius muscle'],
  round_window: ['round window', 'fenestra cochleae'],
  inner_ear_labyrinth: ['inner ear', 'bony labyrinth', 'labyrinth'],
  external_ear: ['outer ear', 'external ear'],
  middle_cranial_fossa: ['middle cranial fossa', 'brain', 'meninges']
};

/**
 * Normalizes raw user/alias anatomical text into clean comparable tokens.
 */
export function normalizeAnatomicalText(raw = '') {
  let s = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Canonicalize cranial nerve notations & standard abbreviations
  s = s
    .replace(/\b(?:cranial nerve|cn)\s*(?:viii|8)\b/g, 'cn8')
    .replace(/\b8th cranial nerve\b/g, 'cn8')
    .replace(/\b(?:cranial nerve|cn)\s*(?:vii|7)\b/g, 'cn7')
    .replace(/\b7th cranial nerve\b/g, 'cn7')
    .replace(/\b(?:cranial nerve|cn)\s*(?:ix|9)\b/g, 'cn9')
    .replace(/\b9th cranial nerve\b/g, 'cn9')
    .replace(/\b(?:cranial nerve|cn)\s*(?:v3|v|5)\b/g, 'cn5')
    .replace(/\b(?:cranial nerve|cn)\s*(?:x|10)\b/g, 'cn10')
    .replace(/\beardrum\b/g, 'tympanic membrane')
    .replace(/\bear drum\b/g, 'tympanic membrane')
    .replace(/\bhammer\b/g, 'malleus')
    .replace(/\banvil\b/g, 'incus')
    .replace(/\bstirrup\b/g, 'stapes')
    .replace(/\bscc\b/g, 'semicircular canal')
    .replace(/\beac\b/g, 'external acoustic meatus')
    .replace(/\beustachian\b/g, 'eustachian');

  const rawTokens = s.split(' ').filter(Boolean);
  const filtered = rawTokens.filter((t) => !STOP_WORDS.has(t));
  const tokens = filtered.length > 0 ? filtered : rawTokens;
  return {
    joined: tokens.join(' '),
    sortedJoined: [...tokens].sort().join(' '),
    tokens
  };
}

/**
 * Optimal String Alignment / Damerau-Levenshtein distance (handles adjacent letter transpositions as 1 edit).
 */
export function damerauLevenshtein(a, b) {
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  const dp = Array.from({ length: la + 1 }, () => new Uint16Array(lb + 1));
  for (let i = 0; i <= la; i++) dp[i][0] = i;
  for (let j = 0; j <= lb; j++) dp[0][j] = j;

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, dp[i - 2][j - 2] + 1);
      }
      dp[i][j] = best;
    }
  }
  return dp[la][lb];
}

function allowedTokenEdits(len) {
  if (len <= 3) return 0;
  if (len <= 6) return 1;
  if (len <= 12) return 2;
  return 3;
}

function hasQualifierConflict(userTokens, aliasTokens) {
  const uSet = new Set(userTokens);
  const aSet = new Set(aliasTokens);

  for (const group of MUTEX_CONCEPT_GROUPS) {
    let aliasSlot = -1;
    let multipleAliasSlots = false;
    group.forEach((slotWords, idx) => {
      if (slotWords.some((w) => aSet.has(w))) {
        if (aliasSlot !== -1) multipleAliasSlots = true;
        aliasSlot = idx;
      }
    });
    if (multipleAliasSlots) continue; // e.g., incudomallear mentions two ossicle roots

    // Check if user explicitly typed a conflicting slot
    for (let idx = 0; idx < group.length; idx++) {
      if (idx === aliasSlot) continue;
      if (group[idx].some((w) => uSet.has(w))) {
        // If alias required aliasSlot (or even if alias didn't mention it, e.g. user typed "anterior" on "posterior"), block if alias had a slot!
        if (aliasSlot !== -1) {
          return true;
        }
      }
    }
  }
  return false;
}

function getCandidateAliases(structure) {
  const rawList = [
    ...(structure.aliases || []),
    structure.shortName.replace(/\([^)]*\)/g, '').trim(),
    structure.name.replace(/\([^)]*\)/g, '').replace(/—/g, ' ').trim()
  ];
  const seen = new Set();
  const normList = [];
  rawList.forEach((txt) => {
    if (!txt) return;
    const norm = normalizeAnatomicalText(txt);
    if (!norm.joined || seen.has(norm.joined)) return;
    seen.add(norm.joined);
    normList.push({ raw: txt, ...norm });
  });
  return normList;
}

/**
 * Computes match score against a single structure's aliases.
 * Returns null if no match, or { exact: boolean, similarity: number, matchedAlias: string }
 */
export function matchAgainstStructure(userNorm, structure) {
  if (!userNorm.joined) return null;
  const aliases = getCandidateAliases(structure);

  // 1. Exact or word-order-invariant exact match
  for (const al of aliases) {
    if (userNorm.joined === al.joined || userNorm.sortedJoined === al.sortedJoined) {
      return { exact: true, similarity: 1.0, matchedAlias: al.raw };
    }
  }

  // 2. Fuzzy typo-tolerant match (with anatomical mutex conflict protection!)
  let bestMatch = null;

  for (const al of aliases) {
    if (hasQualifierConflict(userNorm.tokens, al.tokens)) continue;

    // Require token count not wildly different (e.g. typing 1 vague word shouldn't match a 4-word specific part)
    if (al.tokens.length >= 2 && userNorm.tokens.length === 1 && userNorm.joined.length < al.joined.length * 0.72) {
      continue;
    }

    // Whole-phrase Damerau-Levenshtein similarity (comparing both natural & sorted token order)
    const distDirect = damerauLevenshtein(userNorm.joined, al.joined);
    const distSorted = damerauLevenshtein(userNorm.sortedJoined, al.sortedJoined);
    const minDist = Math.min(distDirect, distSorted);
    const maxLen = Math.max(userNorm.joined.length, al.joined.length);
    const phraseSim = 1 - minDist / Math.max(1, maxLen);

    // Token-level greedy alignment: every alias token should find a close user token
    let allAliasTokensMatched = true;
    for (const aTok of al.tokens) {
      const maxEdits = allowedTokenEdits(aTok.length);
      const found = userNorm.tokens.some((uTok) => damerauLevenshtein(uTok, aTok) <= maxEdits);
      if (!found) {
        allAliasTokensMatched = false;
        break;
      }
    }

    // Extra check: user shouldn't tack on completely unrelated extra words unless close
    const extraTokens = userNorm.tokens.length - al.tokens.length;
    if (allAliasTokensMatched && extraTokens <= 1 && phraseSim >= 0.74) {
      if (!bestMatch || phraseSim > bestMatch.similarity) {
        bestMatch = { exact: false, similarity: phraseSim, matchedAlias: al.raw };
      }
    } else if (phraseSim >= 0.84 && maxLen >= 6) {
      // Handles accidental space omission/split like "earcanal" or "chordatympani"
      if (!bestMatch || phraseSim > bestMatch.similarity) {
        bestMatch = { exact: false, similarity: phraseSim, matchedAlias: al.raw };
      }
    }
  }

  return bestMatch;
}

/**
 * Evaluates a user's free-recall typed answer against the highlighted target structure.
 * Returns:
 * - { status: 'correct', exact: boolean, target, matchedAlias }
 * - { status: 'almost', message: string } (when user named the broader parent bone/organ instead of the specific highlighted sub-part/tendon!)
 * - { status: 'wrong', matchedOther: Structure | null }
 */
export function evaluateTypedAnatomyAnswer(rawInput, targetStructure, opts = {}) {
  const userNorm = normalizeAnatomicalText(rawInput);
  if (!userNorm.joined) {
    return { status: 'empty' };
  }

  // If the user already named the parent bone/complex on the previous try (e.g. "Malleus") and now types just "neck" or "tendon"
  if (opts.parentAlreadyNamed && targetStructure.parentName) {
    const cleanParent = targetStructure.parentName.replace(/\([^)]*\)/g, '').trim();
    const combinedNorm = normalizeAnatomicalText(`${rawInput} ${cleanParent}`);
    const combinedHit = matchAgainstStructure(combinedNorm, targetStructure);
    if (combinedHit) {
      return {
        status: 'correct',
        exact: combinedHit.exact,
        similarity: combinedHit.similarity,
        matchedAlias: combinedHit.matchedAlias,
        target: targetStructure
      };
    }
  }

  // Special specificity check BEFORE generic matching:
  // e.g. if target is Tendon of Tensor Tympani / Tendon of Stapedius, and user omitted "tendon" (typed just "tensor tympani" or "stapedius" or "... muscle")
  if (
    (targetStructure.id === 'tensor_tympani_tendon' || targetStructure.id === 'stapedius_tendon') &&
    !userNorm.tokens.some((t) => damerauLevenshtein(t, 'tendon') <= 1 || t === 'tendo')
  ) {
    const parentWords = PARENT_SYNONYMS[targetStructure.parentGroup] || [];
    const hitParent = parentWords.some((pw) => {
      const pNorm = normalizeAnatomicalText(pw);
      return damerauLevenshtein(userNorm.joined, pNorm.joined) <= 2;
    });
    if (hitParent) {
      return {
        status: 'almost',
        message: `Almost! You identified the ${targetStructure.parentName} system — look specifically at the glistening white cord highlighted here (is it the belly, tendon, or bony housing?)!`
      };
    }
  }

  // 1. Check direct or fuzzy match against the target structure
  const targetHit = matchAgainstStructure(userNorm, targetStructure);
  if (targetHit) {
    return {
      status: 'correct',
      exact: targetHit.exact,
      similarity: targetHit.similarity,
      matchedAlias: targetHit.matchedAlias,
      target: targetStructure
    };
  }

  // 2. Check if user named the broader PARENT bone/membrane/complex when a specific sub-part is highlighted!
  if (targetStructure.parentGroup) {
    const parentSynonyms = PARENT_SYNONYMS[targetStructure.parentGroup] || [];
    const namedParentOnly = parentSynonyms.some((pw) => {
      const pNorm = normalizeAnatomicalText(pw);
      return (
        userNorm.joined === pNorm.joined ||
        (pNorm.joined.length >= 5 && damerauLevenshtein(userNorm.joined, pNorm.joined) <= 1)
      );
    });
    if (namedParentOnly) {
      return {
        status: 'almost',
        message: `Close — that belongs to the ${targetStructure.parentName}! Be more specific: which exact part, region, or process of the ${targetStructure.parentName} is highlighted?`
      };
    }

    // Also allow typing JUST the sub-part name once they already know the parent or in general?
    // Wait: if someone types "manubrium" (already an alias), it matched above; what if they type just "pars flaccida" (already an alias)? Matched above!
  }

  // 3. Check if the user's answer actually matches ANOTHER structure in the 3D scene so we can give smart contrastive feedback!
  let bestOther = null;
  let bestOtherSim = 0;
  for (const other of STRUCTURE_LIST) {
    if (other.id === targetStructure.id) continue;
    const hit = matchAgainstStructure(userNorm, other);
    if (hit && hit.similarity > bestOtherSim) {
      bestOtherSim = hit.similarity;
      bestOther = other;
    }
  }

  return {
    status: 'wrong',
    matchedOther: bestOther
  };
}

/**
 * Generates a masked letter hint like "L _ _ _ _ _ _ _ _ _   P _ _ _ _ _ _   (I _ _ _ _ _ _)" from shortName.
 */
export function buildMaskedLetterHint(structure) {
  const clean = structure.shortName.replace(/\s*\([^)]*\)\s*/g, '').trim();
  return clean
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 2) return word;
      return word[0] + word.slice(1).replace(/[A-Za-z]/g, '_');
    })
    .join('  ');
}
