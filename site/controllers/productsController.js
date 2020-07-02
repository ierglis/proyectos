/************** REQUIRED MODULES **************/
const fs = require('fs');
const path = require('path');
const db = require(path.join(__dirname,`..`,`database`,`models`));
const Sequelize = db.sequelize;
const Op = Sequelize.Op;
//const multer=require('multer');

/*************** REQUIRED FILES ***************/
const usersFilePath= path.join(__dirname, '../data/usuarios.json');
const usersObjeto = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

const prod2FilePath= path.join(__dirname, '../data/productos2.json');
var prod2Objeto = JSON.parse(fs.readFileSync(prod2FilePath, 'utf-8'));

let arrayUsuarios=[];
arrayUsuarios.push(usersObjeto[1]);
arrayUsuarios.push(usersObjeto[2]);

/****************** AUXILIAR ******************/
function isEmptyObject(objeto){
    return !Object.keys(objeto).length;
};

/************** MODULE TO EXPORT **************/
const products = {
    list: (req, res, next) => {
        res.render('productList', {productoDetallado:prod2Objeto});
    },
    detail: (req, res, next) => {
        let encontrado = prod2Objeto.find(producto => producto.id == req.params.id);
        if(encontrado == undefined){
            res.send ("No existe el producto");
        };
        let productoDetallado =[];
        productoDetallado.push(encontrado);
        let lastArrival = prod2Objeto.slice (prod2Objeto.length-4);
        res.render('producto2', {productoDetallado:productoDetallado, lastArrival});
    },
    editForm: (req, res) => {
        let productId = req.params.productId;
        let productToEdit=prod2Objeto.find(producto=> producto.id==productId);
        res.render('edicion', {prod2Objeto: prod2Objeto, productToEdit});
    },
    edit: (req, res) => {
        let productId = req.params.productId;
        let index = prod2Objeto.findIndex(producto => producto.id === req.params.productId);
        let productToEdit=prod2Objeto.find(producto=> producto.id==productId);
        productToEdit.nombre=req.body.nombre;
        productToEdit.marca=req.body.marca;
        productToEdit.descripcion=req.body.descripcion;
        productToEdit.precio=req.body.precio;
        productToEdit.descuento=req.body.descuento;
        let productoEditado = [];
        prod2Objeto[index] = productToEdit;
        productoEditado.push(productToEdit);
        fs.writeFileSync(prod2FilePath, JSON.stringify(prod2Objeto));
        res.render('producto2', {productoDetallado:productoEditado});
    },
    createForm: async(req, res) => {
        let categories = await db.Categories.findAll({attributes: [`id`, `name`], raw: true});   
        let brands = await db.Brands.findAll({attributes: [`id`, `name`], raw: true});
        let discounts = await db.Discounts.findAll({attributes: [`id`, `level`], raw: true});
        res.render(`carga`, {categories: categories, brands: brands, discounts: discounts});
    },
    create: (req, res) => {
        let idCat = db.Categories.findOne({where:{name: req.body.categoria}})
        let idBran = db.Brands.findOne({where:{name: req.body.marca}})
        let idDisc = db.Discounts.findOne({where:{level: req.body.descuento/100}})
        Promise.all([idCat, idBran, idDisc])
            .then(([categoria, marca, descuento]) => {
                let imagen;
                if (req.files.length == 0) {
                        imagen = 'noFoto.png';
                    } else {
                        imagen = req.files[0].filename;
                };
                db.Products.create({
                    name: req.body.nombre,
                    price: req.body.precio,
                    description: req.body.descripcion,
                    brand_id: marca.id,
                    discount_id: descuento.id,
                    image: imagen,
                    category_id: categoria.id,
                    stock: req.body.cantidad
                })
            })
    },
    delete: (req,res)=>{
        let productosFiltrados=prod2Objeto.filter(producto=> producto.id!=req.params.productId);
        prod2Objeto=productosFiltrados;
        fs.writeFileSync(prod2FilePath, JSON.stringify(prod2Objeto));
        res.redirect ('/products');
    },
    root: (req, res) => {
            let prodPromotion=prod2Objeto.filter(producto=>{
                
                return Number(producto.descuento)>0
            });
            let promotions= prodPromotion.slice(prodPromotion.length-4);
        let lastArrival = prod2Objeto.slice (prod2Objeto.length-4);
        res.render('index', {prod2Objeto: prod2Objeto, promotions, lastArrival });
    },
    search: (req, res) => {
        db.Products.findAll({
            where: {
                name:{[db.Sequelize.Op.like]:`%`+req.query.search+`%`}
            },
                include: [{association: 'brands'}, {association: 'discounts'}, {association: 'categories'}],
                order: [['name', 'ASC']]
            })
            .then((prductsSearch) => {
                res.render('productosBuscados', {productoDetallado:prductsSearch})
            })
    },
    results: (req, res) => {
      res.render('searchResults')
    },
    brandsCategoriesDiscounts: (req, res) => {
        let idCat = db.Categories.findAll({order: [['name', 'ASC']]})
        let idBran = db.Brands.findAll({order: [['name', 'ASC']]})
        let idDisc = db.Discounts.findAll({order: [['level', 'ASC']]})
        Promise.all([idCat, idBran, idDisc])
            .then(([idCat, idBran, idDisc]) => {
                res.render('extras', {categories:idCat, brands:idBran, discounts:idDisc})
            })
    },
    extrasUpdate: (req, res) => {
        if (req.body.categoryDeleteChk = 'on'){
            db.Categories.findOne({where:{name:req.body.categoryDelete}}).then((resultado) =>{
                db.Products.destroy({where:{category_id:resultado.id}}).then(() => {
                    db.Categories.destroy({where:{name:req.body.categoryDelete}})
                })
            })
        }
        if(req.body.categoryCreate != '' && req.body.categoryCreate != ' ' && req.body.categoryCreate != undefined) {
            db.Categories.create({
                name: req.body.categoryCreate,
            })
        }
        if (req.body.brandDeleteChk = 'on'){
            db.Brands.findOne({where:{name:req.body.brandDelete}}).then((resultado) =>{
                db.Products.destroy({where:{brand_id:resultado.id}}).then(() => {
                    db.Brands.destroy({where:{name:req.body.brandDelete}})
                })
            })
        }
        if(req.body.brandCreate != '' && req.body.brandCreate != ' ' && req.body.brandCreate != undefined) {
            db.Brands.create({
                name: req.body.brandCreate,
            })
        }
        if (req.body.discountDeleteChk = 'on'){
            console.log(req.body.discountDelete);
            
            let discountToDelete = db.Discounts.findOne({where:{level:Number(req.body.discountDelete)}})
            let discountZero = db.Discounts.findOne({where:{level:0}})
            Promise.all([discountToDelete, discountZero])
                .then(([discountToDelete, discountZero]) => {
                    db.Products.update({discount_id: discountZero.id},{where:{discount_id:discountToDelete.id}}).then(() => {
                        db.Discounts.destroy({where:{id:discountToDelete.id}})
                })
            })
        }
        if(req.body.discountCreate != '' && req.body.discountCreate != ' ' && req.body.discountCreate != undefined) {
            db.Discounts.create({
                level: Number(req.body.discountCreate),
            })
        }
    }
};

