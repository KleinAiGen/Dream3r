import CryptoJS from 'crypto-js';

const DELIMITER = ':::DREAM3R:::';

export async function encodeMessage(dataUrl: string, message: string, password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 1. Encrypt message
      const encrypted = CryptoJS.AES.encrypt(message, password).toString();
      const payload = encrypted + DELIMITER;
      
      // 2. Convert payload to binary
      const encoder = new TextEncoder();
      const bytes = encoder.encode(payload);
      let binaryPayload = '';
      for (let i = 0; i < bytes.length; i++) {
        binaryPayload += bytes[i].toString(2).padStart(8, '0');
      }

      // 3. Load image
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Check capacity (3 channels per pixel, 1 bit per channel)
        const capacity = (data.length / 4) * 3;
        if (binaryPayload.length > capacity) {
          return reject(new Error(`Image is too small for this payload. Need ${binaryPayload.length} bits, but image only has ${capacity} bits of capacity.`));
        }

        let bitIndex = 0;
        for (let i = 0; i < data.length; i++) {
          if ((i + 1) % 4 === 0) continue; // Skip alpha channel
          if (bitIndex < binaryPayload.length) {
            const bit = parseInt(binaryPayload[bitIndex], 10);
            // Clear LSB and set it to our bit
            data[i] = (data[i] & 0xFE) | bit;
            bitIndex++;
          } else {
            break;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png')); // MUST be PNG to preserve LSB
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    } catch (err) {
      reject(err);
    }
  });
}

export async function decodeMessage(dataUrl: string, password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let binaryPayload = '';
      for (let i = 0; i < data.length; i++) {
        if ((i + 1) % 4 === 0) continue; // Skip alpha channel
        binaryPayload += (data[i] & 1).toString();
      }

      // Convert binary to string in chunks of 8
      const bytes: number[] = [];
      for (let i = 0; i < binaryPayload.length; i += 8) {
        const byteStr = binaryPayload.slice(i, i + 8);
        if (byteStr.length === 8) {
          bytes.push(parseInt(byteStr, 2));
        }
      }

      const decoder = new TextDecoder();
      const fullText = decoder.decode(new Uint8Array(bytes));
      
      const delimiterIndex = fullText.indexOf(DELIMITER);
      if (delimiterIndex === -1) {
        return reject(new Error('No hidden message found or image corrupted.'));
      }

      const encryptedMessage = fullText.substring(0, delimiterIndex);
      
      try {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, password);
        const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedMessage) throw new Error('Wrong password or corrupted data');
        resolve(decryptedMessage);
      } catch (e) {
        reject(new Error('Decryption failed. Wrong password or corrupted image.'));
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}
