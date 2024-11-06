import {

  ValidationArguments,
  registerDecorator,
} from 'class-validator';
export function IsNotNegative(property: string) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotNegative',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: {
        message: `${property} cannot be a negative value`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value >= 0;
        },
      },
    });
  };
}
