/**
 * GENERATE UNTOUCHABLE WEALTH
 * Katonai szintű, hálózatfüggetlen entrópiagenerátor.
 * 256-bites (32 bájt) véletlenszámot hoz létre, ami kriptovaluta 
 * privát kulcsként vagy BIP39 seed alapként funkcionál.
 */
export function generateOfflinePrivateKey(): string {
    // 1. Kérünk 32 bájtnyi nyers entrópiát a böngésző hardveres/OS szintű RNG-jétől
    const entropy = new Uint8Array(32);
    window.crypto.getRandomValues(entropy);
    
    // 2. Hexadecimális formátummá alakítjuk (szabványos 64 karakteres privát kulcs)
    const privateKey = Array.from(entropy)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
        
    return `0x${privateKey}`;
}

/**
 * Egy kamu "számla" vagy adatstruktúra, ami hitelesnek tűnik,
 * de valójában egy hideg tárca (Cold Wallet) generátor.
 */
export function createColdStoragePayload(assetName: string = 'ETH'): string {
    const key = generateOfflinePrivateKey();
    const timestamp = new Date().toISOString();
    
    // Formázott, strukturált payload, ami készen áll az AES-GCM titkosításra
    return `=== PROJECT MAYHEM COLD STORAGE ===\n` +
           `ASSET: ${assetName}\n` +
           `GENERATED: ${timestamp}\n` +
           `PRIVATE KEY:\n${key}\n` +
           `===================================\n` +
           `WARNING: ANYONE WITH THIS KEY CONTROLS THE FUNDS.`;
}
