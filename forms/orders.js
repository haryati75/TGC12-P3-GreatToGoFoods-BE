// import in caolan forms
const forms = require("forms");

// create shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

const updateOrderForm = () => {
    return forms.create({
        'order_date': fields.date({
            required: true,
            errorAfterField: true,
            widget: widgets.date(),
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.date()]
        }),
        'order_amount_total': fields.number({
            required: true,
            widget: widgets.hidden(),
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.integer()]
        }),
        'order_status': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: {
                'Pending': 'Pending',
                'Paid': 'Paid',
                'Processing': 'Processing',
                'Processing - Low Stock': 'Processing - Low Stock',
                'Ready to Deliver': 'Ready to Deliver',
                'Delivering': 'Delivering',
                'Complete': 'Complete'
            }
        }),
        'payment_status': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: {
                'Pending': 'Pending',
                'Paid': 'Paid',
                'Full Refund': 'Full Refund',
                'Partial Refund': 'Partial Refund'
            }
        }),
        'payment_reference': fields.string({
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'payment_stripe_id': fields.string({
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'payment_mode': fields.string({
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'payment_amount_total': fields.number({
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.integer()]
        }),
        'payment_confirmed_on': fields.date({
            errorAfterField: true,
            widget: widgets.date(),
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.date()]
        }),
        'delivery_address': fields.string({
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'delivery_date': fields.date({
            errorAfterField: true,
            widget: widgets.date(),
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.date()]
        })
    })
}

module.exports = { updateOrderForm }

