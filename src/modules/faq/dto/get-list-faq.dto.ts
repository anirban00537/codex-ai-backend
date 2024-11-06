import { paginateInterface } from 'src/shared/constants/types';

export interface GetFaqListByTypePaginate extends paginateInterface {
  limit: string | number;
  offset: string | number;
  type: string | number | undefined;
}
