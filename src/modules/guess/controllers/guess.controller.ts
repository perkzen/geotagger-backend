import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkPaginatedResponse } from '@app/common/decorators/api-ok-paginated-response.decorator';
import { PaginationQuery } from '@app/common/pagination/pagination.query';
import { serializeToPaginationDto } from '@app/common/pagination/serializte-to-pagniated-dto';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { CreateGuessDto } from '@app/modules/guess/dtos/create-guess.dto';
import { GuessDto } from '@app/modules/guess/dtos/guess.dto';
import { UserBestScoresDto } from '@app/modules/guess/dtos/user-best-scores.dto';
import { GuessService } from '@app/modules/guess/services/guess.service';

@ApiTags('Location')
@Controller('locations')
export class GuessController {
  constructor(private readonly guessService: GuessService) {}

  @Post('guess/:id')
  @ApiTags('Location')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a guess for location' })
  @ApiCreatedResponse({ type: GuessDto, description: 'The guess has been successfully created.' })
  async create(@User('userId') userId: string, @Param('id') locationId: string, @Body() dto: CreateGuessDto) {
    const guess = await this.guessService.create(dto, userId, locationId);
    return serializeToDto(GuessDto, guess);
  }

  @Get('me/best-scores')
  @ApiTags('Guess')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user best scores' })
  @ApiOkPaginatedResponse(GuessDto)
  async getUserBestScores(@Query() query: PaginationQuery, @User('userId') userId: string) {
    const data = await this.guessService.getUserBestScores(userId, query);
    return serializeToPaginationDto(UserBestScoresDto, data);
  }
}
