insert into brands (name, logo_image_url, description) values
    ("Gosh!", "https://www.proteinreport.org/sites/default/files/2020-01/Gosh%20logo.jpg", "We’re on a restless pursuit to bring the most lip smacking, tastebud tingling, plant-based flavour sensations to as many people on the planet as possible. We’ve got zero tolerance for nasties, fakeries, and BADditives, and as we’re made from the highest quality natural ingredients, and we’re free from the top 14 allergens, we’re made for the masses."),
    ("Beyond Meat", "https://images.squarespace-cdn.com/content/v1/5c3a4bd3b27e39b123503621/1581008108583-8BAZZVUK493924HZ0NKS/Beyong+Meat+Logo.jpg?format=1000w", "Our plant-based meats are made with intention. By combining expert innovation with simple, non GMO ingredients, we deliver the meaty experience you crave without the compromise. Our products offer greater or equal protein levels than their animal counterparts, no cholesterol, less saturated fat, and no antibiotics or hormones."),
    ("Perfect Snacks", "https://www.snackandbakery.com/ext/resources/Issues/2019/March/Perfect/logo.jpg", "As the maker of Perfect Bar, The Original Refrigerated Protein Bar™, Perfect Snacks has become a leader in fresh snacking by relying on the food principles the Keith's learned as kids and committing to the power of quality, whole-food ingredients.All Perfect Snacks products are stored in the fridge - no artificial preservatives here - but crafted to be enjoyed on the road, on the go, before work, after school or wherever life takes you. They stay fresh at room temperature from 2-7 days depending on the product - just check the back of your snack for best guidance!");

insert into categories (name) values ("Meal"), ("Juice"), ("Sides"), ("Snacks");

insert into tags (name) values ("Vegan-friendly"), ("Sugar-free"), ("Gluten-free");

INSERT INTO products
    (SKU,name,category_id,description,ingredients,unit_base_price,unit_cost,unit_of_measure,kcal,protein_gm,carbs_gm,fats_gm,quantity_in_stock,quantity_to_fulfill,date_created) 
    VALUES('123456789','Aglia Olio',1,'A favourite of the Italians','spaghetti, vegetables, garlics, olive oil',500,300,'1 box',250,10,100,20,10,0,'2021-07-01 00:00:00')

INSERT INTO products
    (SKU,name,category_id,description,ingredients,unit_base_price,unit_cost,unit_of_measure,kcal,fibre_gm,sugars_gm,fats_gm,juice_serving_size_ml,quantity_in_stock,quantity_to_fulfill,date_created) 
    VALUES('999999999','ABC Juice',2,'Apple-beetroot-carrot juice. Not Air Batu Campur.','green and red apples, beetroot, carrot',300,150,'1 litter bottle',200,150,100,0,250,15,0,'2021-07-01 00:00:00')
    