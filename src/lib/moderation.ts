/**
 * Content moderation utilities for filtering inappropriate content.
 * Checks for profanity, personal information, and rude sentiment.
 */

const PROFANITY_LIST = [
  'fuck', 'shit', 'ass', 'damn', 'bitch', 'bastard', 'crap', 'piss',
  'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut', 'fag', 'nigger',
  'retard', 'twat', 'wanker', 'bollocks', 'arse', 'bugger', 'bloody',
  'tosser', 'prick', 'bellend', 'knob', 'git', 'minger', 'slag',
];

const PROFANITY_VARIATIONS: Record<string, string[]> = {
  fuck: ['f*ck', 'fck', 'fuk', 'fu*k', 'f**k', 'fvck', 'phuck'],
  shit: ['sh*t', 'sht', 'sh1t', 's**t', 'shyt'],
  ass: ['a$$', 'a**', '@ss', '@$$'],
  bitch: ['b*tch', 'b1tch', 'biatch'],
  cunt: ['c*nt', 'cvnt'],
};

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const PHONE_REGEX = /(?:\+44|0)[\s.-]?(?:\d[\s.-]?){9,10}/g;
const UK_POSTCODE_REGEX = /[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/gi;

interface ModerationResult {
  isClean: boolean;
  reasons: string[];
  flaggedWords: string[];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[0-9]/g, (d) => {
      const map: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b' };
      return map[d] || d;
    })
    .replace(/[^a-z\s]/g, '');
}

export function moderateContent(text: string): ModerationResult {
  const reasons: string[] = [];
  const flaggedWords: string[] = [];

  if (!text || text.trim().length === 0) {
    return { isClean: true, reasons: [], flaggedWords: [] };
  }

  const normalizedText = normalizeText(text);
  const words = normalizedText.split(/\s+/);

  for (const word of words) {
    if (PROFANITY_LIST.includes(word)) {
      flaggedWords.push(word);
    }
  }

  for (const [base, variations] of Object.entries(PROFANITY_VARIATIONS)) {
    const lowerText = text.toLowerCase();
    for (const variant of variations) {
      if (lowerText.includes(variant)) {
        flaggedWords.push(base);
      }
    }
  }

  for (const profanity of PROFANITY_LIST) {
    if (normalizedText.includes(profanity) && !flaggedWords.includes(profanity)) {
      flaggedWords.push(profanity);
    }
  }

  if (flaggedWords.length > 0) {
    reasons.push('Contains inappropriate language');
  }

  if (EMAIL_REGEX.test(text)) {
    reasons.push('Contains email address');
  }

  if (PHONE_REGEX.test(text)) {
    reasons.push('Contains phone number');
  }

  if (UK_POSTCODE_REGEX.test(text)) {
    reasons.push('Contains postcode');
  }

  const aggressivePatterns = [
    /\bi\s*(will\s+)?(kill|hurt|attack)\s+(you|them|him|her)/i,
    /\b(die|death)\s+(to\s+)?(you|them)/i,
    /\b(go\s+)?kill\s+yourself/i,
    /\byou('re|\s+are)\s+(stupid|dumb|idiot|moron)/i,
  ];

  for (const pattern of aggressivePatterns) {
    if (pattern.test(text)) {
      reasons.push('Contains aggressive or threatening language');
      break;
    }
  }

  return {
    isClean: reasons.length === 0,
    reasons: Array.from(new Set(reasons)),
    flaggedWords: Array.from(new Set(flaggedWords)),
  };
}

export function sanitizeForDisplay(text: string): string {
  let sanitized = text;

  for (const profanity of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${profanity}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '*'.repeat(profanity.length));
  }

  sanitized = sanitized.replace(EMAIL_REGEX, '[email hidden]');
  sanitized = sanitized.replace(PHONE_REGEX, '[phone hidden]');

  return sanitized;
}
