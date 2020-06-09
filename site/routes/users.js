/************** REQUIRED MODULES **************/
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
// let registerValidation = require('../middlewares/validators/register');

let guest=require('../middlewares/validators/guest');
let authorization=require('../middlewares/validators/authorization');
let cartAccess =require('../middlewares/validators/cartAccess');
let logout=require('../middlewares/validators/logout');

/************ MULTER CONFIG **************/
var storage= multer.diskStorage({
    destination:function(req,file,cb){
      cb(null,'public/images/usuarios/')
    },
    filename:function(req,file,cb){
      cb(null,Date.now()+path.extname(file.originalname));
    }
  })
  var upload = multer({ storage: storage,
    fileFilter: function (req, file, cb) {
      if (!file.originalname.match(/\.(pdf|doc|docx|jpg|jpeg)$/)) {
        return cb(new Error('Error en el tipo de archivo.'));
      }
      cb(null, true);
    }
  });

/************ REQUIRED CONTROLLER ************/
const usersController = require(path.join(__dirname,'../controllers/usersController'));

/****************** ROUTES ******************/
router.get('/perfil', usersController.vistaPerfil);
router.get('/login',guest, usersController.formLogin);
router.post('/login/val', usersController.enter);
router.get('/check', usersController.check);
router.get ('/create', usersController.createUser);
router.post('/create', upload.any(), usersController.registro);
router.get('/logout',logout, usersController.close);
router.get('/cart', cartAccess, usersController.cartEnter);
// antes de upload,registerValidation debería ir registerValidation,

/************** EXPORTED MODULE **************/
module.exports = router;
