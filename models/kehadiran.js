const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const KehadiranPerpus = sequelize.define("KehadiranPerpus", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userRole: { type: DataTypes.ENUM('student', 'teacher'), defaultValue: 'student' },
  studentId: { type: DataTypes.INTEGER, allowNull: true },
  guruId: { type: DataTypes.INTEGER, allowNull: true },
  waktuMasuk: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  waktuPulang: { type: DataTypes.DATE, allowNull: true },
  schoolId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'kehadiran_perpus',
  timestamps: true
});

module.exports = KehadiranPerpus;