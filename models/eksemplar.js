const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Sesuaikan dengan config Anda
const Biblio = require("./biblio");

const Eksemplar = sequelize.define("Eksemplar", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
},
 biblioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'biblio_id', 
    references: {
      model: 'biblio', 
      key: 'biblioId', 
    },
  },
  registerNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Nomor Barcode / No Induk Fisik Buku",
  },
  callNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Nomor Panggil Rak (misal: 800.12 AND l)",
  },
  status: {
    type: DataTypes.ENUM("Tersedia", "Dipinjam", "Rusak", "Hilang"),
    defaultValue: "Tersedia",
  },
  condition: {
    type: DataTypes.STRING,
    defaultValue: "Baik",
  },
  schoolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'eksemplar',
  timestamps: true,
});

// Definisi Relasi
Biblio.hasMany(Eksemplar, { 
  foreignKey: "biblioId", // Ini merujuk ke nama properti di objek
  sourceKey: "biblioId",  // Ini merujuk ke primary key di Biblio
  onDelete: "CASCADE" 
});
Eksemplar.belongsTo(Biblio, { 
  foreignKey: "biblioId", 
  targetKey: "biblioId" 
});

module.exports = Eksemplar;