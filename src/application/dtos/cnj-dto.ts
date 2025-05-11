export interface ReceiveCNJRequestDTO {
  cnj: string;
  requestId: string;
}

export interface ReceiveCNJResponseDTO {
  message: string;
  id: string;
  status: string;
  trackingId: string;
}

export interface ProcessCNJRequestDTO {
  cnj: string;
  requestId: string;
  timestamp: string;
  messageId: string;
}

export interface ProcessCNJResponseDTO {
  success: boolean;
  cnj: string;
  status: string;
  error?: string;
}
