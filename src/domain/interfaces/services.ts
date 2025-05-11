export interface ExternalCNJService {
  fetchCNJData(cnj: string): Promise<any>;
}

export interface QueueService {
  sendMessage(message: any): Promise<string>;
}
