const express = require("express")
const path = require("path");
const multer = require("multer");
const {
    response
} = require("../app");

const router = express.Router();
const storage = multer.diskStorage({
    destination: 'api/uploads/',
    filename: filename
});
const upload = multer({
    fileFilter: fileFilter,
    storage: storage
});
const photoPath = path.resolve(__dirname, '../../client/photo-viewer.html')

function filename(request, file, callback) {
    callback(null, file.originalname)
}

function fileFilter(request, file, callback) {
    if (file.mimetype !== "image/png") {
        request.fileValidationError = "Wrong file type"
        callback(null, false, new Error("Wrong file type"));
    } else {
        callback(null, true);
    }
}

router.post('/upload', upload.single('photo'), (req, res) => {
    if (req.fileValidationError) {
        res.status(400).json({
            error: req.fileValidationError
        })
    } else {
        res.status(201).json({
            success: true
        })
    }
})

router.get('/photo-viewer', (req,res)=> {
    res.sendFile(photoPath);
})


module.exports = router;