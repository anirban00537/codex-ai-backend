import { Prisma } from '@prisma/client';

export class User implements Prisma.UserUncheckedCreateInput {
  id?: number;
  email: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
  user_name?: string | null;
  unique_code?: string | null;
  phone?: string | null;
  photo?: string | null;
  country?: string | null;
  birth_date?: Date | string | null;
  role?: number;
  status?: number;
  is_subscribed?: number;
  email_verified?: number;
  phone_verified?: number;
  gender?: number;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  // UserTokens?: Prisma.UserTokensUncheckedCreateNestedManyWithoutUserInput | null;
  // UserVerificationCodes?: Prisma.UserVerificationCodesUncheckedCreateNestedManyWithoutUserInput | null;
  // UserPurchase?: Prisma.UserPurchasedPackageUncheckedCreateNestedManyWithoutUserInput | null;
  // MyDocuments?: Prisma.MyDocumentsUncheckedCreateNestedManyWithoutUserInput | null;
  // MyUploads?: Prisma.MyUploadsUncheckedCreateNestedManyWithoutUserInput | null;
  
}
