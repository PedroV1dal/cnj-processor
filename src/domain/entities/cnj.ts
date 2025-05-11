export interface CNJAttributes {
  number: string;
  receivedAt: string;
  processedAt?: string;
  status: CNJStatus;
  externalData?: any;
  error?: string;
  requestId: string;
  ttl?: number;
}

export enum CNJStatus {
  RECEIVED = "RECEIVED",
  PROCESSING = "PROCESSING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
}

export class CNJ {
  private readonly _number: string;
  private readonly _receivedAt: string;
  private _processedAt?: string;
  private _status: CNJStatus;
  private _externalData?: any;
  private _error?: string;
  private readonly _requestId: string;
  private _ttl?: number;

  constructor(attrs: CNJAttributes) {
    this._number = attrs.number;
    this._receivedAt = attrs.receivedAt;
    this._processedAt = attrs.processedAt;
    this._status = attrs.status;
    this._externalData = attrs.externalData;
    this._error = attrs.error;
    this._requestId = attrs.requestId;
    this._ttl = attrs.ttl;
  }

  get number(): string {
    return this._number;
  }

  get receivedAt(): string {
    return this._receivedAt;
  }

  get processedAt(): string | undefined {
    return this._processedAt;
  }

  get status(): CNJStatus {
    return this._status;
  }

  get externalData(): any | undefined {
    return this._externalData;
  }

  get error(): string | undefined {
    return this._error;
  }

  get requestId(): string {
    return this._requestId;
  }

  get ttl(): number | undefined {
    return this._ttl;
  }

  markAsProcessing(): void {
    this._status = CNJStatus.PROCESSING;
  }

  markAsProcessed(externalData: any): void {
    this._status = CNJStatus.PROCESSED;
    this._externalData = externalData;
    this._processedAt = new Date().toISOString();
  }

  markAsFailed(error: string): void {
    this._status = CNJStatus.FAILED;
    this._error = error;
    this._processedAt = new Date().toISOString();
  }

  setTTL(days: number): void {
    this._ttl = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
  }

  toJSON(): CNJAttributes {
    return {
      number: this._number,
      receivedAt: this._receivedAt,
      processedAt: this._processedAt,
      status: this._status,
      externalData: this._externalData,
      error: this._error,
      requestId: this._requestId,
      ttl: this._ttl,
    };
  }

  static validateFormat(cnj: string): boolean {
    const cnjRegex = /^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$/;
    return cnjRegex.test(cnj);
  }
}
