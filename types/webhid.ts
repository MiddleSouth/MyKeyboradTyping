/**
 * WebHID API の型定義
 * @see https://wicg.github.io/webhid/
 */

/**
 * HID コレクション（Usage Page と Usage の組み合わせ）
 */
export interface HIDCollectionInfo {
  usagePage: number;
  usage: number;
  type?: number;
  children?: HIDCollectionInfo[];
  inputReports?: HIDReportInfo[];
  outputReports?: HIDReportInfo[];
  featureReports?: HIDReportInfo[];
}

/**
 * HID レポート情報
 */
export interface HIDReportInfo {
  reportId: number;
  items?: HIDReportItem[];
}

/**
 * HID レポートアイテム
 */
export interface HIDReportItem {
  isAbsolute?: boolean;
  isArray?: boolean;
  isBufferedBytes?: boolean;
  isConstant?: boolean;
  isLinear?: boolean;
  isRange?: boolean;
  isVolatile?: boolean;
  hasNull?: boolean;
  hasPreferredState?: boolean;
  wrap?: boolean;
  usages?: number[];
  usageMinimum?: number;
  usageMaximum?: number;
  reportSize?: number;
  reportCount?: number;
  unitExponent?: number;
  unitSystem?: string;
  unitFactorLengthExponent?: number;
  unitFactorMassExponent?: number;
  unitFactorTimeExponent?: number;
  unitFactorTemperatureExponent?: number;
  unitFactorCurrentExponent?: number;
  unitFactorLuminousIntensityExponent?: number;
  logicalMinimum?: number;
  logicalMaximum?: number;
  physicalMinimum?: number;
  physicalMaximum?: number;
  strings?: string[];
}

/**
 * HID 入力レポートイベント
 */
export interface HIDInputReportEvent extends Event {
  device: HIDDevice;
  reportId: number;
  data: DataView;
}

/**
 * WebHID デバイス（実際のブラウザAPI）
 */
export interface HIDDevice {
  opened: boolean;
  vendorId: number;
  productId: number;
  productName: string;
  collections: HIDCollectionInfo[];
  
  open(): Promise<void>;
  close(): Promise<void>;
  forget(): Promise<void>;
  sendReport(reportId: number, data: BufferSource): Promise<void>;
  sendFeatureReport(reportId: number, data: BufferSource): Promise<void>;
  receiveFeatureReport(reportId: number): Promise<DataView>;
  
  addEventListener(type: 'inputreport', listener: (event: HIDInputReportEvent) => void): void;
  removeEventListener(type: 'inputreport', listener: (event: HIDInputReportEvent) => void): void;
}

/**
 * HID デバイスフィルター
 */
export interface HIDDeviceFilter {
  vendorId?: number;
  productId?: number;
  usagePage?: number;
  usage?: number;
}

/**
 * HID デバイス要求オプション
 */
export interface HIDDeviceRequestOptions {
  filters: HIDDeviceFilter[];
}

/**
 * WebHID API
 */
export interface HID extends EventTarget {
  getDevices(): Promise<HIDDevice[]>;
  requestDevice(options: HIDDeviceRequestOptions): Promise<HIDDevice[]>;
  
  addEventListener(type: 'connect' | 'disconnect', listener: (event: Event) => void): void;
  removeEventListener(type: 'connect' | 'disconnect', listener: (event: Event) => void): void;
}

/**
 * Navigator に WebHID を追加
 */
declare global {
  interface Navigator {
    hid?: HID;
  }
}
