const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Eksemplar = require("./eksemplar");

const Peminjaman = sequelize.define("Peminjaman", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  peminjamName: { type: DataTypes.STRING, allowNull: false, field: 'peminjam_name' },
  peminjamId: { type: DataTypes.STRING, field: 'peminjam_id' }, // NIS atau NIK
  eksemplarId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'eksemplar_id', 
    references: { 
      model: 'eksemplar', // Merujuk ke tableName di atas
      key: 'id' 
    } 
  },
  tglPinjam: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW, field: 'tgl_pinjam' },
  tglKembali: { type: DataTypes.DATEONLY, allowNull: false, field: 'tgl_kembali' }, // Estimasi kembali
  tglRealisasiKembali: { type: DataTypes.DATEONLY, field: 'tgl_realisasi_kembali' }, // Tanggal asli dikembalikan
  denda: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: { 
    type: DataTypes.ENUM("Dipinjam", "Kembali", "Terlambat"), 
    defaultValue: "Dipinjam" 
  },
  schoolId: { type: DataTypes.INTEGER, allowNull: false, field: 'school_id' }
}, {
  tableName: 'peminjaman',
  timestamps: true
});

// Relasi harus menggunakan properti biblioId, bukan field database
Peminjaman.belongsTo(Eksemplar, { foreignKey: 'eksemplarId' });
Eksemplar.hasMany(Peminjaman, { foreignKey: 'eksemplarId' });

module.exports = Peminjaman;