import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { CreateGuessDto } from '@app/modules/guess/dtos/create-guess.dto';
import { GuessDto } from '@app/modules/guess/dtos/guess.dto';
import { GuessService } from '@app/modules/guess/services/guess.service';

@ApiTags('Location')
@Controller('locations/guess')
export class GuessController {
  constructor(private readonly guessService: GuessService) {}

  @Post(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a guess for location' })
  @ApiCreatedResponse({ type: GuessDto, description: 'The guess has been successfully created.' })
  async create(@User('userId') userId: string, @Param('id') locationId: string, @Body() dto: CreateGuessDto) {
    const guess = await this.guessService.create(dto, userId, locationId);
    return serializeToDto(GuessDto, guess);
  }
}
