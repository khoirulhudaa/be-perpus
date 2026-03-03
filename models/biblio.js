const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Biblio = sequelize.define('Biblio', {
  biblioId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'biblio_id' },
  gmdId: { type: DataTypes.INTEGER, field: 'gmd_id' },
  title: { type: DataTypes.STRING, allowNull: false },
  sor: { type: DataTypes.STRING }, // Statement of Responsibility
  edition: { type: DataTypes.STRING },
  isbnIssn: { type: DataTypes.STRING(50), field: 'isbn_issn' },
  publisherId: { type: DataTypes.INTEGER, field: 'publisher_id' },
  publishYear: { type: DataTypes.STRING(4), field: 'publish_year' },
  collation: { type: DataTypes.STRING },
  seriesTitle: { type: DataTypes.STRING, field: 'series_title' },
  callNumber: { type: DataTypes.STRING(50), field: 'call_number' },
  languageId: { type: DataTypes.STRING(5), field: 'language_id', defaultValue: 'id' },
  source: { type: DataTypes.STRING },
  publishPlaceId: { type: DataTypes.INTEGER, field: 'publish_place_id' },
  classification: { type: DataTypes.STRING(40) },
  notes: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING }, // Cloudinary URL
  fileAtt: { type: DataTypes.STRING, field: 'file_att' }, // Cloudinary URL untuk E-Resources
  opacHide: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'opac_hide' },
  promoted: { type: DataTypes.BOOLEAN, defaultValue: false },
  labels: { type: DataTypes.TEXT },
  frequencyId: { type: DataTypes.INTEGER, field: 'frequency_id' },
  specDetailInfo: { type: DataTypes.TEXT, field: 'spec_detail_info' },
  contentTypeId: { type: DataTypes.INTEGER, field: 'content_type_id' },
  mediaTypeId: { type: DataTypes.INTEGER, field: 'media_type_id' },
  carrierTypeId: { type: DataTypes.INTEGER, field: 'carrier_type_id' },
  schoolId: { type: DataTypes.INTEGER, allowNull: false, field: 'school_id' },
  uid: { type: DataTypes.INTEGER }, // User ID Creator
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' }
}, {
  tableName: 'biblio',
  timestamps: true, // Otomatis handle input_date (createdAt) dan last_update (updatedAt)
});

module.exports = Biblio;