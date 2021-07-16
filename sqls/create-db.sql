CREATE USER 'felix'@'%' IDENTIFIED WITH mysql_native_password BY 'thecat';
grant all privileges on *.* to 'felix'@'%';
FLUSH PRIVILEGES;

create database healthyfoods_shop;