# GreatToGo Foods eShop
This is the backend administration module for the GreatToGo Foods eShop. 

Target users: 
1. Business users (or Business owner's authorized personnel)
2. System administrators

An education-purpose project for TGC Singapore.

## Objectives:
To enable users to perform operations support function:
1. Administer products (including stocks and fulfilment) and associated tables: tags, categories, brands
2. Process orders from customer
3. Administer users and customer information, including access controls and verifications

## Backend Technologies:
* NodeJS
* Express
* REST API

## Third-parties API with webhooks, tokens:
* Stripe
* EmailJS
* Cloudinary

## Database: MySQL to Postgres via ORM Bookshelf/Knex
Entities:
1. Products
2. Orders (One-to-Many with Order Details), (One-to-One with Customer)
3. Order Details 
4. Cart Items (One-to-One with Product, One-to-One with User)
5. Customers (One-to-One with User)
6. Users
7. Blacklisted Tokens

Foreign Key Tables for Products:
1. Tags (Many-to-Many)
2. Brands (One-to-One)
3. Categories (One-to-One)

## Dependencies: 
    "bookshelf": "^1.2.0",
    "bootstrap": "^5.0.2",
    "cloudinary": "^1.26.2",
    "connect-flash": "^0.1.1",
    "cors": "^2.8.5",
    "crypto": "^1.0.1",
    "csurf": "^1.11.0",
    "db-migrate": "^0.11.12",
    "db-migrate-mysql": "^2.1.2",
    "db-migrate-pg": "^1.2.2",
    "dotenv": "^10.0.0",
    "express": "^4.17.1",
    "express-session": "^1.17.2",
    "forms": "^1.3.2",
    "hbs": "^4.1.2",
    "jsonwebtoken": "^8.5.1",
    "knex": "^0.95.8",
    "pg": "^8.7.1",
    "session-file-store": "^1.5.0",
    "stripe": "^8.167.0",
    "wax-on": "^1.2.2"

## Testing of Backend:
* Business User/Password: john.doe@mail.com / rotiprata
* Administrator User/Password: ali.mat@mail.com / metallica

## Critical Path Testing:
#### **_Scenario 1_**: Receive Paid Customer's Orders - From Processing to Complete
##### Test Steps:
1. Click Orders from Menu
2. Find Order with Status = 'Paid'
3. Click button _'Check Stock'_ (button visible when status = 'Paid')
4. Click button _'Deliver'_ (button visible when status = 'Ready to Deliver')
5. Click button _'Complete'_ (button visible when status = 'Delivering')

##### _Expected Result_: 
_'Check Stock':_ 
1. If Product's total Stock + Quantity to Fulfil < 0, then Low Stock -> Status change to **'Processing - Low Stock'**, 
   Else change Status to **'Ready to Deliver'**

_'Deliver':_ 
2. if Product's total Stock + Quantity > 0, it will change status to **'Delivering'**, else it will go back to **'Processing - Low Stock'**
3. Reduce Quantity to Fulfil for each Order Item's Product

_'Complete':_
4. Change status to **'Complete'** and no other Processing buttons will be visible


#### Scenario 2: Low Stock update at Product
When Product's stock quantity is < 0, the Front-end will show "Low Stock Availability" message but still allows Customers to make orders.  The order quantity will then be captured in Quantity to Fulfil.
Backend users can update the Product's stock quantity, which will remove the low stock message at the front-end.
##### Test Steps:
1. Click Products from Menu



#### Scenario 3: Authorised User Access: Business users cannot access System Administration module

## Deployment: 
Deployed at Heroku

Developed by Haryati Hassan, TGC Batch 12