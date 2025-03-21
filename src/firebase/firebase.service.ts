import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import {
  Firestore,
  CollectionReference,
  DocumentData,
} from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FirebaseService implements OnModuleInit, OnModuleDestroy {
  private firebaseApp: admin.app.App;
  private firestoreDb: Firestore;
  private readonly logger = new Logger(FirebaseService.name);
  private readonly isProduction: boolean;
  private retryCount = 0;
  private readonly MAX_RETRIES = 5;

  constructor(private configService: ConfigService) {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logger.log(
      `Running in ${this.isProduction ? 'production' : 'development'} mode`,
    );
  }

  async onModuleInit() {
    await this.initializeFirebase();
  }

  private async initializeFirebase(): Promise<void> {
    try {
      // we check if firebase is already initialized
      if (admin.apps.length > 0) {
        this.logger.log('Firebase already initialized, using existing app');
        const existingApp = admin.apps[0];
        if (!existingApp) throw new Error('No Firebase app found');
        this.firebaseApp = existingApp;
      } else {
        // we initialize based on the env
        if (this.isProduction) {
          await this.initializeProductionFirebase();
        } else {
          await this.initializeDevelopmentFirebase();
        }
      }

      // initialize firestore      
      if (this.firebaseApp) {
        this.firestoreDb = this.firebaseApp.firestore();
        this.firestoreDb.settings({
          ignoreUndefinedProperties: true,
        });
        this.logger.log('Firebase and Firestore initialized successfully');
      } else {
        throw new Error('Firebase app initialization failed');
      }
    } catch (error) {
      this.logger.error(`Failed to initialize Firebase: ${error.message}`);

      // qaytadan urinib ko'ramiz
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        const delay = Math.pow(2, this.retryCount) * 1000; 

        this.logger.log(`Retrying Firebase initialization (${this.retryCount}/${this.MAX_RETRIES}) in ${delay}ms`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.initializeFirebase(); 
      } else {
        this.logger.warn(
          `Maximum retry attempts (${this.MAX_RETRIES}) reached. Using fallback mode.`,
        );
        this.initializeFallbackFirebase();
      }
    }
  }

  private async initializeProductionFirebase(): Promise<void> {
    this.logger.log('Initializing Firebase for production environment');

    // i encoded the service account json to base 64 
    const serviceAccountB64 = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_BASE_64',
    );
    if (serviceAccountB64) {
      try {
        const decoded = Buffer.from(serviceAccountB64, 'base64').toString();
        const serviceAccount = JSON.parse(decoded);

        // buyerda service account jsonni base64 dan decode qilinga datani foydalanamiz
        // va firebase appni initialize qilamiz
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });

        this.logger.log(
          `Firebase initialized with base64 credentials for project ID: ${serviceAccount.project_id}`,
        );
        return;
      } catch (error) {
        this.logger.error(
          `Failed to parse FIREBASE_SERVICE_ACCOUNT: ${error.message}`,
        );
        // keyingi stepga o'tamiz
        return;
      }
    }

    // fildan service account jsonni o'qib olamiz
    const prodServiceAccountPath = path.resolve(
      process.cwd(),
      'firebase-service-account.json',
    );
    if (fs.existsSync(prodServiceAccountPath)) {
      try {
        const serviceAccount = require(prodServiceAccountPath);

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });

        this.logger.log(
          `Firebase initialized with project ID from file: ${serviceAccount.project_id}`,
        );
        return;
      } catch (error) {
        this.logger.error(
          `Failed to load service account from file: ${error.message}`,
        );
      }
    }

    throw new Error(
      'No valid Firebase credentials found for production environment',
    );
  }

  private async initializeDevelopmentFirebase(): Promise<void> {
    this.logger.log('Initializing Firebase for development environment');

    // local dev modeda esa filedan service account jsonni o'qib olamiz
    const devServiceAccountPath = path.resolve(
      process.cwd(),
      'firebase-service-account.json',
    );
    if (fs.existsSync(devServiceAccountPath)) {
      try {
        const serviceAccount = require(devServiceAccountPath);

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });

        this.logger.log(
          `Firebase initialized with project ID from file: ${serviceAccount.project_id}`,
        );
        return;
      } catch (error) {
        this.logger.error(
          `Failed to load service account from file: ${error.message}`,
        );
      }
    }

    const firebaseConfig =
      this.configService.get<string>('FIREBASE_CONFIG') ||
      this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');

    if (firebaseConfig) {
      try {
        let parsedConfig;

        if (typeof firebaseConfig === 'string') {
          parsedConfig = JSON.parse(firebaseConfig);
        } else {
          parsedConfig = firebaseConfig;
        }

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(parsedConfig),
          projectId: parsedConfig.project_id,
        });

        this.logger.log(
          `Firebase initialized with project ID from environment: ${parsedConfig.project_id}`,
        );
        return;
      } catch (error) {
        this.logger.error(
          `Failed to parse Firebase config from environment: ${error.message}`,
        );
      }
    }

    throw new Error(
      'No valid Firebase credentials found for development environment',
    );
  }

  private initializeFallbackFirebase(): void {
    this.logger.log('Initializing Firebase in fallback mode');

    try {
      const appName = `fallback-${Date.now()}`;

      this.firebaseApp = admin.initializeApp(
        {
          projectId: 'portfolio-e80b2',
        },
        appName,
      );

      this.firestoreDb = this.firebaseApp.firestore();
      this.firestoreDb.settings({
        ignoreUndefinedProperties: true,
      });

      this.logger.log(
        'Firebase initialized in fallback mode - limited functionality available',
      );
    } catch (error) {
      this.logger.error(
        `Failed to initialize fallback Firebase: ${error.message}`,
      );
      this.firebaseApp = {} as admin.app.App;
      this.firestoreDb = {} as Firestore;
    }
  }

  onModuleDestroy() {
    // Firebase connection yopiladi qachonki app yopilsa
    if (this.firebaseApp && typeof this.firebaseApp.delete === 'function') {
      this.firebaseApp
        .delete()
        .then(() => this.logger.log('Firebase connection closed'))
        .catch((error) =>
          this.logger.error(
            `Error closing Firebase connection: ${error.message}`,
          ),
        );
    }
  }

  getFirestore(): Firestore {
    if (!this.firestoreDb) {
      this.logger.warn('Firestore DB not initialized, returning fallback');
      this.initializeFallbackFirebase();
    }
    return this.firestoreDb;
  }

  // helper method to get the collection ref
  collection<T = DocumentData>(collectionName: string): CollectionReference<T> {
    if (!this.firestoreDb) {
      this.logger.warn(
        `Firestore DB not initialized when requesting collection ${collectionName}`,
      );
      this.getFirestore();
    }

    return this.firestoreDb.collection(
      collectionName,
    ) as CollectionReference<T>;
  }

  // specific collection ref
  getBlogPostsCollection() {
    return this.collection('blog_posts');
  }
}
