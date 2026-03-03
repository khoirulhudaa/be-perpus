const Biblio = require('../models/biblio');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { Op } = require('sequelize'); // Pastikan import Op

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getAllBiblio = async (req, res) => {
  try {
    const { schoolId, q, year, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = { schoolId, isActive: true };

    // Filter Search (Judul, ISBN, Penulis)
    if (q) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { isbnIssn: { [Op.like]: `%${q}%` } },
        { sor: { [Op.like]: `%${q}%` } }
      ];
    }

    // Filter Tahun
    if (year && year !== "") {
      whereClause.publishYear = year;
    }

    const { count, rows } = await Biblio.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

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
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createBiblio = async (req, res) => {
  try {
    let imageUrl = null;
    let fileUrl = null;

    const uploadToCloudinary = (buffer, resourceType = 'auto') => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ resource_type: resourceType }, (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        });
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    if (req.files && req.files.image) {
      imageUrl = await uploadToCloudinary(req.files.image[0].buffer, 'image');
    }
    if (req.files && req.files.fileAtt) {
      fileUrl = await uploadToCloudinary(req.files.fileAtt[0].buffer, 'raw');
    }

    const biblioData = { ...req.body, image: imageUrl, fileAtt: fileUrl };
    const newBiblio = await Biblio.create(biblioData);

    res.status(201).json({ success: true, data: newBiblio });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBiblio = async (req, res) => {
  try {
    const biblio = await Biblio.findByPk(req.params.id);
    if (!biblio) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    
    biblio.isActive = false; 
    await biblio.save();
    res.json({ success: true, message: 'Berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};