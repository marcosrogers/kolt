DROP TABLE IF EXISTS borrowers;

CREATE TABLE borrowers (
  cardnumber TEXT PRIMARY KEY,
  surname TEXT,
  firstname TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  dateofbirth TEXT,
  total_fines TEXT
);

INSERT INTO borrowers (cardnumber, surname, firstname, phone, address, city, dateofbirth, total_fines) VALUES
('12345', 'Smith', 'Jane', '208-555-0101', '101 Main St', 'Idaho Falls', '1980-01-02', '1.25'),
('12346', 'Smith', 'John', '208-555-0102', '102 Main St', 'Idaho Falls', '1979-03-04', '0.00'),
('77777', 'Brown', 'Amy', '208-555-0103', '7 Pine Ave', 'Ammon', '1990-05-06', '3.50'),
('88888', 'Davis', 'Carl', '208-555-0104', '8 Pine Ave', 'Ammon', NULL, '0.00');