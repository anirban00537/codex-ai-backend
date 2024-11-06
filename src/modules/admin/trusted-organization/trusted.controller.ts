import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { TrustedOrganizationService } from './trusted.service';
import { AddNewTrustedOrganizationDto } from './dto/add-new-trusted-organization.dto';
import { UpdateTrustedOrganizationDto } from './dto/update-trusted-organization.dto';

@Controller('admin')
export class TrustedOrganizationController {
  constructor(
    private readonly trustedOrganizationService: TrustedOrganizationService,
  ) {}

  @Post('add-new-trusted-organization')
  addNewTrustedOrganization(@Body() payload: AddNewTrustedOrganizationDto) {
    return this.trustedOrganizationService.addNewTrustedOrganization(payload);
  }

  @Get('get-list-trusted-organization')
  getListOfTrustedOrganization(@Query() payload: any) {
    return this.trustedOrganizationService.getListOfTrustedOrganization(
      payload,
    );
  }

  @Get('trusted-organization-details-:id')
  getTrustedOrganizationDetails(@Param('id') id: number) {
    return this.trustedOrganizationService.getTrustedOrganizationDetails(id);
  }

  @Post('update-trusted-organization')
  updateTrustedOrganization(@Body() payload: UpdateTrustedOrganizationDto) {
    return this.trustedOrganizationService.updateTrustedOrganization(payload);
  }
  @Delete('trusted-organization-delete-:id')
  deleteTrustedOrganization(@Param('id') id: number) {
    return this.trustedOrganizationService.deleteTrustedOrganization(id);
  }
}
