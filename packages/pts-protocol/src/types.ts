export type JsonPtsPacket = {
  Id: number;
  Type: string;
  Data?: Record<string, any> | Record<string, any>[];
  Message?: string;
  Error?: boolean;
  Code?: number;
  SetRequestType?: string;
};

export type JsonPtsEnvelope = {
  Protocol: 'jsonPTS';
  PtsId?: string;
  Packets: JsonPtsPacket[];
};

export type PtsUploadType =
  | 'UploadPumpTransaction'
  | 'UploadTankMeasurement'
  | 'UploadInTankDelivery'
  | 'UploadGpsRecord'
  | 'UploadAlertRecord'
  | 'UploadPayment'
  | 'UploadShift'
  | 'UploadConfiguration'
  | 'UploadStatus'
  | 'RequestTagsInformation';

export type TagInformation = {
  Tag: string;
  Valid: boolean;
  FuelGradeIds?: number[];
  AccountType?: 'Volume' | 'Amount';
  Balance?: number;
  Price?: number;
  OwnerName?: string;
  CompanyName?: string;
  DepartmentName?: string;
  VehicleNumber?: string;
  RegistrationNumber?: string;
  Phone?: string;
  AdditionalInfo?: string;
};