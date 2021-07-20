const express = require('express');
const router = express.Router();

// import the model and DAL
const { Product } = require('../models');
const { getProductById } = require('../dal/products');

// import the Forms
const { bootstrapField } = require('../forms');
const { createProductForm } = require('../forms/products')

// Routes: Get All Records
// -----------------------

router.get('/', async (req, res)=> {
    // fetch all the Products
    let products = await Product.collection().fetch();

    // convert collection to JSON and render via hbs
    res.render('products/index', {
        'products': products.toJSON()
    })
})

// Routes: Create New Record
// -------------------------

router.get('/create', async (req, res) => {
    const productForm = createProductForm();
    res.render('products/create', {
        'form' : productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async(form) => {
            const product = new Product();
            product.set('name', form.data.name);
            product.set('description', form.data.description);
            product.set('image_url', form.data.image_url);
            product.set('SKU', form.data.SKU);
            product.set('ingredients', form.data.ingredients);
            product.set('unit_base_price', form.data.unit_base_price);
            product.set('unit_cost', form.data.unit_cost);
            product.set('unit_of_measure', form.data.unit_of_measure);
            product.set('juice_serving_size_ml', form.data.juice_serving_size_ml);
            product.set('kcal', form.data.kcal);
            product.set('protein_gm', form.data.protein_gm);
            product.set('carbs_gm', form.data.carbs_gm);
            product.set('fats_gm', form.data.fats_gm);
            product.set('sugars_gm', form.data.sugars_gm);
            product.set('fibre_gm', form.data.fibre_gm);
            product.set('country_source', form.data.country_source);
            product.set('quantity_in_stock', form.data.quantity_in_stock);
            product.set('quantity_to_fulfill', form.data.quantity_to_fulfill)
            product.set('date_created', form.data.date_created);
            product.set('date_modified', new Date());

            // foreign keys

            let response = await product.save();
            req.flash("success_messages", `New Product ${response.get('name')} has been created.`);
            res.redirect('/products');
        },
        'error': (form) => {
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// Routes: Update Existing Record
// -------------------------------

router.get('/:product_id/update', async (req, res) => {
    const productId = req.params.product_id;
    const product = await getProductById(productId);

    const productForm = createProductForm();
    productForm.fields.name.value = product.get('name');
    productForm.fields.description.value = product.get('description');
    productForm.fields.image_url.value = product.get('image_url');

    // put in all the product fields
    productForm.fields.SKU.value = product.get('SKU');
    productForm.fields.ingredients.value = product.get('ingredients');
    productForm.fields.unit_base_price.value = product.get('unit_base_price');
    productForm.fields.unit_cost.value = product.get('unit_cost');
    productForm.fields.unit_of_measure.value = product.get('unit_of_measure');
    productForm.fields.juice_serving_size_ml.value = product.get('juice_serving_size_ml');
    productForm.fields.kcal.value = product.get('kcal');
    productForm.fields.protein_gm.value = product.get('protein_gm');
    productForm.fields.carbs_gm.value = product.get('carbs_gm');
    productForm.fields.fats_gm.value = product.get('fats_gm');
    productForm.fields.sugars_gm.value = product.get('sugars_gm');
    productForm.fields.fibre_gm.value = product.get('fibre_gm');
    productForm.fields.country_source.value = product.get('country_source');
    productForm.fields.quantity_in_stock.value = product.get('quantity_in_stock');
    productForm.fields.quantity_to_fulfill.value = product.get('quantity_to_fulfill');
    productForm.fields.date_created.value = product.get('date_created');
    productForm.fields.date_modified.value = product.get('date_modified');

    // foreign keys
    // many-to-many tags

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })
})

router.post('/:product_id/update', async (req, res) => {
    const productId = req.params.product_id;
    const product = await getProductById(productId);
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {
            product.set(form.data);
            let response = await product.save();
            req.flash("success_messages", `Changes to Product ${response.get('name')} has been saved successfully.`);
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/update', {
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })
})

// Routes: Delete Existing Record
// -------------------------------
router.get('/:product_id/delete', async (req, res) => {
    const productId = req.params.product_id;
    const product = await getProductById(productId);

    res.render('products/delete', {
        'product': product.toJSON()
    })
})

router.post('/:product_id/delete', async (req, res) => {
    const productId = req.params.product_id;
    const product = await getProductById(productId);
    const productName = product.get('name');
    await product.destroy();
    req.flash("success_messages", `Deleted Product ${productName} successfully.`);
    res.redirect('/products');
})

module.exports = router