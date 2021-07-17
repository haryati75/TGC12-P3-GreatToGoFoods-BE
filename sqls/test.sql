show databases;
use healthyfoods_shop;

show tables;

describe brands; describe categories; describe tags; describe users;

select * from brands;
select * from tags;
select * from categories;

 update users set role='Admin' where email='john.doe@mail.com';
--  roti
 update users set role='Business' where email='ali.mat@mail.com';
-- metallica
-- mary.sue@mail.com rotiprata
 delete from users where email='mary.sue@mail.com';