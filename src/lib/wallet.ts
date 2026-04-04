// src/lib/wallet.ts
import { Wallet } from 'ethers';

/**
 * Ethereum (ETH) Cold Wallet generálása offline
 * Generál egy véletlenszerű Private Key-t és a hozzá tartozó Public Address-t.
 */
export function generateEthWallet(): string {
    // Kriptográfiailag biztonságos véletlenszerű wallet generálása
    const wallet = Wallet.createRandom();
    
    const timestamp = new Date().toISOString();
    
    return `=== DREAM3R ETH COLD WALLET ===\n` +
           `GENERATED: ${timestamp}\n` +
           `OFFLINE PROTOCOL: ACTIVE\n\n` +
           `[PUBLIC ADDRESS - ETHEREUM]\n` +
           `${wallet.address}\n\n` +
           `[PRIVATE KEY - 256 BIT]\n` +
           `${wallet.privateKey}\n\n` +
           `===============================\n` +
           `FSOCIETY. DO NOT SHARE.`;
}
