import { generateChaosPath } from './prng';

export async function encodeImage(imageSrc: string, payload: Uint8Array, password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return reject(new Error("Canvas not supported"));
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Calculate total bits needed: 32 bits for length + payload bits
      const totalBits = 32 + payload.length * 8;
      const totalPixels = data.length / 4;
      
      // Capacity: 3 bits per pixel (R, G, B)
      const capacity = totalPixels * 3;
      if (totalBits > capacity) {
        return reject(new Error(`Payload too large. Capacity: ${Math.floor(capacity / 8)} bytes, Required: ${Math.ceil(totalBits / 8)} bytes`));
      }
      
      // Generate the deterministic chaos path based on the password
      const path = generateChaosPath(totalPixels, password);
      let bitIndex = 0;
      
      for (let k = 0; k < totalPixels; k++) {
        if (bitIndex >= totalBits) break;
        
        const pixelIndex = path[k] * 4;
        
        for (let j = 0; j < 3; j++) { // R, G, B
          if (bitIndex < totalBits) {
            let bit = 0;
            if (bitIndex < 32) {
              // Write length (32-bit integer, big-endian)
              bit = (payload.length >> (31 - bitIndex)) & 1;
            } else {
              // Write payload
              const payloadBitIndex = bitIndex - 32;
              const byteIndex = Math.floor(payloadBitIndex / 8);
              const bitOffset = 7 - (payloadBitIndex % 8);
              bit = (payload[byteIndex] >> bitOffset) & 1;
            }
            
            // Clear LSB and set it to our bit
            data[pixelIndex + j] = (data[pixelIndex + j] & 0xFE) | bit;
            bitIndex++;
          }
        }
        // Force alpha to 255 to prevent browser from premultiplying RGB values and destroying our LSBs
        data[pixelIndex + 3] = 255;
      }
      
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageSrc;
  });
}

export async function decodeImage(imageSrc: string, password: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return reject(new Error("Canvas not supported"));
      
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      const totalPixels = data.length / 4;
      const capacity = totalPixels * 3;
      
      // Reconstruct the exact same chaos path using the password
      const path = generateChaosPath(totalPixels, password);
      
      let payloadLength = 0;
      let globalBitIndex = 0;
      let payload: Uint8Array | null = null;
      let currentByte = 0;
      
      for (let k = 0; k < totalPixels; k++) {
        const pixelIndex = path[k] * 4;
        
        for (let j = 0; j < 3; j++) {
          const bit = data[pixelIndex + j] & 1;
          
          if (globalBitIndex < 32) {
            payloadLength = (payloadLength << 1) | bit;
            
            if (globalBitIndex === 31) {
              // We just finished reading the length
              if (payloadLength <= 0 || payloadLength * 8 + 32 > capacity || payloadLength > 50000000) {
                return reject(new Error("No valid hidden data found or image corrupted."));
              }
              payload = new Uint8Array(payloadLength);
            }
          } else if (payload) {
            const payloadBitIndex = globalBitIndex - 32;
            
            if (payloadBitIndex < payloadLength * 8) {
              currentByte = (currentByte << 1) | bit;
              
              if ((payloadBitIndex + 1) % 8 === 0) {
                payload[Math.floor(payloadBitIndex / 8)] = currentByte;
                currentByte = 0;
              }
            } else {
              // Done reading
              return resolve(payload);
            }
          }
          globalBitIndex++;
        }
        
        // Optimization: Stop reading once we have the full payload
        if (payload && globalBitIndex - 32 >= payloadLength * 8) {
          break;
        }
      }
      
      if (payload) {
        resolve(payload);
      } else {
        reject(new Error("Failed to extract data"));
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageSrc;
  });
}
