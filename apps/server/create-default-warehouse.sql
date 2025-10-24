-- Create a default warehouse if none exists
INSERT INTO warehouses (id, name, location, "createdAt", "updatedAt") 
VALUES (gen_random_uuid(), 'Main Warehouse', 'Primary Location', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- You can add more warehouses here if needed
-- INSERT INTO warehouses (id, name, location, "createdAt", "updatedAt") 
-- VALUES (gen_random_uuid(), 'Secondary Warehouse', 'Secondary Location', NOW(), NOW());