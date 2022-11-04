import { Body, Controller, Get, Post } from '@nestjs/common';

import { AppService } from './app.service';

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

  @Post('/query')
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
