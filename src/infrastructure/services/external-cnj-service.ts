import axios, { AxiosInstance } from "axios";
import { ExternalCNJService } from "@domain/interfaces/services";
import { Logger } from "@shared/logger";

export class HttpExternalCNJService implements ExternalCNJService {
  private readonly client: AxiosInstance;

  constructor(
    baseURL: string,
    apiKey: string,
    private readonly logger: Logger,
    private readonly maxRetries: number = 3
  ) {
    this.client = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;

        config.retryCount = config.retryCount ?? 0;

        if (
          config.retryCount >= this.maxRetries ||
          (error.response && error.response.status < 500)
        ) {
          return Promise.reject(error);
        }

        config.retryCount += 1;

        const delay = Math.pow(2, config.retryCount) * 1000;

        this.logger.info(`Retrying request to ${config.url}`, {
          attempt: config.retryCount,
          maxRetries: this.maxRetries,
          delay,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));

        return this.client(config);
      }
    );
  }

  async fetchCNJData(cnj: string): Promise<any> {
    try {
      this.logger.info("Fetching CNJ data from external API", { cnj });

      const response = await this.client.get(`/process/${cnj}`);

      this.logger.debug("Received response from external API", {
        cnj,
        statusCode: response.status,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error("External API request failed", {
          cnj,
          statusCode: error.response?.status,
          error: error.message,
        });

        const enhancedError = new Error(
          `Failed to fetch CNJ data: ${error.message}`
        );
        throw enhancedError;
      }

      this.logger.error("Unexpected error calling external API", {
        cnj,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  }
}
