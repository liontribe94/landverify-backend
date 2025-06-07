const { Sequelize } = require('sequelize');

console.log('Starting database configuration...');

let sequelize;

try {
  if (process.env.DATABASE_URL) {
    console.log('Using production database configuration');
    
    // Validate DATABASE_URL format
    const dbUrl = new URL(process.env.DATABASE_URL);
    if (!dbUrl.protocol || !dbUrl.host || !dbUrl.pathname) {
      throw new Error('Invalid DATABASE_URL format');
    }

    // Production configuration
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  } else {
    // Local development configuration
    console.log('Using local development database configuration');
    sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/landverify', {
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  }

  // Test the connection
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
} catch (error) {
  console.error('Database configuration error:', error.message);
  console.error('DATABASE_URL:', process.env.DATABASE_URL);
  throw error;
}

module.exports = { sequelize }; 