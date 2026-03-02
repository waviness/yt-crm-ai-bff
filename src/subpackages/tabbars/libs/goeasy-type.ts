import {
  BadgeOptions,
  CallBackOptions,
  ConnectOptions,
  GoEasyOptions,
  MessageCallback,
} from './InterfaceTypes';
import { GWS } from './pubsub/GWS';
export default class GoEasy {
  static instance: GoEasy;
  static readonly version: string;
  static pubsub: typeof GWS;
  private static options;
  static getInstance(options: GoEasyOptions): GoEasy;
  static init(options: GoEasyOptions): void;
  static setBadge(options: BadgeOptions): void;
  static connect(connectOptions: ConnectOptions): void;
  static disconnect(options: CallBackOptions): void;
  static getConnectionStatus(): string;
  static onClickNotification(clickHandler: MessageCallback): void;
}
