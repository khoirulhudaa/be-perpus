const express = require("express");
const router = express.Router();
const pinjamCtrl = require("../controllers/peminjamController");

router.get("/", pinjamCtrl.getAllPeminjaman);
router.get("/:id", pinjamCtrl.getPinjamById);
router.post("/", pinjamCtrl.createPinjam);
router.put("/kembali/:id", pinjamCtrl.pengembalianBuku); // Fungsi pengembalian yang kita buat sebelumnya
router.delete("/:id", pinjamCtrl.deletePinjam);

router.post("/kehadiran", pinjamCtrl.scanKehadiranPerpus);
router.post("/pinjam", pinjamCtrl.scanPinjamKiosk);
router.post("/kembali", pinjamCtrl.scanKembaliKiosk);

module.exports = router;