import {
  BadRequestException,
  Body,
  CallHandler,
  Controller,
  ExecutionContext,
  Get,
  Injectable,
  NestInterceptor,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';

import { AppService } from './app.service';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // next.handle() is an Observable of the controller's result value
    return next.handle().pipe(
      catchError((error) => {
        console.error(error);
        throw new BadRequestException(error.message);
      })
    );
  }
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return { message: 'Welcome to the ARQL playground API' };
  }

  @Get('/sources')
  getSources() {
    return this.appService.getSources();
  }

  @Post('/sources/pg')
  async addPgSource(@Body() data) {
    await this.appService.addPgSource(data.name, data.connectionVariables);
  }

  @Post('/sources/local')
  async addLocalSource(
    @Body()
    data: {
      name: string;
      data: Record<string, Record<string, unknown>[]>;
    }
  ) {
    await this.appService.addLocalSource(
      data.name,
      new Map(Object.entries(data.data))
    );
  }

  @Post('/sources/:name/refresh')
  async refreshSource(@Param('name') name: string) {
    await this.appService.updateSourceModels(name);
  }

  @Post('/query')
  @UseInterceptors(ErrorInterceptor)
  async query(
    @Body()
    data: {
      query: string;
      params: unknown[];
    }
  ) {
    return await this.appService.query(data.query, data.params);
  }
}
