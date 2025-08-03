// Security validation endpoint for Neural Core Alpha-7
import { NextRequest, NextResponse } from 'next/server';
import { secretManager } from '@/lib/secrets';

export async function GET(req: NextRequest) {
  try {
    // Only allow in development or with proper authorization
    if (process.env.NODE_ENV === 'production') {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized - Security validation requires authentication' },
          { status: 401 }
        );
      }
    }

    // Perform security audit
    const audit = secretManager.auditSecrets();

    // Check for common security misconfigurations
    const securityChecks = {
      environmentVariables: checkEnvironmentVariables(),
      secretExposure: checkSecretExposure(),
      configurationSecurity: checkConfigurationSecurity()
    };

    const response = {
      status: 'Security validation completed',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      audit,
      securityChecks,
      recommendations: [
        ...audit.recommendations,
        ...getEnvironmentSpecificRecommendations()
      ]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Security validation error:', error);
    return NextResponse.json(
      { error: 'Security validation failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

function checkEnvironmentVariables() {
  const issues = [];
  const warnings = [];

  // Check for NEXT_PUBLIC_ secrets (security vulnerability)
  const publicSecrets = Object.keys(process.env).filter(key => 
    key.startsWith('NEXT_PUBLIC_') && 
    (key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD'))
  );

  if (publicSecrets.length > 0) {
    issues.push({
      severity: 'HIGH',
      type: 'EXPOSED_SECRETS',
      message: `Found ${publicSecrets.length} secrets with NEXT_PUBLIC_ prefix`,
      details: publicSecrets.map(key => `${key} (exposed to client-side)`),
      fix: 'Remove NEXT_PUBLIC_ prefix from secret environment variables'
    });
  }

  // Check for default/example values
  const suspiciousValues = [
    'your_secret_here',
    'your_api_key_here', 
    'your_password_here',
    'changeme',
    'secret',
    'password123'
  ];

  Object.entries(process.env).forEach(([key, value]) => {
    if (value && suspiciousValues.some(suspicious => 
      value.toLowerCase().includes(suspicious.toLowerCase())
    )) {
      warnings.push({
        severity: 'MEDIUM',
        type: 'DEFAULT_VALUE',
        message: `Environment variable ${key} appears to contain a default/example value`,
        fix: 'Replace with actual secure value'
      });
    }
  });

  return { issues, warnings };
}

function checkSecretExposure() {
  const issues = [];

  // Check if secrets are being logged (common mistake)
  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' && 
      process.env.NODE_ENV === 'production') {
    issues.push({
      severity: 'HIGH',
      type: 'DEBUG_MODE_PRODUCTION',
      message: 'Debug mode is enabled in production environment',
      fix: 'Set NEXT_PUBLIC_DEBUG_MODE=false in production'
    });
  }

  // Check for weak secret lengths
  const secretKeys = ['NEXTAUTH_SECRET', 'JWT_SECRET', 'ENCRYPTION_KEY', 'SESSION_SECRET'];
  secretKeys.forEach(key => {
    const value = process.env[key];
    if (value && value.length < 32) {
      issues.push({
        severity: 'MEDIUM',
        type: 'WEAK_SECRET',
        message: `Secret ${key} is too short (${value.length} characters)`,
        fix: 'Use at least 32 characters for cryptographic secrets'
      });
    }
  });

  return { issues };
}

function checkConfigurationSecurity() {
  const issues = [];
  const warnings = [];

  // Check HTTPS enforcement
  if (process.env.NODE_ENV === 'production' && 
      process.env.FORCE_HTTPS !== 'true') {
    issues.push({
      severity: 'HIGH',
      type: 'HTTPS_NOT_ENFORCED',
      message: 'HTTPS is not enforced in production',
      fix: 'Set FORCE_HTTPS=true in production environment'
    });
  }

  // Check secure cookies
  if (process.env.NODE_ENV === 'production' && 
      process.env.SECURE_COOKIES !== 'true') {
    warnings.push({
      severity: 'MEDIUM',
      type: 'INSECURE_COOKIES',
      message: 'Secure cookies are not enforced',
      fix: 'Set SECURE_COOKIES=true in production'
    });
  }

  // Check CORS configuration
  if (!process.env.CORS_ORIGINS && process.env.NODE_ENV === 'production') {
    warnings.push({
      severity: 'MEDIUM',
      type: 'OPEN_CORS',
      message: 'CORS origins not restricted',
      fix: 'Set CORS_ORIGINS to limit allowed origins'
    });
  }

  return { issues, warnings };
}

function getEnvironmentSpecificRecommendations() {
  const recommendations = [];

  if (process.env.NODE_ENV === 'production') {
    recommendations.push(
      'Use a dedicated secret management service (AWS Secrets Manager, HashiCorp Vault)',
      'Enable secret rotation policies',
      'Set up security monitoring and alerting',
      'Implement network-level security controls',
      'Regular security audits and penetration testing'
    );
  } else {
    recommendations.push(
      'Use different secrets for development and production',
      'Never commit .env.local files to version control',
      'Use secure random generators for development secrets',
      'Test security configurations before deploying'
    );
  }

  return recommendations;
}