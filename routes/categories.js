const express = require("express");
const router = express.Router();

// import the model and DAL
const { Category } = require('../models');
const { getCategoryById } = require('../dal/categories');

// import the Forms
const { bootstrapField } = require('../forms');
const { createCategoryForm } = require('../forms/categories')

// Routes: Get All Records
// -----------------------

router.get('/', async (req, res)=> {
    // fetch all the records
    let categories = await Category.collection().fetch();

    // convert collection to JSON and render via hbs
    res.render('categories/index', {
        'categories': categories.toJSON()
    })
})

// Routes: Create New Record
// -------------------------

router.get('/create', async (req, res) => {
    const categoryForm = createCategoryForm();
    res.render('categories/create', {
        'form' : categoryForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    const categoryForm = createCategoryForm();
    categoryForm.handle(req, {
        'success': async(form) => {
            const category = new Category();
            category.set('name', form.data.name);
            await category.save();
            req.flash("success_messages", `New Category ${category.get('name')} has been created.`);
            res.redirect('/categories');
        },
        'error': (form) => {
            res.render('categories/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// Routes: Update Existing Record
// -------------------------------

router.get('/:category_id/update', async (req, res) => {
    const categoryId = req.params.category_id;
    const category = await getCategoryById(categoryId);

    const categoryForm = createCategoryForm();
    categoryForm.fields.name.value = category.get('name');

    res.render('categories/update', {
        'form': categoryForm.toHTML(bootstrapField),
        'category': category.toJSON()
    })
})

router.post('/:category_id/update', async (req, res) => {
    const categoryId = req.params.category_id;
    const category = await getCategoryById(categoryId);

    const categoryForm = createCategoryForm();
    categoryForm.handle(req, {
        'success': async (form) => {
            category.set(form.data);
            category.save();
            req.flash("success_messages", `Changes to Category ${category.get('name')} has been saved successfully.`);
            res.redirect('/categories');
        },
        'error': async (form) => {
            res.render('categories/update', {
                'form': form.toHTML(bootstrapField),
                'category': category.toJSON()
            })
        }
    })
})

// Routes: Delete Existing Record
// -------------------------------
router.get('/:category_id/delete', async (req, res) => {
    const categoryId = req.params.category_id;
    const category = await getCategoryById(categoryId);

    res.render('categories/delete', {
        'category': category.toJSON()
    })
})

router.post('/:category_id/delete', async (req, res) => {
    const categoryId = req.params.category_id;
    const category = await getCategoryById(categoryId);
    const CategoryName = category.get('name');
    await category.destroy();
    req.flash("success_messages", `Deleted Category ${CategoryName} successfully.`);
    res.redirect('/categories');
})


module.exports = router
