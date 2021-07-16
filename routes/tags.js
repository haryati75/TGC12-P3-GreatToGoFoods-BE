const express = require("express");
const router = express.Router();

// import the Tag model
const { Tag } = require('../models');
const { getTagById } = require('../dal/tags');

// import the Forms
const { bootstrapField } = require('../forms');
const { createTagForm } = require('../forms/tags')

// Routes: Get All Records
// -----------------------

router.get('/', async (req, res)=> {
    // fetch all the Brands
    let tags = await Tag.collection().fetch();

    // convert collection to JSON and render via hbs
    res.render('tags/index', {
        'tags': tags.toJSON()
    })
})

// Routes: Create New Record
// -------------------------

router.get('/create', async (req, res) => {
    const tagForm = createTagForm();
    res.render('tags/create', {
        'form' : tagForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    const tagForm = createTagForm();
    tagForm.handle(req, {
        'success': async(form) => {
            const tag = new Tag();
            tag.set('name', form.data.name);
            await tag.save();
            req.flash("success_messages", `New Tag ${tag.get('name')} has been created.`);
            res.redirect('/tags');
        },
        'error': (form) => {
            res.render('tags/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// Routes: Update Existing Record
// -------------------------------

router.get('/:tag_id/update', async (req, res) => {
    const tagId = req.params.tag_id;
    const tag = await getTagById(tagId);

    const tagForm = createTagForm();
    tagForm.fields.name.value = tag.get('name');

    res.render('tags/update', {
        'form': tagForm.toHTML(bootstrapField),
        'tag': tag.toJSON()
    })
})

router.post('/:tag_id/update', async (req, res) => {
    const tagId = req.params.tag_id;
    const tag = await getTagById(tagId);

    const tagForm = createTagForm();
    tagForm.handle(req, {
        'success': async (form) => {
            tag.set(form.data);
            tag.save();
            req.flash("success_messages", `Changes to Tag ${tag.get('name')} has been saved successfully.`);
            res.redirect('/tags');
        },
        'error': async (form) => {
            res.render('tags/update', {
                'form': form.toHTML(bootstrapField),
                'tag': tag.toJSON()
            })
        }
    })
})

// Routes: Delete Existing Record
// -------------------------------
router.get('/:tag_id/delete', async (req, res) => {
    const tagId = req.params.tag_id;
    const tag = await getTagById(tagId);

    res.render('tags/delete', {
        'tag': tag.toJSON()
    })
})

router.post('/:tag_id/delete', async (req, res) => {
    const tagId = req.params.tag_id;
    const tag = await getTagById(tagId);
    const TagName = tag.get('name');
    await tag.destroy();
    req.flash("success_messages", `Deleted Tag ${TagName} successfully.`);
    res.redirect('/tags');
})

module.exports = router
