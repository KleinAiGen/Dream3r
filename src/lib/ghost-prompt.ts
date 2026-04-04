const SUBJECTS = [
    "A brutalist concrete server room",
    "An abandoned subway station reclaimed by nature",
    "A macro close-up of a damaged microchip",
    "A lone figure standing in a neon-lit alleyway",
    "A minimalist architectural structure in the desert",
    "A dense foggy forest at twilight",
    "An old CRT monitor displaying static",
    "A highly detailed mechanical watch interior",
    "A vast, empty library with floating dust particles"
];

const ATMOSPHERES = [
    "covered in thick, mysterious fog",
    "bathed in bioluminescent glow",
    "during a heavy, cinematic rainstorm",
    "in absolute, terrifying darkness",
    "illuminated by harsh fluorescent lights",
    "with a cyberpunk, dystopian vibe"
];

const LIGHTING = [
    "dramatic volumetric lighting",
    "neon pink and cyan reflections",
    "harsh shadows and high contrast",
    "soft ambient overcast light",
    "cinematic rim lighting"
];

const STYLES = [
    "shot on Kodak Portra 400",
    "Unreal Engine 5 architectural render",
    "glitch art aesthetic",
    "1980s VHS tape quality",
    "hyper-realistic photogrammetry",
    "noir detective film style",
    "cyberpunk digital illustration"
];

const TECHNICAL = [
    "8k resolution, highly detailed",
    "macro photography, deep depth of field",
    "wide angle lens, geometric symmetry",
    "cinematic composition, masterpiece"
];

/**
 * Kriptográfiailag biztonságos véletlenszám-generátor egy tömb elemének kiválasztásához.
 */
function secureRandomPick(arr: string[]): string {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return arr[array[0] % arr.length];
}

/**
 * GENERATE GHOST PROMPT
 * API hívás nélkül hoz létre egyedi, magas minőségű promptot.
 */
export function generateGhostPrompt(): string {
    const subject = secureRandomPick(SUBJECTS);
    const atmosphere = secureRandomPick(ATMOSPHERES);
    const light = secureRandomPick(LIGHTING);
    const style = secureRandomPick(STYLES);
    const tech = secureRandomPick(TECHNICAL);

    // Prompt összerakása egy tökéletes text-to-image formátumba
    return `${subject}, ${atmosphere}, ${light}, ${style}, ${tech}.`;
}
