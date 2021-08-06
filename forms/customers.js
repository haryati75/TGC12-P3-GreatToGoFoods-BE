// import in caolan forms
const forms = require("forms");

// create shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

const createCustomerRegistrationForm = () => {
    return forms.create({
        'id': fields.number({
            widget: widgets.hidden()
        }),
        'user_id': fields.number({
            widget: widgets.hidden()
        }),
        'first_name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'last_name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'contact_no': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'address_blk': fields.string({
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'address_unit': fields.string({
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'address_street_1': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'address_street_2': fields.string({
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'address_postal_code': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'gender': fields.string({
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: {
                'F': 'Female',
                'M': 'Male',
                '-': 'Not Provided'
            }
        }),
        'birth_date': fields.date({
            label: 'Date of Birth',
            errorAfterField: true,
            widget: widgets.date(),
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.date()]
        }),
        'email': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [ validators.email() ]
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'confirm_password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [ validators.matchField('password') ]
        })
    })
}


const createCustomerEditForm = () => {
    return forms.create({
        'id': fields.number({
            widget: widgets.hidden()
        }),
        'user_id': fields.number({
            widget: widgets.hidden()
        }),
        'email': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [ validators.email() ]
        }),
        'first_name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'last_name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'contact_no': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'address_blk': fields.string({
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'address_unit': fields.string({
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'address_street_1': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'address_street_2': fields.string({
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'address_postal_code': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'gender': fields.string({
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: {
                'F': 'Female',
                'M': 'Male',
                '-': 'Not Provided'
            }
        }),
        'birth_date': fields.date({
            label: 'Date of Birth',
            errorAfterField: true,
            widget: widgets.date(),
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.date()]
        })
    })
}

module.exports = { createCustomerRegistrationForm, createCustomerEditForm }