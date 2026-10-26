const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');

const pool = new Pool({
  host: 'localhost',
  port: 5434,
  database: 'postgres',
  user: 'banking_user',
  password: 'YmFua2luZ191c2Vy' // Apna asal password yahan laazmi likhein
});

async function seedData() {
  const totalRecords = 1000000;
  const batchSize = 5000; 
  
  console.log(`Starting to insert ${totalRecords} records into 'accounts'...`);
  const client = await pool.connect();

  try {
    for (let i = 0; i < totalRecords; i += batchSize) {
      const values = [];
      const placeholders = [];
      let paramIndex = 1;

      for (let j = 0; j < batchSize; j++) {
        const globalIndex = i + j;
        
        // 100% Unique values generate kar rahe hain taake duplicate ka masla na aaye
        const uniqueEmail = `user_${globalIndex}_${Date.now()}@fakebank.com`;
        const uniqueAccNum = `ACC${Date.now()}${globalIndex}`.slice(0, 29);
        const uniquePhone = `+1${String(globalIndex).padStart(10, '0')}`;

        values.push(
          faker.string.uuid(),                  // id (uuid)
          faker.person.fullName().slice(0, 99), // full_name
          uniqueAccNum,                         // account_number
          1000.00,                              // balance
          'active',                             // status
          'USD',                                // currency
          uniquePhone,                          // phone_number
          uniqueEmail                           // email
        );
        
        // 8 columns ke liye 8 parameters
        placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      }

      // Exact table columns ke naam
      const query = `
        INSERT INTO accounts (id, full_name, account_number, balance, status, currency, phone_number, email) 
        VALUES ${placeholders.join(', ')}
      `;
      
      await client.query(query, values);
      console.log(`Inserted ${i + batchSize} records... (${((i + batchSize) / totalRecords * 100).toFixed(2)}%)`);
    }
    console.log("🚀 1 Million records seeded successfully!");
  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    client.release();
    pool.end();
  }
}

seedData();