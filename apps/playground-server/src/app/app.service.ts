import { runner } from '@arql/core';
import { DataSource } from '@arql/models';
import { JsSource } from '@arql/source-js';
import { PostgreSQL } from '@arql/source-postgresql';
import { collectorConfig } from '@arql/stdlib-collector';
import { transforms, functions, opMap } from '@arql/stdlib-definitions';
import { Injectable } from '@nestjs/common';
import { createLocalSource } from './sources/local';
import { createPgSource } from './sources/postgresql';

@Injectable()
export class AppService {
  private sources: Record<string, DataSource> = {};

  get models() {
    return new Map(
      Object.values(this.sources)
        .map((s) => s.models)
        .flat()
        .map((m) => [m.name, m])
    );
  }

  private run: ReturnType<typeof runner> | undefined;

  getSource(name: string) {
    return this.sources[name];
  }

  private refreshRun() {
    this.run = runner({
      contextualiserConfig: {
        models: this.models,
        transforms: [...transforms],
        functions: [...functions],
        opMap,
      },
      collectorConfig,
    });
  }

  async updateSourceModels(name: string) {
    const source = this.getSource(name);
    if (source instanceof PostgreSQL) {
      await source.dumpModels();
    } else if (source instanceof JsSource) {
      await source.dumpModels();
    }

    this.refreshRun();
  }

  getSources() {
    return Object.entries(this.sources).reduce((acc, [name, source]) => {
      acc[name] = {
        type: source.constructor.name,
        models: source.models.map((v) => v.def),
      };
      return acc;
    }, {} as Record<string, { type: string; models: unknown[] }>);
  }

  async addPgSource(
    name: string,
    connectionVariables: Record<string, unknown>
  ) {
    const source = await createPgSource(connectionVariables);
    this.sources[name] = source;
    this.refreshRun();
    return source;
  }

  async addLocalSource(
    name: string,
    data: Map<string, Record<string, unknown>[]>
  ) {
    const source = await createLocalSource(data);
    this.sources[name] = source;
    this.refreshRun();
    return source;
  }

  async query(query: string, params: unknown[]) {
    if (!this.run) {
      this.refreshRun();
    }

    const data = await this.run?.(query, params);
    return data;
  }
}
