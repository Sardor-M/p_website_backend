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

  constructor(private configService: ConfigService) {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logger.log(
      `Running in ${this.isProduction ? 'production' : 'development'} mode`,
    );
  }

  onModuleInit() {
    try {
      // firebase initialize bolgani check qilamiz
      if (!admin.apps.length) {
        if (this.isProduction) {
          this.initializeFirebaseForProduction();
        } else {
          this.initializeFirebaseForDevelopment();
        }
      } else {
        this.firebaseApp = admin.app();
        this.logger.log('Using the Firebase app instance');
      }

      this.firestoreDb = this.firebaseApp.firestore();

      // set the timestamp settings
      this.firestoreDb.settings({
        ignoreUndefinedProperties: true,
      });

      this.logger.log('Firebase and Firestore initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase', error.stack);
      throw error;
    }
  }

  private initializeFirebaseForProduction() {
    this.logger.log('Initializing Firebase for prod env');
    // env varlarni check qilib olamiz birinchi
    const firebaseProjectId = this.configService.get('FIREBASE_PROJECT_ID');
    const firebasePrivateKey = this.configService.get('FIREBASE_PRIVATE_KEY');
    const firebaseClientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');

    // check qilamiz based on base64 encoded service account
    const firebaseServiceAccountBase64 = this.configService.get(
      'FIREBASE_SERVICE_ACCOUNT',
    );

    if (firebaseProjectId && firebasePrivateKey && firebaseClientEmail) {
      this.logger.log('Initializing Firebase with env variables');

      //private key escape qilishi mumkinligiga
      const privateKey = firebasePrivateKey.replace(/\\n/g, '\n');

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseProjectId,
          privateKey: privateKey,
          clientEmail: firebaseClientEmail,
        }),
        projectId: firebaseProjectId,
      });

      this.logger.log(
        `Firebase initialized with project ID: ${firebaseProjectId}`,
      );
    } else if (firebaseServiceAccountBase64) {
      // With base64 encoded service accountni initialize qilamiz
      try {
        this.logger.log(
          'Initialized Firebase with base64 encoded service account',
        );
        const serviceAccountJson = Buffer.from(
          firebaseServiceAccountBase64,
          'base64',
        ).toString('utf8');
        const serviceAccount = JSON.parse(serviceAccountJson);

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });

        this.logger.log(
          `Firebase initialized with project ID: ${serviceAccount.project_id}`,
        );
      } catch (error) {
        this.logger.error(
          'Failed to parse base64 encoded service account',
          error,
        );
        throw new Error('Invalid Firebase service account (base64)');
      }
    } else {
      // fallback checking the firebase service account in the prod uhcun
      const prodServiceAccountPath =
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        path.resolve(process.cwd(), 'firebase-service-account.json');

      if (fs.existsSync(prodServiceAccountPath)) {
        // this.logger.log(`Service account file found at: ${prodServiceAccountPath}`);
        const serviceAccount = require(prodServiceAccountPath);

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });

        this.logger.log(
          `Firebase initialized with project ID: ${serviceAccount.project_id}`,
        );
      } else {
        this.logger.error(
          'No Firebase credentials found for production environment',
        );
        throw new Error(
          'Firebase credentials not found. Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL environment variables or provide a service account file',
        );
      }
    }
  }

  private initializeFirebaseForDevelopment() {
    this.logger.log('Initializing Firebase for development environment');

    const possiblePaths = [
      path.resolve(process.cwd(), 'firebase-service-account.json'),
    ];

    let serviceAccountPath: string | null = null;

    // agar exist bo'lsa pathni topamiz
    for (const pathToCheck of possiblePaths) {
      this.logger.log(`Checking for service account at: ${pathToCheck}`);
      if (fs.existsSync(pathToCheck)) {
        serviceAccountPath = pathToCheck;
        this.logger.log(`Service account file found at: ${serviceAccountPath}`);
        break;
      }
    }

    if (serviceAccountPath) {
      // load qilamiz
      const serviceAccount = require(serviceAccountPath);

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });

      this.logger.log(
        `Firebase initialized with project ID: ${serviceAccount.project_id}`,
      );
    } else {
      // env varlarni fallbackda try qiladi dev mode uchun
      const firebaseConfig = this.configService.get('FIREBASE_CONFIG');

      if (firebaseConfig) {
        try {
          const parsedConfig = JSON.parse(firebaseConfig);
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(parsedConfig),
            projectId: parsedConfig.project_id,
          });
          this.logger.log(
            'Firebase initialized with FIREBASE_CONFIG environment variable',
          );
        } catch (error) {
          this.logger.error(
            'Failed to parse FIREBASE_CONFIG environment variable',
            error,
          );
          throw new Error('Firebase configuration is invalid');
        }
      } else {
        this.logger.error('Service account file in this src location');
        throw new Error(
          'Firebase service account file not found. Pls set  firebase service json in the project root or src directory.',
        );
      }
    }
  }

  onModuleDestroy() {
    // Firebase connection yopiladi qachonki app yopilsa
    if (this.firebaseApp) {
      this.firebaseApp
        .delete()
        .then(() => this.logger.log('Firebase connection closed'))
        .catch((error) =>
          this.logger.error('Error closing Firebase connection:', error),
        );
    }
  }

  getFirestore(): Firestore {
    return this.firestoreDb;
  }

  // helper method to get the collection ref
  collection<T = DocumentData>(collectionName: string): CollectionReference<T> {
    return this.firestoreDb.collection(
      collectionName,
    ) as CollectionReference<T>;
  }

  // specific collection ref
  getBlogPostsCollection() {
    return this.collection('blog_posts');
  }
}
