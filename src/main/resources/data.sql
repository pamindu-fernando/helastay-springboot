-- SEED DATA for StayBnB
-- SEED DATA for StayBnB
-- Passwords are BCrypt-encoded 'toor'
INSERT INTO users (email, password, first_name, last_name, phone, avatar_url, role, created_at, updated_at) VALUES
('admin@helastay.com', '$2b$12$Yc8Dh6lQL4h0lzL74yVLbu93qqXRL6D/dGL3FviI3rqhbQ558CxcK', 'anonymous', 'admin', '+94 776767677', 'https://i.pravatar.cc/150?img=1', 'HOST', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Listings
INSERT INTO listings (title, description, property_type, price_per_night, max_guests, bedrooms, bathrooms, address, city, country, latitude, longitude, average_rating, is_active, host_id, created_at, updated_at) VALUES
('Luxury Apartment Colombo', 'Experience the pinnacle of city living in Colombo. Floor-to-ceiling windows with Indian Ocean views, rooftop infinity pool, and just walking distance to Galle Face Green.', 'APARTMENT', 150.00, 4, 2, 2, 'Galle Road, Kollupitiya', 'Colombo', 'Sri Lanka', 6.9271, 79.8612, 4.9, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Galle Fort Heritage Villa', 'Step back in time in this beautifully restored Dutch colonial villa inside the historic Galle Fort. Courtyard plunge pool, antique furniture, and surrounded by cafes.', 'VILLA', 250.00, 6, 3, 3, 'Lighthouse Street, Fort', 'Galle', 'Sri Lanka', 6.0328, 80.2150, 4.8, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sigiriya Rock View Lodge', 'An eco-lodge nestled in the jungle with direct, unobstructed views of the ancient Sigiriya Lion Rock from your private treehouse-style deck.', 'TREEHOUSE', 125.00, 3, 1, 1, 'Kibissa', 'Sigiriya', 'Sri Lanka', 7.9541, 80.7547, 4.6, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Nilaveli Beach Villa', 'A stunning private luxury villa on the pristine white sands of Nilaveli on the East Coast. Private pool, personal chef, and boat rides to Pigeon Island.', 'VILLA', 420.00, 10, 5, 5, 'Nilaveli Beach Road', 'Trincomalee', 'Sri Lanka', 8.5711, 81.2333, 5.0, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Anuradhapura Heritage Stay', 'Located minutes from the sacred Bodhi tree, this modern house offers a peaceful retreat after exploring ancient ruins.', 'HOUSE', 60.00, 4, 2, 2, 'Lake Road', 'Anuradhapura', 'Sri Lanka', 8.3114, 80.4168, 4.7, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Jaffna Peninsula Home', 'Authentic Northern hospitality in a restored traditional home. Enjoy spicy Jaffna crab curry prepared by our in-house chef.', 'HOUSE', 75.00, 6, 3, 2, 'KKS Road', 'Jaffna', 'Sri Lanka', 9.6615, 80.0255, 4.6, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Weligama Surf Studio', 'A cozy studio apartment just 50 meters from the famous Weligama surf break. Ideal for digital nomads with fast 5G WiFi.', 'STUDIO', 55.00, 2, 1, 1, 'Pelena', 'Weligama', 'Sri Lanka', 5.9736, 80.4283, 4.8, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bentota River Boat', 'A luxurious floating houseboat docked on the tranquil Bentota River. Wake up to mangrove views and monitor lizards swimming by.', 'BOAT', 130.00, 2, 1, 1, 'River Avenue', 'Bentota', 'Sri Lanka', 6.4215, 79.9983, 4.6, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Amenities
INSERT INTO listing_amenities (listing_id, amenity) VALUES
(1,'WiFi'),(1,'Private Pool'),(1,'Beach Access'),(1,'BBQ Grill'),(1,'Air Conditioning'),(1,'Parking'),(1,'Kitchen'),(1,'Washer/Dryer'),
(2,'WiFi'),(2,'Air Conditioning'),(2,'Kitchen'),(2,'Gym Access'),(2,'Elevator'),(2,'Smart TV'),
(3,'WiFi'),(3,'Fireplace'),(3,'Forest View'),(3,'Kitchen'),(3,'Pet Friendly'),
(4,'WiFi'),(4,'Fireplace'),(4,'Parking'),(4,'Pet Friendly'),(4,'Lake View'),(4,'Kitchen'),
(5,'WiFi'),(5,'Air Conditioning'),(5,'Parking'),(5,'Kitchen'),
(6,'WiFi'),(6,'Kitchen'),(6,'Air Conditioning'),(6,'Parking'),(6,'Washer/Dryer'),
(7,'WiFi'),(7,'Air Conditioning'),(7,'Kitchen'),(7,'Washer/Dryer'),(7,'Smart TV'),
(8,'WiFi'),(8,'Breakfast Included'),(8,'Sea View'),(8,'Air Conditioning');

-- Images
INSERT INTO listing_images (listing_id, image_url) VALUES
(1,'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800'),
(1,'https://images.unsplash.com/photo-1518548419970-58716968aa58?auto=format&fit=crop&q=80&w=800'),
(1,'https://images.unsplash.com/photo-1523217582562-09eddd96d4fb?auto=format&fit=crop&q=80&w=800'),
(1,'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'),
(2,'https://images.unsplash.com/photo-1551918120-9739cb430c6d?auto=format&fit=crop&q=80&w=800'),
(2,'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800'),
(2,'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800'),
(2,'https://images.unsplash.com/photo-1544490895-30cf9537f59d?auto=format&fit=crop&q=80&w=800'),
(3,'https://images.unsplash.com/photo-1590059124239-01c3bf797fa9?auto=format&fit=crop&q=80&w=800'),
(3,'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800'),
(3,'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800'),
(3,'https://images.unsplash.com/photo-1544490895-30cf9537f59d?auto=format&fit=crop&q=80&w=800'),
(4,'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'),
(4,'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800'),
(4,'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800'),
(4,'https://images.unsplash.com/photo-1562925231-15582c3c6f9e?auto=format&fit=crop&q=80&w=800'),
(5,'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&q=80&w=800'),
(5,'https://images.unsplash.com/photo-1518548419970-58716968aa58?auto=format&fit=crop&q=80&w=800'),
(5,'https://images.unsplash.com/photo-1523217582562-09eddd96d4fb?auto=format&fit=crop&q=80&w=800'),
(5,'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'),
(6,'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800'),
(6,'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=800'),
(6,'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?auto=format&fit=crop&q=80&w=800'),
(6,'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800'),
(7,'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800'),
(7,'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800'),
(7,'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800'),
(7,'https://images.unsplash.com/photo-1544490895-30cf9537f59d?auto=format&fit=crop&q=80&w=800'),
(8,'https://images.unsplash.com/photo-1544490895-30cf9537f59d?auto=format&fit=crop&q=80&w=800'),
(8,'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800'),
(8,'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800'),
(8,'https://images.unsplash.com/photo-1562925231-15582c3c6f9e?auto=format&fit=crop&q=80&w=800');
