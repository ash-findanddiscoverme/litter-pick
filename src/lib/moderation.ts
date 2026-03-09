'use client';

/**
 * Client-side image moderation using NSFWJS (TensorFlow.js).
 * Runs entirely in the browser — no server calls, no data leaves the device.
 *
 * Categories: Drawing, Hentai, Neutral, Porn, Sexy
 * We reject images where Porn + Hentai + Sexy combined confidence > 0.60
 */

import type * as nsfwjs from 'nsfwjs';

let modelPromise: Promise<nsfwjs.NSFWJS> | null = null;

/** Lazy-load the NSFW model (cached after first call, ~4MB download) */
async function getModel(): Promise<nsfwjs.NSFWJS> {
  if (!modelPromise) {
    modelPromise = import('nsfwjs').then(async (mod) => {
      // Use the MobileNetV2 mid model for better accuracy (~93%)
      const model = await mod.load(
        'https://nsfwjs.com/quant_mid/',
        { size: 224 } as Parameters<typeof mod.load>[1]
      );
      return model;
    });
  }
  return modelPromise;
}

export interface ModerationResult {
  safe: boolean;
  /** Short user-facing reason if blocked */
  reason?: string;
  /** Raw category scores for debugging */
  scores?: Record<string, number>;
}

/**
 * Check whether an image file is safe to upload.
 * Loads the image into an HTMLImageElement for TF.js classification.
 */
export async function checkImageSafety(file: File): Promise<ModerationResult> {
  try {
    const model = await getModel();

    // Create an Image element for classification
    const img = await fileToImage(file);
    const predictions = await model.classify(img);

    // Build scores map
    const scores: Record<string, number> = {};
    for (const p of predictions) {
      scores[p.className] = p.probability;
    }

    const unsafeScore =
      (scores['Porn'] || 0) +
      (scores['Hentai'] || 0) +
      (scores['Sexy'] || 0);

    if (unsafeScore > 0.60) {
      return {
        safe: false,
        reason: 'This image appears to contain inappropriate content. Please upload a photo of litter instead.',
        scores,
      };
    }

    return { safe: true, scores };
  } catch (err) {
    // If moderation fails (e.g. model didn't load), allow the upload
    // rather than blocking users. Log for debugging.
    console.warn('Image moderation check failed, allowing upload:', err);
    return { safe: true };
  }
}

/** Convert a File to an HTMLImageElement */
function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for moderation'));
    };
    img.src = URL.createObjectURL(file);
  });
}
