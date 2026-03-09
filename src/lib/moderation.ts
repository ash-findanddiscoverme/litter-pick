/**
 * Client-side image moderation using NSFWJS (TensorFlow.js).
 * Runs entirely in the browser — no server calls, no data leaves the device.
 *
 * Loaded from CDN at runtime to avoid bundling TensorFlow (~24MB) into
 * the edge function output, which has a 4MB limit on Cloudflare Pages.
 *
 * Categories: Drawing, Hentai, Neutral, Porn, Sexy
 * We reject images where Porn + Hentai + Sexy combined confidence > 0.60
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

let modelPromise: Promise<any> | null = null;

/** Load a script from CDN and return when ready */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

/** Lazy-load TF.js + NSFWJS from CDN, then load model (~4MB, cached) */
async function getModel(): Promise<any> {
  if (!modelPromise) {
    modelPromise = (async () => {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.21.0/dist/tf.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/nsfwjs@2.4.2/dist/nsfwjs.min.js');

      const nsfwjs = (window as any).nsfwjs;
      if (!nsfwjs) throw new Error('NSFWJS failed to load from CDN');

      const model = await nsfwjs.load('https://nsfwjs.com/quant_mid/', { size: 224 });
      return model;
    })();
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
