import dotenv from 'dotenv';
import { createSignature } from './utils/signature.js';
import crypto from 'crypto';

dotenv.config();

const partnerId = process.env.SHOPEE_PARTNER_ID || '';
const partnerKey = process.env.SHOPEE_PARTNER_KEY || '';
const timestamp = 1763344835; // Dùng timestamp từ URL test của bạn

console.log('=== Debug Signature ===');
console.log('Partner ID:', partnerId);
console.log('Partner Key:', partnerKey);
console.log('Timestamp:', timestamp);
console.log('Expected Signature:', '597aa733a47e39384c00b88f37ec8367da81291d3a4f9ed3fedc8689433114dd');
console.log();

// Test 1: Full path
const apiPath1 = '/api/v2/product/get_item_base_info';
const sig1 = createSignature(partnerId, apiPath1, timestamp, partnerKey);
console.log('Test 1 - Full path:', apiPath1);
console.log('  Signature:', sig1);
console.log('  Match:', sig1 === '597aa733a47e39384c00b88f37ec8367da81291d3a4f9ed3fedc8689433114dd');
console.log();

// Test 2: Without /api/v2 prefix
const apiPath2 = 'product/get_item_base_info';
const sig2 = createSignature(partnerId, apiPath2, timestamp, partnerKey);
console.log('Test 2 - Without /api/v2:', apiPath2);
console.log('  Signature:', sig2);
console.log('  Match:', sig2 === '597aa733a47e39384c00b88f37ec8367da81291d3a4f9ed3fedc8689433114dd');
console.log();

// Test 3: With leading slash only
const apiPath3 = '/product/get_item_base_info';
const sig3 = createSignature(partnerId, apiPath3, timestamp, partnerKey);
console.log('Test 3 - With / prefix:', apiPath3);
console.log('  Signature:', sig3);
console.log('  Match:', sig3 === '597aa733a47e39384c00b88f37ec8367da81291d3a4f9ed3fedc8689433114dd');

