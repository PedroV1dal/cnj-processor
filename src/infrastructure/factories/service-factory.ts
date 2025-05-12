import { ExternalCNJService } from "@domain/interfaces/services";
import { HttpExternalCNJService } from "../services/external-cnj-service";
import { Logger } from "@shared/logger";

export class ServiceFactory {
  static createExternalCNJService(logger: Logger): ExternalCNJService {
    const apiUrl = process.env.EXTERNAL_API_URL ?? "";
    const apiKey = process.env.EXTERNAL_API_KEY ?? "";

    return new HttpExternalCNJService(apiUrl, apiKey, logger);
  }
}
