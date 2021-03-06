const express = require("express");
const router = express.Router();

// import the Brand model and DAL
const { Brand } = require('../models');
const { getBrandById } = require('../dal/brands');

// import the Forms
const { bootstrapField } = require('../forms');
const { createBrandForm } = require('../forms/brands')

// Routes: Get All Records
// -----------------------

router.get('/', async (req, res)=> {
    // fetch all the Brands
    let brands = await Brand.collection().fetch();

    // convert collection to JSON and render via hbs
    res.render('brands/index', {
        'brands': brands.toJSON()
    })
})

// Routes: Create New Record
// -------------------------

router.get('/create', async (req, res) => {
    const brandForm = createBrandForm();
    res.render('brands/create', {
        'form' : brandForm.toHTML(bootstrapField),
        'cloudinaryName': process.env.CLOUDINARY_NAME,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
        'cloudinaryPreset': process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/create', async (req, res) => {
    const brandForm = createBrandForm();
    brandForm.handle(req, {
        'success': async(form) => {
            const brand = new Brand();
            brand.set('name', form.data.name);
            brand.set('description', form.data.description);
            brand.set('logo_image_url', form.data.logo_image_url);
            await brand.save();
            req.flash("success_messages", `New Brand ${brand.get('name')} has been created.`);
            res.redirect('/brands');
        },
        'error': (form) => {
            res.render('brands/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// Routes: Update Existing Record
// -------------------------------

router.get('/:brand_id/update', async (req, res) => {
    const brandId = req.params.brand_id;
    const brand = await getBrandById(brandId);

    const brandForm = createBrandForm();
    brandForm.fields.name.value = brand.get('name');
    brandForm.fields.description.value = brand.get('description');
    brandForm.fields.logo_image_url.value = brand.get('logo_image_url');

    res.render('brands/update', {
        'form': brandForm.toHTML(bootstrapField),
        'brand': brand.toJSON(),
        'cloudinaryName': process.env.CLOUDINARY_NAME,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
        'cloudinaryPreset': process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/:brand_id/update', async (req, res) => {
    const brandId = req.params.brand_id;
    const brand = await getBrandById(brandId);

    const brandForm = createBrandForm();
    brandForm.handle(req, {
        'success': async (form) => {
            brand.set(form.data);
            brand.save();
            req.flash("success_messages", `Changes to Brand ${brand.get('name')} has been saved successfully.`);
            res.redirect('/brands');
        },
        'error': async (form) => {
            res.render('brands/update', {
                'form': form.toHTML(bootstrapField),
                'brand': brand.toJSON()
            })
        }
    })
})

// Routes: Delete Existing Record
// -------------------------------
router.get('/:brand_id/delete', async (req, res) => {
    const brandId = req.params.brand_id;
    const brand = await getBrandById(brandId);

    res.render('brands/delete', {
        'brand': brand.toJSON()
    })
})

router.post('/:brand_id/delete', async (req, res) => {
    const brandId = req.params.brand_id;
    const brand = await getBrandById(brandId);
    const brandName = brand.get('name');
    await brand.destroy();
    req.flash("success_messages", `Deleted Brand ${brandName} successfully.`);
    res.redirect('/brands');
})

module.exports = router