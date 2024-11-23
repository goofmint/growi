import type { IConfigManager, ConfigSource, UpdateConfigOptions } from '@growi/core/dist/interfaces';
import { parseISO } from 'date-fns/parseISO';

import loggerFactory from '~/utils/logger';

import type S2sMessage from '../../models/vo/s2s-message';
import type { S2sMessagingService } from '../s2s-messaging/base';
import type { S2sMessageHandlable } from '../s2s-messaging/handlable';

import type { ConfigKey, ConfigValues } from './config-definition';
import { ENV_ONLY_GROUPS } from './config-definition';
import { ConfigLoader } from './config-loader';


const logger = loggerFactory('growi:service:ConfigManager');

export class ConfigManager implements IConfigManager<ConfigKey, ConfigValues>, S2sMessageHandlable {

  private configLoader: ConfigLoader;

  private s2sMessagingService?: S2sMessagingService;

  private envConfig?: Record<ConfigKey, ConfigValues[ConfigKey]>;

  private dbConfig?: Record<ConfigKey, ConfigValues[ConfigKey] | null>;

  private lastLoadedAt?: Date;

  private keyToGroupMap: Map<ConfigKey, ConfigKey>;

  constructor() {
    this.configLoader = new ConfigLoader();
    this.keyToGroupMap = this.initKeyToGroupMap();
  }

  private initKeyToGroupMap(): Map<ConfigKey, ConfigKey> {
    const map = new Map<ConfigKey, ConfigKey>();
    for (const group of ENV_ONLY_GROUPS) {
      for (const targetKey of group.targetKeys) {
        map.set(targetKey, group.controlKey);
      }
    }
    return map;
  }

  async loadConfigs(options?: { source?: ConfigSource }): Promise<void> {
    if (options?.source === 'env') {
      this.envConfig = await this.configLoader.loadFromEnv();
    }
    else if (options?.source === 'db') {
      this.dbConfig = await this.configLoader.loadFromDB();
    }
    else {
      this.envConfig = await this.configLoader.loadFromEnv();
      this.dbConfig = await this.configLoader.loadFromDB();
    }

    this.lastLoadedAt = new Date();
  }

  getConfig<K extends ConfigKey>(key: K): ConfigValues[K] {
    if (!this.envConfig || !this.dbConfig) {
      throw new Error('Config is not loaded');
    }

    if (this.shouldUseEnvOnly(key)) {
      return this.envConfig[key] as ConfigValues[K];
    }

    return (this.dbConfig[key] ?? this.envConfig[key]) as ConfigValues[K];
  }

  private shouldUseEnvOnly(key: ConfigKey): boolean {
    const controlKey = this.keyToGroupMap.get(key);
    if (!controlKey) {
      return false;
    }
    return this.getConfig(controlKey) === true;
  }

  async updateConfig<K extends ConfigKey>(key: K, value: ConfigValues[K], options?: UpdateConfigOptions): Promise<void> {
    // Dynamic import to avoid loading database modules too early
    const { Config } = await import('../../models/config');

    await Config.updateOne(
      { key },
      { value: JSON.stringify(value) },
      { upsert: true },
    );

    await this.loadConfigs({ source: 'db' });

    if (!options?.skipPubsub) {
      await this.publishUpdateMessage();
    }
  }

  async updateConfigs(updates: Partial<{ [K in ConfigKey]: ConfigValues[K] }>, options?: UpdateConfigOptions): Promise<void> {
    // Dynamic import to avoid loading database modules too early
    const { Config } = await import('../../models/config');

    const operations = Object.entries(updates).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { value: JSON.stringify(value) },
        upsert: true,
      },
    }));

    await Config.bulkWrite(operations);
    await this.loadConfigs({ source: 'db' });

    if (!options?.skipPubsub) {
      await this.publishUpdateMessage();
    }
  }

  async removeConfigs(keys: ConfigKey[], options?: UpdateConfigOptions): Promise<void> {
    // Dynamic import to avoid loading database modules too early
    const { Config } = await import('../../models/config');

    const operations = keys.map(key => ({
      deleteOne: {
        filter: { key },
      },
    }));

    await Config.bulkWrite(operations);
    await this.loadConfigs({ source: 'db' });

    if (!options?.skipPubsub) {
      await this.publishUpdateMessage();
    }
  }

  getRawConfigData(): {
    env: Record<ConfigKey, ConfigValues[ConfigKey]>;
    db: Record<ConfigKey, ConfigValues[ConfigKey] | null>;
    } {
    if (!this.envConfig || !this.dbConfig) {
      throw new Error('Config is not loaded');
    }

    return {
      env: this.envConfig,
      db: this.dbConfig,
    };
  }

  /**
   * Set S2sMessagingServiceDelegator instance
   * @param s2sMessagingService
   */
  setS2sMessagingService(s2sMessagingService: S2sMessagingService): void {
    this.s2sMessagingService = s2sMessagingService;
  }

  async publishUpdateMessage(): Promise<void> {
    const { default: S2sMessage } = await import('../../models/vo/s2s-message');

    const s2sMessage = new S2sMessage('configUpdated', { updatedAt: new Date() });
    try {
      await this.s2sMessagingService?.publish(s2sMessage);
    }
    catch (e) {
      logger.error('Failed to publish update message with S2sMessagingService: ', e.message);
    }
  }

  /**
   * @inheritdoc
   */
  shouldHandleS2sMessage(s2sMessage: S2sMessage): boolean {
    const { eventName } = s2sMessage;
    if (eventName !== 'configUpdated') {
      return false;
    }
    return this.lastLoadedAt == null // loaded for the first time
      || !('updatedAt' in s2sMessage) // updatedAt is not included in the message
      || (typeof s2sMessage.updatedAt === 'string' && this.lastLoadedAt < parseISO(s2sMessage.updatedAt));
  }

  /**
   * @inheritdoc
   */
  async handleS2sMessage(): Promise<void> {
    logger.info('Reload configs by pubsub notification');
    return this.loadConfigs();
  }

}

// Export singleton instance
export const configManager = new ConfigManager();
