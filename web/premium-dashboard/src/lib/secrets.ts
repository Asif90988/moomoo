// Neural Core Alpha-7 - Secure Secret Management
// This module handles secure access to sensitive configuration

interface SecretConfig {
  // Database
  databaseUrl: string;
  redisUrl?: string;
  redisPassword?: string;

  // Authentication
  nextAuthSecret: string;
  jwtSecret: string;

  // Trading API
  moomooApiKey: string;
  moomooSecretKey: string;
  moomooAccountId?: string;

  // AI Engine
  aiEngineSecretKey: string;
  qdrantApiKey?: string;

  // External Services
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  sendgridApiKey?: string;
  sentryDsn?: string;

  // Encryption
  encryptionKey: string;
  sessionSecret: string;
}

class SecretManager {
  private static instance: SecretManager;
  private secrets: SecretConfig | null = null;

  private constructor() {}

  public static getInstance(): SecretManager {
    if (!SecretManager.instance) {
      SecretManager.instance = new SecretManager();
    }
    return SecretManager.instance;
  }

  // Load and validate secrets
  public loadSecrets(): SecretConfig {
    if (this.secrets) {
      return this.secrets;
    }

    // Validate required environment variables
    this.validateRequiredSecrets();

    this.secrets = {
      // Database
      databaseUrl: this.getRequiredSecret('DATABASE_URL'),
      redisUrl: this.getSecret('REDIS_URL', 'redis://localhost:6379'),
      redisPassword: this.getSecret('REDIS_PASSWORD'),

      // Authentication
      nextAuthSecret: this.getRequiredSecret('NEXTAUTH_SECRET'),
      jwtSecret: this.getRequiredSecret('JWT_SECRET'),

      // Trading API
      moomooApiKey: this.getRequiredSecret('MOOMOO_API_KEY'),
      moomooSecretKey: this.getRequiredSecret('MOOMOO_SECRET_KEY'),
      moomooAccountId: this.getSecret('MOOMOO_ACCOUNT_ID'),

      // AI Engine
      aiEngineSecretKey: this.getRequiredSecret('AI_ENGINE_SECRET_KEY'),
      qdrantApiKey: this.getSecret('QDRANT_API_KEY'),

      // External Services
      stripeSecretKey: this.getSecret('STRIPE_SECRET_KEY'),
      stripeWebhookSecret: this.getSecret('STRIPE_WEBHOOK_SECRET'),
      sendgridApiKey: this.getSecret('SENDGRID_API_KEY'),
      sentryDsn: this.getSecret('SENTRY_DSN'),

      // Encryption
      encryptionKey: this.getRequiredSecret('ENCRYPTION_KEY'),
      sessionSecret: this.getRequiredSecret('SESSION_SECRET')
    };

    // Validate secret formats
    this.validateSecretFormats();

    return this.secrets;
  }

  private getSecret(key: string, defaultValue?: string): string | undefined {
    const value = process.env[key] || defaultValue;
    
    // Security: Never log actual secret values
    if (value && value !== defaultValue) {
      console.log(`✅ Secret loaded: ${key}`);
    } else if (defaultValue) {
      console.log(`⚠️  Using default value for: ${key}`);
    }
    
    return value;
  }

  private getRequiredSecret(key: string): string {
    const value = process.env[key];
    
    if (!value) {
      throw new Error(`🚨 SECURITY ERROR: Required secret missing: ${key}`);
    }

    // Security: Never log actual secret values
    console.log(`✅ Required secret loaded: ${key}`);
    return value;
  }

  private validateRequiredSecrets(): void {
    const requiredSecrets = [
      'NEXTAUTH_SECRET',
      'JWT_SECRET', 
      'DATABASE_URL',
      'MOOMOO_API_KEY',
      'MOOMOO_SECRET_KEY',
      'AI_ENGINE_SECRET_KEY',
      'ENCRYPTION_KEY',
      'SESSION_SECRET'
    ];

    const missingSecrets = requiredSecrets.filter(secret => !process.env[secret]);

    if (missingSecrets.length > 0) {
      throw new Error(
        `🚨 SECURITY ERROR: Missing required secrets: ${missingSecrets.join(', ')}\n` +
        `Please check your .env.local file and ensure all required secrets are set.`
      );
    }
  }

