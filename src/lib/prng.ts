/**
 * 1. HASH GENERATOR (cyrb128)
 * Bármilyen hosszú stringből (pl. a jelszavad) csinál egy 32-bites számot (seed).
 */
export function generateSeed(str: string): number {
    let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
}

/**
 * 2. DETERMINISTIC PRNG (Mulberry32)
 * Ugyanarra a seed-re mindig ugyanazt a "véletlen" számsort adja.
 */
function mulberry32(a: number) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

/**
 * 3. THE SCATTER PROTOCOL (Fisher-Yates Shuffle)
 * Létrehoz egy véletlenszerűen összekevert index-tömböt a képpontokhoz.
 */
export function generateChaosPath(totalPixels: number, password: string): Uint32Array {
    const seed = generateSeed(password);
    const random = mulberry32(seed);
    const path = new Uint32Array(totalPixels);
    
    // Feltöltjük az eredeti sorrenddel
    for (let i = 0; i < totalPixels; i++) {
        path[i] = i;
    }
    
    // Szétzúzzuk a sorrendet a jelszó alapján (Fisher-Yates)
    for (let i = totalPixels - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const temp = path[i];
        path[i] = path[j];
        path[j] = temp;
    }
    
    return path;
}
