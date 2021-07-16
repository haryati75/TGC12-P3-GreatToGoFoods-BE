// import in caolan forms
const forms = require("forms");

// create shortcuts
const fields = forms.fields;

const createCategoryForm = () => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        })
    })
}

module.exports = { createCategoryForm }