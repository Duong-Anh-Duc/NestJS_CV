import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Analytics } from './src/analytics/analytics.entity';

config(); // Load environment variables

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [Analytics],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});

export default AppDataSource;