  private validateSecretFormats(): void {
    if (!this.secrets) return;

    // Validate encryption key length (should be 64 hex characters for 256-bit key)
    if (this.secrets.encryptionKey.length !== 64) {
      throw new Error('🚨 SECURITY ERROR: ENCRYPTION_KEY must be 64 hex characters (256-bit key)');
    }

    // Validate NextAuth secret length (minimum 32 characters)
    if (this.secrets.nextAuthSecret.length < 32) {
      throw new Error('🚨 SECURITY ERROR: NEXTAUTH_SECRET must be at least 32 characters');
    }

    // Validate JWT secret length (minimum 32 characters)
    if (this.secrets.jwtSecret.length < 32) {
      throw new Error('🚨 SECURITY ERROR: JWT_SECRET must be at least 32 characters');
    }

    // Validate database URL format
    if (!this.secrets.databaseUrl.startsWith('postgresql://')) {
      throw new Error('🚨 SECURITY ERROR: DATABASE_URL must be a valid PostgreSQL connection string');
    }

    console.log('✅ All secret formats validated successfully');
  }

  // Get specific secret categories
  public getDatabaseConfig() {
    const secrets = this.loadSecrets();
    return {
      url: secrets.databaseUrl,
      redisUrl: secrets.redisUrl,
      redisPassword: secrets.redisPassword
    };
  }

  public getAuthConfig() {
    const secrets = this.loadSecrets();
    return {
      nextAuthSecret: secrets.nextAuthSecret,
      jwtSecret: secrets.jwtSecret,
      sessionSecret: secrets.sessionSecret
    };
  }

  public getTradingConfig() {
    const secrets = this.loadSecrets();
    return {
      apiKey: secrets.moomooApiKey,
      secretKey: secrets.moomooSecretKey,
      accountId: secrets.moomooAccountId
    };
  }

  public getAIConfig() {
    const secrets = this.loadSecrets();
    return {
      secretKey: secrets.aiEngineSecretKey,
      qdrantApiKey: secrets.qdrantApiKey
    };
  }

  public getExternalServicesConfig() {
    const secrets = this.loadSecrets();
    return {
      stripeSecretKey: secrets.stripeSecretKey,
      stripeWebhookSecret: secrets.stripeWebhookSecret,
      sendgridApiKey: secrets.sendgridApiKey,
      sentryDsn: secrets.sentryDsn
    };
  }

  public getEncryptionConfig() {
    const secrets = this.loadSecrets();
    return {
      encryptionKey: secrets.encryptionKey,
      sessionSecret: secrets.sessionSecret
    };
  }

  // Security audit functions
  public auditSecrets(): {
    loaded: number;
    missing: string[];
    weak: string[];
    recommendations: string[];
  } {
    const secrets = this.loadSecrets();
    const audit = {
      loaded: 0,
      missing: [] as string[],
      weak: [] as string[],
      recommendations: [] as string[]
    };

    // Count loaded secrets
    Object.entries(secrets).forEach(([key, value]) => {
      if (value) audit.loaded++;
    });

    // Check for weak configurations
    if (process.env.NODE_ENV === 'production') {
      if (!secrets.qdrantApiKey) {
        audit.missing.push('QDRANT_API_KEY (recommended for production)');
      }
      if (!secrets.stripeSecretKey) {
        audit.missing.push('STRIPE_SECRET_KEY (required for payments)');
      }
      if (!secrets.sentryDsn) {
        audit.missing.push('SENTRY_DSN (recommended for error monitoring)');
      }
    }

    // Security recommendations
    audit.recommendations = [
      'Rotate all secrets every 90 days',
      'Use a dedicated secret management service in production',
      'Enable secret scanning in your CI/CD pipeline',
      'Monitor for credential exposure in logs',
      'Implement just-in-time secret access',
      'Use different secrets for each environment'
    ];

    return audit;
  }
}

// Export singleton instance
export const secretManager = SecretManager.getInstance();

// Helper functions for common secret access patterns
export const getSecrets = () => secretManager.loadSecrets();
export const getDatabaseConfig = () => secretManager.getDatabaseConfig();
export const getAuthConfig = () => secretManager.getAuthConfig();
export const getTradingConfig = () => secretManager.getTradingConfig();
export const getAIConfig = () => secretManager.getAIConfig();