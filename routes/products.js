const express = require('express');
const router = express.Router();

// import the model and DAL
const { Product } = require('../models');
const { getProductById } = require('../dal/products');
const { getAllCategories } = require('../dal/categories');
const { getAllBrands } = require('../dal/brands');
const { getAllTags } = require('../dal/tags');

// import the Forms
const { bootstrapField } = require('../forms');
const { createProductForm } = require('../forms/products')

// Routes: Get All Records
// -----------------------

router.get('/', async (req, res)=> {
    // fetch all the Products
    let products = await Product.collection().fetch({
        withRelated: ['category', 'brand', 'tags']
    });

    // convert collection to JSON and render via hbs
    res.render('products/index', {
        'products': products.toJSON()
    })
})

// Routes: Create New Record
// -------------------------

router.get('/create', async (req, res) => {
    // lists to render in the forms
    const allCategories = await getAllCategories();
    const allBrands = await getAllBrands();
    const allTags = await getAllTags();
    const productForm = createProductForm(allCategories, allBrands, allTags);

    res.render('products/create', {
        'form' : productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    const allCategories = await getAllCategories();
    const allBrands = await getAllBrands();
    const allTags = await getAllTags();
    const productForm = createProductForm(allCategories, allBrands, allTags);

    productForm.handle(req, {
        'success': async(form) => {
            // separate out tags from the other product data
            let {tags, ...productData} = form.data;

            // make sure the names of the form fields matches with database fields 
            const product = new Product(productData);

            // add fields that are not in the form or hidden
            product.set('date_created', new Date());
            product.set('date_modified', new Date());

            try {
                // save the product data
                let response = await product.save();
                
                // save the many-to-many relationship
                if (tags) {
                    await product.tags().attach(tags.split(","));
                }

                req.flash("success_messages", `New Product ${response.get('name')} has been created.`);
                res.redirect('/products');
            } catch (e) {
                console.log(e);
                req.flash("error_messages", "Error saving new record to the database. Check with administrator.");
                res.redirect('/products');
            }

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

    const allCategories = await getAllCategories();
    const allBrands = await getAllBrands();
    const allTags = await getAllTags();
    const productForm = createProductForm(allCategories, allBrands, allTags);
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

    // foreign keys
    productForm.fields.category_id.value = product.get('category_id');
    productForm.fields.brand_id.value = product.get('brand_id');

    // many-to-many tags
    // fill in the multi-select for the tags
    let selectedTags = await product.related('tags').pluck('id');
    productForm.fields.tags.value = selectedTags;

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })
})

router.post('/:product_id/update', async (req, res) => {
    const productId = req.params.product_id;
    const product = await getProductById(productId);

    const allCategories = await getAllCategories();
    const allBrands = await getAllBrands();
    const allTags = await getAllTags();
    const productForm = createProductForm(allCategories, allBrands, allTags);

    productForm.handle(req, {
        'success': async (form) => {
            let { tags, ...productData } = form.data;
            product.set(productData);
            product.set('date_modified', new Date());

            try {
                let response = await product.save();

                // update the many-to-many relationship for tags
                let tagIds = tags.split(',');
                let existingTagIds = await product.related('tags').pluck('id');

                // remove all the tags that aren't selected anymore
                let toRemove = existingTagIds.filter( id => tagIds.includes(id) === false );
                await product.tags().detach(toRemove);

                // add in all the tags selected in the form
                await product.tags().attach(tagIds);

                req.flash("success_messages", `Changes to Product ${response.get('name')} has been saved successfully.`);
                res.redirect('/products');
            } catch (e) {
                console.log(e);
                req.flash("error_messages", "Error saving record to the database. Check with administrator.");
                res.redirect('/products');
            }

            req.flash("success_messages", ``);
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