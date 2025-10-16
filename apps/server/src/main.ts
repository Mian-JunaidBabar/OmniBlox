import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser'; // Import cookie-parser correctly
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env (if present)
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialize Supabase client (MCP)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      '[main.ts] SUPABASE_URL or SUPABASE_KEY is not set. Skipping Supabase connection check.',
    );
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });

      // Perform a light-weight health check: fetch the postgres version via a simple RPC or list of tables.
      // We'll call `rpc` 'pg_version' if available, otherwise do a simple `from('pg_tables')` query guard.
      // The simplest portable approach is to call `from('pg_tables').select('tablename').limit(1)`.
      const { data, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .limit(1);

      if (error) {
        console.error(
          '[main.ts] Supabase connection check failed:',
          error.message ?? error,
        );
      } else {
        console.log(
          '[main.ts] Supabase connection successful. Sample response:',
          Array.isArray(data) ? `rows=${data.length}` : data,
        );
      }
    } catch (err) {
      console.error(
        '[main.ts] Supabase check error:',
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Add this CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000'], // The origin of your Next.js app
    credentials: true, // This is crucial for sending cookies
  });

  // Add cookie parser middleware
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = process.env.PORT ?? 5000;
  await app.listen(port);
  console.log('[main.ts] Application is running on:', port);
}
bootstrap();
