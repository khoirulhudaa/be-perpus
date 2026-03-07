// const rateLimit = require('express-rate-limit');

// const commonConfig = {
//   standardHeaders: 'draft-8',
//   legacyHeaders: false,
//   statusCode: 429,
//   // Penting: Pastikan IP diidentifikasi dengan benar lewat header Cloudflare jika perlu
//   keyGenerator: (req) => req.headers['cf-connecting-ip'] || req.ip, 
// };

// const globalLimiter = rateLimit({
//   ...commonConfig,
//   windowMs: 15 * 60 * 1000,
//   limit: 500, 
//   message: { success: false, message: 'Terlalu banyak permintaan, coba lagi nanti.' },
// });

// const strictLimiter = rateLimit({
//   ...commonConfig,
//   windowMs: 60 * 1000,
//   limit: 10,
//   message: { success: false, message: 'Terlalu banyak percobaan, tunggu 1 menit.' },
// });

// const uploadLimiter = rateLimit({
//   ...commonConfig,
//   windowMs: 60 * 60 * 1000,
//   limit: 50,
//   message: { success: false, message: 'Batas upload per jam tercapai (50/jam).' },
// });

// // Export supaya bisa dipakai per route atau global
// module.exports = {
//   globalLimiter,
//   strictLimiter,
//   uploadLimiter,
// };



// =========================================================

// UNTUK AAPNEL KALAU ATAS UNTUK VERCEL

// const rateLimit = require('express-rate-limit');

// // Helper untuk mematikan validasi yang bikin error di aaPanel/Cloudflare
// const commonConfig = {
//   standardHeaders: 'draft-8',
//   legacyHeaders: false,
//   statusCode: 429,
//   // Baris di bawah ini WAJIB ada supaya tidak error ERR_ERL_KEY_GEN_IPV6
//   validate: { xForwardedForHeader: false },
// };

// // 1. Global limiter
// const globalLimiter = rateLimit({
//   ...commonConfig,
//   windowMs: 15 * 60 * 1000,
//   limit: 500,
//   message: { success: false, message: 'Terlalu banyak permintaan, coba lagi nanti.' },
// });

// // 2. Stricter limiter (Login, Create, dll)
// const strictLimiter = rateLimit({
//   ...commonConfig,
//   windowMs: 60 * 1000,
//   limit: 10,
//   message: { success: false, message: 'Terlalu banyak percobaan, tunggu 1 menit.' },
// });

// // 3. Limiter khusus upload
// const uploadLimiter = rateLimit({
//   ...commonConfig,
//   windowMs: 60 * 60 * 1000,
//   limit: 50,
//   message: { success: false, message: 'Batas upload per jam tercapai (50/jam).' },
// });

// module.exports = {
//   globalLimiter,
//   strictLimiter,
//   uploadLimiter,
// };



// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// 1. Global limiter: berlaku untuk semua route (bisa di-apply di app level)
// Cocok untuk proteksi umum terhadap abuse/DoS sederhana
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,        // 15 menit
  limit: 500,                      // max 300 request per IP dalam 15 menit
  standardHeaders: 'draft-8',      // kirim header RateLimit modern (draft-8)
  legacyHeaders: false,            // matikan header lama X-RateLimit-*
  message: { success: false, message: 'Terlalu banyak permintaan, coba lagi nanti.' },
  statusCode: 429,
});

// 2. Stricter limiter untuk route sensitif (misal login, create berita, upload)
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,             // 1 menit
  limit: 10,                       // max 10 request per menit
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan, tunggu 1 menit.' },
  statusCode: 429,
});

// 3. Limiter khusus untuk route berat (misal upload gambar/fasilitas)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,        // 1 jam
  limit: 50,                       // max 50 upload per jam per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Batas upload harian tercapai (50/50).' },
  statusCode: 429,
});

// Export supaya bisa dipakai per route atau global
module.exports = {
  globalLimiter,
  strictLimiter,
  uploadLimiter,
};