/************** EXPORTED MODULE **************/
module.exports = products;






/************** CREATE DB MALE **************/
        // let producto ={
        //     id: 0,
        //     nombre: null,
        //     marca: null,
        //     descripcion: null,
        //     imagen1: undefined,
        //     precio: null,
        //     descuento: null}
        

        //     producto.nombre=req.body.nombre;
        //     producto.marca=req.body.marca;
        //     producto.descripcion=req.body.descripcion;
        //     producto.precio=req.body.precio;
        //     producto.descuento=req.body.descuento;

        // let productoCargado = [];

        // productoCargado.push(producto);

//codigo a probar cuando tengamos DB productos andando:

// db.Product.findOne({
//     where: {
//         name: req.body.name
//     }
// }).then((resultado)=> {
//     producto.nombre=resultado.name;
//     res.render ('searchResults', {productoDetallado:productoCargado});
//  }).catch(function(){
//     res.send('no existe el producto')
// })


/************** CREATE CON JSON **************/
// let producto ={
        //     id: 0,
        //     nombre: null,
        //     marca: null,
        //     descripcion: null,
        //     imagen1: undefined,
        //     precio: null,
        //     descuento: null,
        // };
        // if (isEmptyObject(prod2Objeto)){
        //     producto.id=1;
        // } else {
        //     producto.id=prod2Objeto[prod2Objeto.length-1].id+1;
        // };
        // if (req.files == undefined) {
        //     producto.imagen1 = 'n/a';
        // } else {
        //     producto.imagen1 = req.files[0].filename;
        // };
        // producto.nombre=req.body.nombre;
        // producto.marca=req.body.marca;
        // producto.descripcion=req.body.descripcion;
        // producto.precio=req.body.precio;
        // producto.descuento=req.body.descuento;
        // let productoCargado = [];
        // prod2Objeto.push(producto);
        // productoCargado.push(producto);
        // fs.writeFileSync(prod2FilePath, JSON.stringify(prod2Objeto));
        // res.render ('producto2', {productoDetallado:productoCargado});