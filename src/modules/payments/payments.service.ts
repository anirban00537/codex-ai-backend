import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import {
  Package,
  PaymentTransaction,
  User,
  UserPurchasedPackage,
} from '@prisma/client';
import { PrismaService, exclude } from '../prisma/prisma.service';
import {
  DefaultPaginationMetaData,
  coreConstant,
} from 'src/shared/helpers/coreConstant';
import {
  calculatePrice,
  errorResponse,
  getAdminSettingsData,
  paginatioOptions,
  paginationMetaData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { StripeService } from './stripe/stripe.service';
import { paginateType } from './dto/query.dto';
import { IsNumber } from 'class-validator';
import { BraintreeService } from './braintree/braintree.service';
import {
  AvailableFeaturesArray,
  PaymentMethodRazorpaySettingsSlugs,
  PaymentMethodStripeSettingsSlugs,
} from 'src/shared/constants/array.constants';
import { RazorpayService } from './razorpay/razorpay.service';
import { PayStackService } from './paystack/paystack.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}
  stripe = new StripeService();
  braintreeService = new BraintreeService();
  razorPay = new RazorpayService();
  payStackService = new PayStackService();

  async createPackageService(
    packageInfo: CreatePaymentDto,
  ): Promise<ResponseModel> {
    try {
      const checkForWord = [
        coreConstant.AVAILABLE_FEATURES.CODE,
        coreConstant.AVAILABLE_FEATURES.CONTENT_WRITING,
        coreConstant.AVAILABLE_FEATURES.TRANSLATION,
      ];

      const checkForImage = [coreConstant.AVAILABLE_FEATURES.IMAGE_GENERATION];

      const InputAvailableFeaturesArray = packageInfo.available_features
        .split(',')
        .map(Number);

      if (
        InputAvailableFeaturesArray.some((element) =>
          checkForWord.includes(element),
        ) &&
        packageInfo.total_words === 0
      ) {
        return errorResponse('Total word must be greater than 0!');
      }

      if (
        InputAvailableFeaturesArray.some((element) =>
          checkForImage.includes(element),
        ) &&
        packageInfo.total_images === 0
      ) {
        return errorResponse('Total image must be greater than 0!');
      }

      const CreatedPackage = await this.prisma.package.create({
        data: {
          name: packageInfo.name,
          description: packageInfo.description,
          price: packageInfo.price,
          duration:
            packageInfo.duration === coreConstant.PACKAGE_DURATION.MONTHLY
              ? coreConstant.PACKAGE_DURATION.MONTHLY
              : packageInfo.duration === coreConstant.PACKAGE_DURATION.YEARLY
              ? coreConstant.PACKAGE_DURATION.YEARLY
              : coreConstant.PACKAGE_DURATION.WEEKLY,
          type:
            packageInfo.type === coreConstant.PACKAGE_TYPES.SUBSCRIPTION
              ? coreConstant.PACKAGE_TYPES.SUBSCRIPTION
              : coreConstant.PACKAGE_TYPES.PACKAGE,
          total_words: packageInfo.total_words,
          total_images: packageInfo.total_images,
          status:
            packageInfo.status === coreConstant.ACTIVE
              ? coreConstant.ACTIVE
              : coreConstant.INACTIVE,
          image_url: packageInfo.image_url,
          available_features: String(packageInfo.available_features),
          feature_description_lists: packageInfo.feature_description_lists,
          model_name: packageInfo.model_name,
        },
      });

      if (!CreatedPackage) {
        return errorResponse("Package can't be created");
      }

      const packageData = {
        ...CreatedPackage,
        total_words: CreatedPackage.total_words.toString(),
        total_images: CreatedPackage.total_images.toString(),
        total_purchase: CreatedPackage.total_purchase.toString(),
      };

      return successResponse('Package created successfully', packageData);
    } catch (error) {
      processException(error);
    }
  }

  async deletePackage(id: string): Promise<ResponseModel> {
    try {
      const findPackage = await this.prisma.package.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!findPackage) {
        return errorResponse('Package not found');
      }

      const userPurchase = await this.prisma.userPurchasedPackage.findFirst({
        where: {
          package_id: Number(id),
          status: coreConstant.ACTIVE,
        },
      });
      if (userPurchase) {
        const softDeletePackage = await this.prisma.package.update({
          where: {
            id: Number(id),
          },
          data: {
            soft_delete: true,
          },
        });
        if (!softDeletePackage) {
          return errorResponse('Failed to delete package');
        }
        return successResponse('Package deleted successfully');
      }

      const packageData = await this.prisma.package.delete({
        where: {
          id: Number(id),
        },
      });
      if (!packageData) {
        return errorResponse('Package not found');
      }
      return successResponse('Package deleted successfully');
    } catch (error) {
      processException(error);
    }
  }
  async getPackageDetails(id: string): Promise<ResponseModel> {
    try {
      const packageData = await this.prisma.package.findFirst({
        where: {
          id: Number(id),
          soft_delete: false,
        },
      });
      if (!packageData) {
        return errorResponse('Package not found');
      }
      return successResponse('Package details', packageData);
    } catch (error) {
      processException(error);
    }
  }
  async updatePackageService(
    packageInfo: UpdatePaymentDto,
  ): Promise<ResponseModel> {
    try {
      const packageData = await this.prisma.package.update({
        where: {
          id: packageInfo.id,
        },
        data: {
          ...packageInfo,
        },
      });
      if (!packageData) {
        return errorResponse("Package can't be updated");
      }
      return successResponse('Package updated successfully', packageData);
    } catch (error) {
      processException(error);
    }
  }

  async createStripePaymentIntent(
    amount: number,
    user: User,
  ): Promise<ResponseModel> {
    try {
      const { package_valid, package: myPack }: any = await this.getUserPackage(
        user,
      );

      await this.stripe.init();
      const intent = await this.stripe.createStripePaymentIntent(
        amount * 100,
        'USD',
      );
      if (!intent) {
        return errorResponse('Stripe payment intent can not be created');
      }
      return successResponse('Stripe payment intent created successfully', {
        intent: intent,
      });
    } catch (error) {
      processException(error);
    }
  }
  async verifyPaymentIntent(
    paymentIntentId: string,
    subcription_package_Id: string,
    user: User,
  ): Promise<ResponseModel> {
    try {
      const { package_valid, package: myPack }: any = await this.getUserPackage(
        user,
      );
      if (package_valid) {
        return errorResponse('User already subscribed to a package');
      }
      if (!subcription_package_Id) {
        return errorResponse('No package id provided');
      }

      const packageData: Package | null = await this.prisma.package.findFirst({
        where: {
          id: Number(subcription_package_Id),
          soft_delete: false,
          status: coreConstant.ACTIVE,
        },
      });

      if (!packageData) {
        return errorResponse("Package can't be found");
      }

      await this.stripe.init();

      // Verify the payment intent with Stripe
      const intent = await this.stripe.verifyPaymentIntent(paymentIntentId);
      if (!intent || intent.status !== 'succeeded') {
        return errorResponse(
          'Stripe payment intent could not be verified or has not succeeded',
        );
      }

      const start_date = new Date();
      const duration =
        packageData.duration === coreConstant.PACKAGE_DURATION.WEEKLY
          ? 7
          : packageData.duration === coreConstant.PACKAGE_DURATION.MONTHLY
          ? 30
          : 365;
      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + duration);
      const purchedPackage = await this.prisma.userPurchasedPackage.create({
        data: {
          start_date: start_date,
          end_date: end_date,
          status: coreConstant.ACTIVE,
          total_words: packageData.total_words,
          total_images: packageData.total_images,
          user_id: user.id,
          package_id: packageData.id,
          payment_method: coreConstant.PAYMENT_METHODS.STRIPE,
          available_features: packageData.available_features,
        },
      });

      if (!purchedPackage) {
        return errorResponse("Package can't be purchased");
      }
      this.addTransaction(
        coreConstant.PAYMENT_METHODS.STRIPE,
        packageData.id,
        user.id,
        Number(packageData.price),
      );
      return successResponse('Package purchased successfully', purchedPackage);
    } catch (error) {
      processException(error);
    }
  }
  async getAllPackagesAdmin(payload: paginateType): Promise<ResponseModel> {
    try {
      const paginate = await paginatioOptions(payload);

      const queryType =
        Number(payload.type) === coreConstant.PACKAGE_TYPES.SUBSCRIPTION
          ? coreConstant.PACKAGE_TYPES.SUBSCRIPTION
          : coreConstant.PACKAGE_TYPES.PACKAGE;

      const whereCondition = {
        type: queryType,
        soft_delete: false,
      };

      let packages: Package[];
      if (payload.type) {
        packages = await this.prisma.package.findMany({
          where: whereCondition,
          ...paginate,
        });
      } else {
        packages = await this.prisma.package.findMany({
          where: {
            // type: queryType,
            // soft_delete: false,
          },
          ...paginate,
        });
      }
      const paginationMeta = await paginationMetaData(
        'package',
        payload,
        whereCondition,
      );

      if (!packages) return errorResponse('Packages not found');
      return successResponse('Packages fetched successfully', {
        packages,
        meta: paginationMeta,
      });
    } catch (error) {
      processException(error);
    }
  }
  async getAllSubcriptionPackages(payload: any): Promise<ResponseModel> {
    try {
      const paginate = await paginatioOptions(payload);

      const queryType = payload.type
        ? Number(payload.type) === coreConstant.PACKAGE_TYPES.SUBSCRIPTION
          ? coreConstant.PACKAGE_TYPES.SUBSCRIPTION
          : coreConstant.PACKAGE_TYPES.PACKAGE
        : undefined;

      const whereClause = {
        type: queryType,
        status: coreConstant.ACTIVE,
        soft_delete: false,
      };

      if (payload.search) {
        whereClause['OR'] = {
          OR: [
            {
              name: payload.search,
            },
            {
              price: Number(payload.search),
            },
            {
              total_words: Number(payload.search),
            },
            {
              total_images: Number(payload.search),
            },
          ],
        };
      }
      let packages: Package[];

      packages = await this.prisma.package.findMany({
        where: whereClause,
        ...paginate,
      });

      const paginationMeta =
        packages.length > 0
          ? await paginationMetaData('package', payload, whereClause)
          : DefaultPaginationMetaData;

      if (!packages) return errorResponse('Packages not found');
      return successResponse('Packages fetched successfully', {
        packages,
        meta: packages.length ? paginationMeta : DefaultPaginationMetaData,
      });
    } catch (error) {
      processException(error);
    }
  }

  async getAllActiveSubscriptionPackage() {
    try {
      const packages = await this.prisma.package.findMany({
        where: {
          type: coreConstant.PACKAGE_TYPES.SUBSCRIPTION,
          status: coreConstant.ACTIVE,
          soft_delete: false,
        },
      });
      return successResponse('Active subscription packages', packages);
    } catch (error) {
      processException(error);
    }
  }

  async subscribeToSubcriptionPackage(
    user: User,
    subcription_package_Id: string,
  ): Promise<ResponseModel> {
    try {
      if (!subcription_package_Id) {
        return errorResponse('No package id provided');
      }

      const { package_valid } = await this.getUserPackage(user);
      if (package_valid) {
        return errorResponse('User already subscribed to a package');
      }

      const packageData: Package | null = await this.prisma.package.findFirst({
        where: {
          id: Number(subcription_package_Id),
          status: coreConstant.ACTIVE,
          soft_delete: false,
        },
      });

      if (!packageData) {
        return errorResponse("Package can't be found");
      }

      // Calculate the end_date based on the start_date and duration
      const start_date = new Date();
      const duration =
        packageData.duration === coreConstant.PACKAGE_DURATION.WEEKLY
          ? 7
          : packageData.duration === coreConstant.PACKAGE_DURATION.MONTHLY
          ? 30
          : 365;
      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + duration);

      const purchedPackage = await this.prisma.userPurchasedPackage.create({
        data: {
          start_date: start_date,
          end_date: end_date,
          status: coreConstant.ACTIVE,
          total_words: packageData.total_words,
          total_images: packageData.total_images,
          user_id: user.id,
          package_id: packageData.id,
          payment_method: coreConstant.PAYMENT_METHODS.STRIPE,
          available_features: packageData.available_features,
          model: packageData.model_name,
        },
      });

      if (!purchedPackage) {
        return errorResponse("Package can't be purchased");
      }
      const total_purchase = Number(packageData.total_purchase) + 1;
      await this.prisma.package.update({
        where: {
          id: packageData.id,
        },
        data: {
          total_purchase: total_purchase,
        },
      });
      this.addTransaction(
        coreConstant.PAYMENT_METHODS.STRIPE,
        packageData.id,
        user.id,
        Number(packageData.price),
      );
      return successResponse('Package purchased successfully', purchedPackage);
    } catch (error) {
      processException(error);
    }
  }
  async addPackageToSubscription(
    user: User,
    packageId: string,
    paymentIntentId: string,
  ): Promise<ResponseModel> {
    try {
      if (!packageId || !paymentIntentId) {
        return errorResponse('Invalid data please provide data properly');
      }
      const { package_valid, package: SubcribedPackage } =
        await this.getUserPackage(user);
      if (!package_valid) {
        return errorResponse(
          'Please subscribe before adding a package to subscription',
        );
      }
      const getPackageToAdd = await this.prisma.package.findFirst({
        where: {
          id: Number(packageId),
          type: coreConstant.PACKAGE_TYPES.PACKAGE,
        },
      });
      if (!getPackageToAdd) {
        return errorResponse('Package not found!');
      }
      await this.stripe.init();

      // Verify the payment intent with Stripe
      const intent = await this.stripe.verifyPaymentIntent(paymentIntentId);
      if (!intent || intent.status !== 'succeeded') {
        return errorResponse(
          'Stripe payment intent could not be verified or has not succeeded',
        );
      }
      const userPurchasedPackage =
        await this.prisma.userPurchasedPackage.findUnique({
          where: {
            id: Number(SubcribedPackage.id),
          },
        });
      if (!userPurchasedPackage) {
        return errorResponse('User package not found!');
      }

      // Split existing available features into an array and merge with new package features
      const existingFeatures =
        userPurchasedPackage.available_features.split(',');
      const newFeatures = getPackageToAdd.available_features.split(',');
      const mergedFeatures = [...existingFeatures, ...newFeatures];

      // Convert merged features back to a comma-separated string
      const updatedAvailableFeatures = mergedFeatures.join(',');

      const userUpdatedPackage = await this.prisma.userPurchasedPackage.update({
        where: {
          id: Number(SubcribedPackage.id),
        },
        data: {
          total_words:
            Number(SubcribedPackage.total_words) +
            Number(getPackageToAdd.total_words),
          total_images:
            Number(SubcribedPackage.total_images) +
            Number(getPackageToAdd.total_images),
          available_features: updatedAvailableFeatures,
        },
      });
      if (!userUpdatedPackage) {
        return errorResponse('Purchase failed!');
      }
      this.addTransaction(
        coreConstant.PAYMENT_METHODS.STRIPE,
        getPackageToAdd.id,
        user.id,
        Number(getPackageToAdd.price),
      );
      return successResponse('Purchased successfully!', userUpdatedPackage);
    } catch (error) {
      processException(error);
    }
  }

  async getUserPackage(user: User): Promise<{
    package: UserPurchasedPackage | null;
    package_valid: boolean;
    word_limit_exceed: boolean;
    image_limit_exceed: boolean;
  }> {
    let userPackage: any = await this.prisma.userPurchasedPackage.findFirst({
      where: {
        user_id: user.id,
        status: coreConstant.ACTIVE,
      },
      orderBy: {
        end_date: 'desc',
      },
      include: {
        package: true,
      },
    });
    const packageRef = userPackage;
    if (!userPackage) {
      return {
        package: null,
        package_valid: false,
        image_limit_exceed: true,
        word_limit_exceed: true,
      };
    }

    const image_limit_exceed =
      userPackage.used_images >= userPackage.total_images ? true : false;
    const word_limit_exceed =
      userPackage.used_words >= userPackage.total_words ? true : false;

    const currentDate = new Date();
    const endDate = new Date(userPackage.end_date);
    if (currentDate > endDate) {
      userPackage = await this.changeUserPackageStatus(
        packageRef.id,
        coreConstant.INACTIVE,
      );
    } else if (image_limit_exceed && word_limit_exceed) {
      userPackage = await this.changeUserPackageStatus(
        packageRef.id,
        coreConstant.INACTIVE,
      );
    }
    userPackage.remaining_images =
      userPackage?.total_images - userPackage?.used_images;
    userPackage.remaining_words =
      userPackage?.total_words - userPackage?.used_words;
    const package_valid =
      userPackage.status === coreConstant.ACTIVE ? true : false;

    return {
      package: userPackage,
      package_valid,
      image_limit_exceed,
      word_limit_exceed,
    };
  }

  async suggestPricing(
    model_name: string,
    images: number,
    words: number,
  ): Promise<ResponseModel> {
    try {
      if (!model_name) {
        return errorResponse('Please provide all the required fields');
      }
      const totalPrice = Math.ceil(calculatePrice(model_name, words, images));
      return successResponse(`Your cost will be around $${totalPrice}`, {
        price: totalPrice,
      });
    } catch (error) {}
  }
  async getOpenAIModelNames(): Promise<ResponseModel> {
    try {
      const modelNames = coreConstant.OPEN_AI_MODEL_NAMES;
      let modifyModelNames = [];
      modelNames.map((item) => {
        modifyModelNames.push({
          label: item,
          value: item,
        });
      });

      if (!modelNames) {
        return errorResponse('No model name found!');
      }
      return successResponse(
        'Model name fetched successfully',
        modifyModelNames,
      );
    } catch (error) {}
  }

  async checkSubscriptionStatus(user: User): Promise<ResponseModel> {
    try {
      const {
        package_valid,
        package: myPackage,
        image_limit_exceed,
        word_limit_exceed,
      }: any = await this.getUserPackage(user);
      if (!myPackage) {
        return errorResponse('Not Subscribed to any package"');
      }
      const available_features = myPackage.available_features
        .split(',')
        .map(Number);
      const response = {
        ...myPackage,
        package_valid,
        image_limit_exceed,
        word_limit_exceed,
        available_features,
      };
      if (!package_valid) {
        return errorResponse('Package expired please purchase again');
      }
      return successResponse('Subcribstion is valid', response);
    } catch (error) {
      processException(error);
    }
  }
  changeUserPackageStatus(id: number, status: number) {
    return this.prisma.userPurchasedPackage.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
  }
  async updateUserUsedWords(userPurchasedPackageid: number, words: number) {
    const getUserPurchasedPackage: any =
      await this.prisma.userPurchasedPackage.findUnique({
        where: {
          id: userPurchasedPackageid,
        },
      });
    const updatedUsedWords =
      Number(getUserPurchasedPackage.used_words) + Number(words);

    return this.prisma.userPurchasedPackage.update({
      where: {
        id: userPurchasedPackageid,
      },
      data: {
        used_words: updatedUsedWords,
      },
    });
  }
  async updateUserUsedImages(userPurchasedPackageid: number, images: number) {
    const getUserPurchasedPackage: any =
      await this.prisma.userPurchasedPackage.findUnique({
        where: {
          id: userPurchasedPackageid,
        },
      });
    const updatedUsedImages =
      Number(getUserPurchasedPackage.used_images) + images;
    return this.prisma.userPurchasedPackage.update({
      where: {
        id: userPurchasedPackageid,
      },
      data: {
        used_images: updatedUsedImages,
      },
    });
  }

  async addTransaction(
    payment_method: number,
    packageId: number,
    userId: number,
    price: number,
  ): Promise<PaymentTransaction> {
    const newTransaction = await this.prisma.paymentTransaction.create({
      data: {
        payment_method: payment_method,
        packageId: packageId,
        userId: userId,
        price: price,
      },
    });
    return newTransaction;
  }
  async getAllTransaction(payload: any): Promise<ResponseModel> {
    try {
      const whereClause = {
        OR: [
          {
            price: !isNaN(Number(payload.search))
              ? Number(payload.search)
              : undefined,
          },
          {
            Package: {
              name: {
                contains: payload.search,
              },
            },
          },
          {
            User: {
              OR: [
                {
                  email: {
                    contains: payload.search,
                  },
                },
                {
                  first_name: {
                    contains: payload.search,
                  },
                },
                {
                  last_name: {
                    contains: payload.search,
                  },
                },
                {
                  phone: { contains: payload.search },
                },
              ],
            },
          },
        ],
      };

      const paginate = await paginatioOptions(payload);

      const allTransactions = await this.prisma.paymentTransaction.findMany({
        where: whereClause,
        include: {
          Package: true,
          User: {
            include: {
              UserPurchase: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        ...paginate,
      });

      const paginationMeta =
        allTransactions.length > 0
          ? await paginationMetaData('paymentTransaction', payload, whereClause)
          : DefaultPaginationMetaData;

      const data = {
        list: allTransactions,
        meta: paginationMeta,
      };

      return successResponse('Transaction found!', data);
    } catch (error) {
      processException(error);
    }
  }
  async createBraintreeClientToken(): Promise<ResponseModel> {
    try {
      const clientToken = await this.braintreeService.getClientToken();
      return successResponse('Braintree client token created successfully', {
        clientToken,
      });
    } catch (error) {
      console.log(error, 'errorerrorerrorerror');
      processException(error);
    }
  }
  async processBraintreePaymentTransaction(
    amount: number,
    paymentMethodNonce: string,
    subcription_package_Id: string,
    user: User,
  ): Promise<ResponseModel> {
    try {
      const { package_valid, package: myPack }: any = await this.getUserPackage(
        user,
      );
      if (package_valid) {
        return errorResponse('User already subscribed to a package');
      }
      if (!subcription_package_Id) {
        return errorResponse('No package id provided');
      }

      const packageData: Package | null = await this.prisma.package.findFirst({
        where: {
          id: Number(subcription_package_Id),
          soft_delete: false,
          status: coreConstant.ACTIVE,
        },
      });

      if (!packageData) {
        return errorResponse("Package can't be found");
      }

      const transaction = await this.braintreeService.createTransaction(
        amount,
        paymentMethodNonce,
      );
      if (!transaction) {
        return errorResponse('Purchase failed!');
      }

      const start_date = new Date();
      const duration =
        packageData.duration === coreConstant.PACKAGE_DURATION.WEEKLY
          ? 7
          : packageData.duration === coreConstant.PACKAGE_DURATION.MONTHLY
          ? 30
          : 365;
      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + duration);
      const purchedPackage = await this.prisma.userPurchasedPackage.create({
        data: {
          start_date: start_date,
          end_date: end_date,
          status: coreConstant.ACTIVE,
          total_words: packageData.total_words,
          total_images: packageData.total_images,
          user_id: user.id,
          package_id: packageData.id,
          payment_method: coreConstant.PAYMENT_METHODS.STRIPE,
          available_features: packageData.available_features,
        },
      });

      if (!purchedPackage) {
        return errorResponse("Package can't be purchased");
      }
      await this.addTransaction(
        coreConstant.PAYMENT_METHODS.BRAINTREE,
        packageData.id,
        user.id,
        Number(packageData.price),
      );
      return successResponse('Package purchased successfully', purchedPackage);
    } catch (error) {
      return errorResponse(
        'Braintree payment transaction processed successfully',
      );
    }
  }
  async razorpayCreateOrder(amount, packageId, user): Promise<ResponseModel> {
    try {
      const paymentData: any = await getAdminSettingsData(
        PaymentMethodRazorpaySettingsSlugs,
      );
      if (!paymentData.key_id && !paymentData.key_secret) {
        return errorResponse('Credential not provided for razorpay');
      }
      this.razorPay.init();
      const data: any = await getAdminSettingsData(
        PaymentMethodRazorpaySettingsSlugs,
      );
      let amountLocal = Number(amount) * 100;
      const repsonse: any = await this.razorPay.createOrder(
        amountLocal,
        'USD',
        packageId,
      );
      repsonse.key_id = data.key_id;
      return successResponse('Order created successfully', repsonse);
    } catch (error) {
      console.log(error, 'error');
      processException(error);
    }
  }
  async razorpaycapturePayment(
    orderId,
    user: User,
    subcription_package_Id,
  ): Promise<ResponseModel> {
    try {
      const orderValid = this.razorPay.verifyPayment(orderId);
      if (!orderValid) {
        return errorResponse('Order id not valid');
      }
      const { package_valid, package: myPack }: any = await this.getUserPackage(
        user,
      );
      if (package_valid) {
        return errorResponse('User already subscribed to a package');
      }
      if (!subcription_package_Id) {
        return errorResponse('No package id provided');
      }
      const packageData: Package | null = await this.prisma.package.findFirst({
        where: {
          id: Number(subcription_package_Id),
          soft_delete: false,
          status: coreConstant.ACTIVE,
        },
      });
      if (!packageData) {
        return errorResponse("Package can't be found");
      }
      const start_date = new Date();
      const duration =
        packageData.duration === coreConstant.PACKAGE_DURATION.WEEKLY
          ? 7
          : packageData.duration === coreConstant.PACKAGE_DURATION.MONTHLY
          ? 30
          : 365;
      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + duration);
      const purchedPackage = await this.prisma.userPurchasedPackage.create({
        data: {
          start_date: start_date,
          end_date: end_date,
          status: coreConstant.ACTIVE,
          total_words: packageData.total_words,
          total_images: packageData.total_images,
          user_id: user.id,
          package_id: packageData.id,
          payment_method: coreConstant.PAYMENT_METHODS.STRIPE,
          available_features: packageData.available_features,
        },
      });

      if (!purchedPackage) {
        return errorResponse("Package can't be purchased");
      }
      await this.addTransaction(
        coreConstant.PAYMENT_METHODS.RAZORPAY,
        packageData.id,
        user.id,
        Number(packageData.price),
      );
      return successResponse('Package Purchase successfully');
    } catch (error) {
      processException(error);
    }
  }
  async razorPaysubscription(
    orderId,
    user: User,
    packageId,
  ): Promise<ResponseModel> {
    try {
      if (!packageId || !orderId) {
        return errorResponse('Invalid data please provide data properly');
      }
      const orderValid = this.razorPay.verifyPayment(orderId);

      const { package_valid, package: SubcribedPackage } =
        await this.getUserPackage(user);
      if (!package_valid) {
        return errorResponse(
          'Please subscribe before adding a package to subscription',
        );
      }
      const getPackageToAdd = await this.prisma.package.findFirst({
        where: {
          id: Number(packageId),
          type: coreConstant.PACKAGE_TYPES.PACKAGE,
        },
      });
      if (!getPackageToAdd) {
        return errorResponse('Package not found!');
      }

      const userPurchasedPackage =
        await this.prisma.userPurchasedPackage.findUnique({
          where: {
            id: Number(SubcribedPackage.id),
          },
        });
      if (!userPurchasedPackage) {
        return errorResponse('User package not found!');
      }

      const existingFeatures =
        userPurchasedPackage.available_features.split(',');
      const newFeatures = getPackageToAdd.available_features.split(',');
      const mergedFeatures = [...existingFeatures, ...newFeatures];

      const updatedAvailableFeatures = mergedFeatures.join(',');

      const userUpdatedPackage = await this.prisma.userPurchasedPackage.update({
        where: {
          id: Number(SubcribedPackage.id),
        },
        data: {
          total_words:
            Number(SubcribedPackage.total_words) +
            Number(getPackageToAdd.total_words),
          total_images:
            Number(SubcribedPackage.total_images) +
            Number(getPackageToAdd.total_images),
          available_features: updatedAvailableFeatures,
        },
      });
      if (!userUpdatedPackage) {
        return errorResponse('Purchase failed!');
      }

      await this.addTransaction(
        coreConstant.PAYMENT_METHODS.RAZORPAY,
        getPackageToAdd.id,
        user.id,
        Number(getPackageToAdd.price),
      );
      return successResponse('Package added successfully');
    } catch (error) {
      processException(error);
    }
  }
  async paystackSubscription(
    referance,
    user: User,
    packageId,
  ): Promise<ResponseModel> {
    try {
      if (!packageId || !referance) {
        return errorResponse('Invalid data please provide data properly');
      }
      const orderValid = await this.payStackService.verifyPayment(referance);
      console.log(orderValid, 'orderValid');
      if (!orderValid.status) {
        return errorResponse('Invalid verification code');
      }
      const { package_valid, package: SubcribedPackage } =
        await this.getUserPackage(user);
      if (!package_valid) {
        return errorResponse(
          'Please subscribe before adding a package to subscription',
        );
      }
      const getPackageToAdd = await this.prisma.package.findFirst({
        where: {
          id: Number(packageId),
          type: coreConstant.PACKAGE_TYPES.PACKAGE,
        },
      });
      if (!getPackageToAdd) {
        return errorResponse('Package not found!');
      }

      const userPurchasedPackage =
        await this.prisma.userPurchasedPackage.findUnique({
          where: {
            id: Number(SubcribedPackage.id),
          },
        });
      if (!userPurchasedPackage) {
        return errorResponse('User package not found!');
      }

      const existingFeatures =
        userPurchasedPackage.available_features.split(',');
      const newFeatures = getPackageToAdd.available_features.split(',');
      const mergedFeatures = [...existingFeatures, ...newFeatures];

      const updatedAvailableFeatures = mergedFeatures.join(',');

      const userUpdatedPackage = await this.prisma.userPurchasedPackage.update({
        where: {
          id: Number(SubcribedPackage.id),
        },
        data: {
          total_words:
            Number(SubcribedPackage.total_words) +
            Number(getPackageToAdd.total_words),
          total_images:
            Number(SubcribedPackage.total_images) +
            Number(getPackageToAdd.total_images),
          available_features: updatedAvailableFeatures,
        },
      });
      if (!userUpdatedPackage) {
        return errorResponse('Purchase failed!');
      }

      await this.addTransaction(
        coreConstant.PAYMENT_METHODS.RAZORPAY,
        getPackageToAdd.id,
        user.id,
        Number(getPackageToAdd.price),
      );
      return successResponse('Package added successfully');
    } catch (error) {
      processException(error);
    }
  }
  async paystackAddPackage(
    referance,
    user: User,
    packageId,
  ): Promise<ResponseModel> {
    try {
       if (!packageId || !referance) {
         return errorResponse('Invalid data please provide data properly');
       }
       const orderValid = await this.payStackService.verifyPayment(referance);
       console.log(orderValid, 'orderValid');
       if (!orderValid.status) {
         return errorResponse('Invalid verification code');
       }
       const { package_valid, package: SubcribedPackage } =
         await this.getUserPackage(user);
       if (!package_valid) {
         return errorResponse(
           'Please subscribe before adding a package to subscription',
         );
       }
      if (!packageId) {
        return errorResponse('No package id provided');
      }
      const packageData: Package | null = await this.prisma.package.findFirst({
        where: {
          id: Number(packageId),
          soft_delete: false,
          status: coreConstant.ACTIVE,
        },
      });
      if (!packageData) {
        return errorResponse("Package can't be found");
      }
      const start_date = new Date();
      const duration =
        packageData.duration === coreConstant.PACKAGE_DURATION.WEEKLY
          ? 7
          : packageData.duration === coreConstant.PACKAGE_DURATION.MONTHLY
          ? 30
          : 365;
      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + duration);
      const purchedPackage = await this.prisma.userPurchasedPackage.create({
        data: {
          start_date: start_date,
          end_date: end_date,
          status: coreConstant.ACTIVE,
          total_words: packageData.total_words,
          total_images: packageData.total_images,
          user_id: user.id,
          package_id: packageData.id,
          payment_method: coreConstant.PAYMENT_METHODS.STRIPE,
          available_features: packageData.available_features,
        },
      });

      if (!purchedPackage) {
        return errorResponse("Package can't be purchased");
      }
      await this.addTransaction(
        coreConstant.PAYMENT_METHODS.RAZORPAY,
        packageData.id,
        user.id,
        Number(packageData.price),
      );
      return successResponse('Package Purchase successfully');
    } catch (error) {
      processException(error);
    }
  }
  async payStackCreatePayment(
    amount,
    packageId,
    user: User,
    type,
  ): Promise<ResponseModel> {
    try {
      const response = await this.payStackService.initiatePayment(
        amount,
        user.email,
        packageId,
        type,
      );
      return successResponse('Payment created successfully', response);
    } catch (error) {
      processException(error);
    }
  }


  async addPackageToSubscriptionBraintree(
    amount: number,
    paymentMethodNonce: string,
    packageId: string,
    user: User,
  ): Promise<ResponseModel> {
    try {
      if (!packageId || !paymentMethodNonce || !amount) {
        return errorResponse('Invalid data please provide data properly');
      }
      const { package_valid, package: SubcribedPackage } =
        await this.getUserPackage(user);
      if (!package_valid) {
        return errorResponse(
          'Please subscribe before adding a package to subscription',
        );
      }
      const getPackageToAdd = await this.prisma.package.findFirst({
        where: {
          id: Number(packageId),
          type: coreConstant.PACKAGE_TYPES.PACKAGE,
        },
      });
      if (!getPackageToAdd) {
        return errorResponse('Package not found!');
      }
      const transaction = await this.braintreeService.createTransaction(
        amount,
        paymentMethodNonce,
      );

      if (!transaction) {
        return errorResponse('Purchase failed!');
      }
      const userPurchasedPackage =
        await this.prisma.userPurchasedPackage.findUnique({
          where: {
            id: Number(SubcribedPackage.id),
          },
        });
      if (!userPurchasedPackage) {
        return errorResponse('User package not found!');
      }

      const existingFeatures =
        userPurchasedPackage.available_features.split(',');
      const newFeatures = getPackageToAdd.available_features.split(',');
      const mergedFeatures = [...existingFeatures, ...newFeatures];

      const updatedAvailableFeatures = mergedFeatures.join(',');

      const userUpdatedPackage = await this.prisma.userPurchasedPackage.update({
        where: {
          id: Number(SubcribedPackage.id),
        },
        data: {
          total_words:
            Number(SubcribedPackage.total_words) +
            Number(getPackageToAdd.total_words),
          total_images:
            Number(SubcribedPackage.total_images) +
            Number(getPackageToAdd.total_images),
          available_features: updatedAvailableFeatures,
        },
      });
      if (!userUpdatedPackage) {
        return errorResponse('Purchase failed!');
      }

      await this.addTransaction(
        coreConstant.PAYMENT_METHODS.BRAINTREE,
        getPackageToAdd.id,
        user.id,
        Number(getPackageToAdd.price),
      );

      return successResponse('Purchased successfully!', userUpdatedPackage);
    } catch (error) {
      processException(error);
    }
  }

  async getMyTransactionList(user: User, payload: any) {
    try {
      const whereClause = {
        userId: user.id,
        OR: [
          {
            price: !isNaN(Number(payload.search))
              ? Number(payload.search)
              : undefined,
          },
          {
            Package: {
              name: {
                contains: payload.search,
              },
            },
          },
          {
            User: {
              OR: [
                {
                  email: {
                    contains: payload.search,
                  },
                },
                {
                  first_name: {
                    contains: payload.search,
                  },
                },
                {
                  last_name: {
                    contains: payload.search,
                  },
                },
                {
                  phone: { contains: payload.search },
                },
              ],
            },
          },
        ],
      };

      const paginate = await paginatioOptions(payload);

      const allTransactions = await this.prisma.paymentTransaction.findMany({
        where: whereClause,
        include: {
          Package: true,
          User: {
            select: {
              ...exclude('user', ['password']),
              UserPurchase: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        ...paginate,
      });
      // UserPurchase
      const paginationMeta =
        allTransactions.length > 0
          ? await paginationMetaData('paymentTransaction', payload, whereClause)
          : DefaultPaginationMetaData;

      const data = {
        list: allTransactions,
        meta: paginationMeta,
      };

      return successResponse('My Transaction list', data);
    } catch (error) {
      processException(error);
    }
  }
}
