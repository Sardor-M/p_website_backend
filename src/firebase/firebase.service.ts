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
    try {
      // firebase initialize bolgani check qilamiz
      if (!admin.apps.length) {
        if (this.isProduction) {
          if (this.retryCount >= this.MAX_RETRIES) {
            this.logger.warn(
              `Maximum retry attempts (${this.MAX_RETRIES}) reached. Using fallback mode.`,
            );
            this.initializeFirebaseForProduction();
            return;
          }
          this.retryCount++;
          this.logger.log(
            `Firebase initialization attempt ${this.retryCount}/${this.MAX_RETRIES}`,
          );

          try {
            await this.initializeFirebaseForProduction();
          } catch (error) {
            if (this.retryCount >= this.MAX_RETRIES) {
              this.logger.warn(
                'All Firebase connection attempts failed. Using fallback mode.',
              );
              this.initializeFallbackFirebase();
              return;
            } else {
              throw error; 
            }
          }
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

  // fallback mode uchun
  private initializeFallbackFirebase() {
    this.logger.log('Initializing Firebase in fallback mode');

    this.firebaseApp = admin.initializeApp(
      {
        projectId: 'portfolio-e80b2',
      },
      'portfolio-app',
    );

    this.firestoreDb = this.firebaseApp.firestore();

    this.logger.log(
      'Firebase initialized in fallback mode - limited functionality available',
    );
  }

  private initializeFirebaseForProduction() {
    this.logger.log('Initializing Firebase for prod env');
    
    const firebaseServiceAccountJson = this.configService.get('FIREBASE_SERVICE_ACCOUNT');
  
    if (firebaseServiceAccountJson) {
      try {
        this.logger.log('Initializing Firebase with FIREBASE_SERVICE_ACCOUNT');
        let serviceAccount;
        
        if (typeof firebaseServiceAccountJson === 'string') {
          serviceAccount = JSON.parse(firebaseServiceAccountJson);
        } else {
          // if it is already object
          serviceAccount = firebaseServiceAccountJson;
        }
        
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
        
        this.logger.log(`Firebase initialized with project ID: ${serviceAccount.project_id}`);
        return;
      } catch (error) {
        this.logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT', error);
        throw new Error('Invalid Firebase service account configuration');
      }
    }
    
    // fallback case
    const prodServiceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT ||
      path.resolve(process.cwd(), 'firebase-service-account.json');
  
    if (fs.existsSync(prodServiceAccountPath)) {
      const serviceAccount = require(prodServiceAccountPath);
  
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
  
      this.logger.log(`Firebase initialized with project ID: ${serviceAccount.project_id}`);
    } else {
      this.logger.error('No Firebase credentials found for prod env');
      throw new Error(
        'Firebase credentials not found. Pls set FIREBASE_SERVICE_ACCOUNT env vars or provide a service account file'
      );
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
