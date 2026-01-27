import multer from 'multer';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

export const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (!file.originalname.endsWith('.xlsx')) {
      return cb(new Error('Only XLSX allowed'));
    }
    cb(null, true);
  }
});
