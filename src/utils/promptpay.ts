/**
 * Utility to generate Thailand PromptPay QR Code Payload
 */

function crc16(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates PromptPay payload string.
 * @param target Mobile number (e.g. 0812345678) or National ID (e.g. 1100123456789)
 * @param amount Optional payment amount
 */
export function generatePromptPayPayload(target: string, amount?: number): string {
  // Clean target
  const cleanTarget = target.replace(/[^0-9]/g, '');
  
  let formattedTarget = '';
  let targetType = ''; // '01' for Mobile, '02' for National ID

  if (cleanTarget.length === 10) {
    // Mobile phone
    // e.g. 0812345678 -> 0066812345678
    formattedTarget = '0066' + cleanTarget.substring(1);
    targetType = '01';
  } else if (cleanTarget.length === 13) {
    // National ID
    formattedTarget = cleanTarget;
    targetType = '02';
  } else {
    // Fallback or invalid
    formattedTarget = cleanTarget;
    targetType = cleanTarget.length > 10 ? '02' : '01';
  }

  // 29: Merchant Account Information
  // 00: AID (A000000677010111)
  // 01: Mobile Target OR 02: ID Card Target
  const subTag00 = '0016A000000677010111';
  const subTagValue = formattedTarget;
  const subTagLength = subTagValue.length.toString().padStart(2, '0');
  const subTag01or02 = `${targetType}${subTagLength}${subTagValue}`;
  
  const merchantInfoValue = `${subTag00}${subTag01or02}`;
  const merchantInfoLength = merchantInfoValue.length.toString().padStart(2, '0');
  const tag29 = `29${merchantInfoLength}${merchantInfoValue}`;

  // Build payload segments
  let payload = '000201'; // Payload Format Indicator
  payload += amount ? '010212' : '010211'; // Point of Initiation Method: 12 (Dynamic), 11 (Static)
  payload += tag29;
  payload += '5303764'; // Transaction Currency: THB (764)
  
  if (amount && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    const amountLength = formattedAmount.length.toString().padStart(2, '0');
    payload += `54${amountLength}${formattedAmount}`; // Transaction Amount
  }
  
  payload += '5802TH'; // Country Code

  // Checksum tag prefix (Tag 63, length 04)
  payload += '6304';

  // Calculate CRC16 CCITT
  const checksum = crc16(payload);
  return payload + checksum;
}

/**
 * Returns QR Code image URL using qrserver API
 */
export function getPromptPayQRImageUrl(target: string, amount?: number): string {
  const payload = generatePromptPayPayload(target, amount);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`;
}
