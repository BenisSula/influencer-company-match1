import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // Minimum 8 characters
          if (value.length < 8) return false;
          
          // At least one uppercase letter
          if (!/[A-Z]/.test(value)) return false;
          
          // At least one lowercase letter
          if (!/[a-z]/.test(value)) return false;
          
          // At least one number
          if (!/[0-9]/.test(value)) return false;
          
          // At least one special character
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return false;
          
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character';
        },
      },
    });
  };
}

export function calculatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  else if (password.length < 8) feedback.push('Use at least 8 characters');

  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Add numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
  else feedback.push('Add special characters');

  // Complexity bonus
  const uniqueChars = new Set(password).size;
  if (uniqueChars > 10) score += 10;

  return { score: Math.min(score, 100), feedback };
}
