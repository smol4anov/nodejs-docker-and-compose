import { DataSourceOptions } from 'typeorm';

import 'dotenv/config';

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  username: process.env.POSTGRES_USER || 'test',
  password: process.env.POSTGRES_PASSWORD || 'test',
  database: process.env.POSTGRES_DB || 'db',
  entities: [__dirname + '/**/**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
};

export = config;
