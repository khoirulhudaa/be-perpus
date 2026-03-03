const Peminjaman = require('../models/peminjam');
const Eksemplar = require('../models/eksemplar');
const Biblio = require('../models/biblio');
const { Op } = require('sequelize');
const moment = require('moment'); 

exports.getAllPeminjaman = async (req, res) => {
  try {
    const { schoolId, q, status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Gunakan nama properti Model (camelCase)
    const whereClause = { schoolId: schoolId };

    if (q) {
      whereClause[Op.or] = [
        { peminjamName: { [Op.like]: `%${q}%` } },
        { peminjamId: { [Op.like]: `%${q}%` } }
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    // Gunakan findAndCountAll untuk mendapatkan total data untuk pagination
    const { count, rows } = await Peminjaman.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Eksemplar,
          attributes: ['registerNumber', 'callNumber'], // Sesuai nama properti model
          include: [{ model: Biblio, attributes: ['title', 'image'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Kirim response dengan struktur yang diharapkan Frontend
    res.json({ 
      success: true, 
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. GET PEMINJAMAN BY ID
exports.getPinjamById = async (req, res) => {
  try {
    const data = await Peminjaman.findByPk(req.params.id, {
      include: [{ model: Eksemplar, include: [Biblio] }]
    });
    if (!data) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. DELETE PEMINJAMAN
exports.deletePinjam = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cari data peminjaman dulu untuk tahu eksemplar mana yang harus di-update
    const pinjam = await Peminjaman.findByPk(id);
    if (!pinjam) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    // Jika statusnya masih 'Dipinjam', kembalikan status buku ke 'Tersedia'
    if (pinjam.status !== 'Kembali') {
      await Eksemplar.update(
        { status: 'Tersedia' }, 
        { where: { id: pinjam.eksemplarId } }
      );
    }

    await Peminjaman.destroy({ where: { id } });

    res.json({ success: true, message: "Data peminjaman berhasil dihapus dan status buku diperbarui" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPinjam = async (req, res) => {
  try {
    const { eksemplarId, schoolId } = req.body;
    
    // 1. Cek apakah buku tersedia
    const buku = await Eksemplar.findByPk(eksemplarId);
    if (!buku || buku.status !== 'Tersedia') {
      return res.status(400).json({ success: false, message: "Buku tidak tersedia atau sedang dipinjam" });
    }

    // 2. Buat transaksi pinjam
    const pinjam = await Peminjaman.create(req.body);

    // 3. Update status eksemplar jadi 'Dipinjam'
    await Eksemplar.update({ status: 'Dipinjam' }, { where: { id: eksemplarId } });

    res.json({ success: true, data: pinjam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.pengembalianBuku = async (req, res) => {
  try {
    const { id } = req.params;
    const pinjam = await Peminjaman.findByPk(id);
    const tglSekarang = new Date();
    const tglHarusKembali = new Date(pinjam.tglKembali);
    
    let denda = 0;
    if (tglSekarang > tglHarusKembali) {
      const selisihHari = Math.ceil((tglSekarang - tglHarusKembali) / (1000 * 60 * 60 * 24));
      denda = selisihHari * 1000; // Contoh: denda 1000 per hari
    }

    await Peminjaman.update({
      tglRealisasiKembali: tglSekarang,
      denda: denda,
      status: 'Kembali'
    }, { where: { id } });

    // Set buku jadi tersedia lagi
    await Eksemplar.update({ status: 'Tersedia' }, { where: { id: pinjam.eksemplarId } });

    res.json({ success: true, message: "Buku dikembalikan", denda });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- 1. SCAN MASUK/PULANG PERPUS ---
// exports.scanKehadiranPerpus = async (req, res) => {
//   const { qrCodeData, mode, schoolId } = req.body; // mode: 'MASUK' | 'PULANG'
//   const todayStart = moment().startOf('day').toDate();

//   try {
//     // Cari User (Cek Student dulu, jika tidak ada cek Guru)
//     let user = await Student.findOne({ where: { qrCodeData, schoolId, isActive: true } });
//     let role = 'student';
//     let idKey = 'studentId';

//     if (!user) {
//       user = await GuruTendik.findOne({ where: { qrCodeData, schoolId, isActive: true } });
//       role = 'teacher';
//       idKey = 'guruId';
//     }

//     if (!user) return res.status(404).json({ success: false, message: 'Kartu tidak terdaftar' });

//     if (mode === 'MASUK') {
//       const data = await KehadiranPerpus.create({
//         [idKey]: user.id,
//         userRole: role,
//         schoolId: schoolId,
//         waktuMasuk: new Date()
//       });
//       return res.json({ success: true, message: `Selamat Datang, ${user.name || user.nama}`, data });
//     } else {
//       // Logic Pulang: Cari data masuk hari ini yang belum pulang
//       const absen = await KehadiranPerpus.findOne({
//         where: { [idKey]: user.id, waktuPulang: null, waktuMasuk: { [Op.gte]: todayStart } },
//         order: [['createdAt', 'DESC']]
//       });

//       if (!absen) return res.status(400).json({ success: false, message: 'Data masuk tidak ditemukan' });
      
//       await absen.update({ waktuPulang: new Date() });
//       return res.json({ success: true, message: `Sampai Jumpa, ${user.name || user.nama}` });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

const axios = require('axios'); // Pastikan install axios: npm install axios

exports.scanKehadiranPerpus = async (req, res) => {
  const { qrCodeData, mode, schoolId } = req.body;
  const todayStart = moment().startOf('day').toDate();

  try {
    // 1. Panggil API Server User (Student/Guru)
    // Sesuaikan URL dengan endpoint server backend Anda yang lain
    const userResponse = await axios.get(`https://be-school.kiraproject.id/validate-card`, {
      params: { qrCodeData, schoolId }
    });

    const userData = userResponse.data;

    if (!userData.success || !userData.user) {
      return res.status(404).json({ success: false, message: 'Kartu tidak terdaftar di sistem pusat' });
    }

    const { user, role } = userData; // Asumsikan server sana mengembalikan data user dan role
    const idKey = role === 'student' ? 'studentId' : 'guruId';

    if (mode === 'MASUK') {
      const data = await KehadiranPerpus.create({
        [idKey]: user.id,
        userRole: role,
        schoolId: schoolId,
        waktuMasuk: new Date(),
        userName: user.name || user.nama // Simpan nama di lokal untuk cache tampilan cepat
      });
      return res.json({ success: true, message: `Selamat Datang, ${user.name || user.nama}`, data });
    } else {
      // Logic Pulang tetap sama, mencari data di DB lokal Perpustakaan
      const absen = await KehadiranPerpus.findOne({
        where: { [idKey]: user.id, waktuPulang: null, waktuMasuk: { [Op.gte]: todayStart } },
        order: [['createdAt', 'DESC']]
      });

      if (!absen) return res.status(400).json({ success: false, message: 'Data masuk tidak ditemukan' });
      
      await absen.update({ waktuPulang: new Date() });
      return res.json({ success: true, message: `Sampai Jumpa, ${user.name || user.nama}` });
    }
  } catch (err) {
    const errorMsg = err.response?.data?.message || "Gagal verifikasi kartu ke server pusat";
    res.status(500).json({ success: false, message: errorMsg });
  }
};

// --- 2. SCAN PINJAM BUKU ---
exports.scanPinjamKiosk = async (req, res) => {
  const { qrCodeData, registerNumber, schoolId } = req.body;

  try {
    // Cari User
    const user = await Student.findOne({ where: { qrCodeData, schoolId } }) || 
                 await GuruTendik.findOne({ where: { qrCodeData, schoolId } });
    
    if (!user) return res.status(404).json({ success: false, message: 'Kartu Anggota tidak valid' });

    // Cari Buku
    const buku = await Eksemplar.findOne({ where: { registerNumber, schoolId } });
    if (!buku || buku.status !== 'Tersedia') return res.status(400).json({ success: false, message: 'Buku tidak tersedia' });

    const tglKembali = moment().add(7, 'days').toDate();

    const pinjam = await Peminjaman.create({
      peminjamId: qrCodeData, // atau user.id sesuai relasi model Anda
      peminjamName: user.name || user.nama,
      eksemplarId: buku.id,
      schoolId,
      tglPinjam: new Date(),
      tglKembali,
      status: 'Dipinjam'
    });

    await buku.update({ status: 'Dipinjam' });
    res.json({ success: true, message: 'Buku berhasil dipinjam', data: pinjam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- 3. SCAN KEMBALI BUKU ---
exports.scanKembaliKiosk = async (req, res) => {
  const { registerNumber, schoolId } = req.body;

  try {
    const buku = await Eksemplar.findOne({ where: { registerNumber, schoolId } });
    if (!buku) return res.status(404).json({ success: false, message: 'Data buku tidak ditemukan' });

    const pinjam = await Peminjaman.findOne({
      where: { eksemplarId: buku.id, status: 'Dipinjam', schoolId }
    });

    if (!pinjam) return res.status(400).json({ success: false, message: 'Buku ini tidak dalam status dipinjam' });

    // Hitung Denda
    const tglHarusKembali = moment(pinjam.tglKembali);
    const tglSekarang = moment();
    let denda = 0;
    if (tglSekarang.isAfter(tglHarusKembali)) {
      const hariTerlambat = tglSekarang.diff(tglHarusKembali, 'days');
      denda = hariTerlambat * 1000;
    }

    await pinjam.update({ tglRealisasiKembali: new Date(), denda, status: 'Kembali' });
    await buku.update({ status: 'Tersedia' });

    res.json({ success: true, message: 'Buku berhasil dikembalikan', denda });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};