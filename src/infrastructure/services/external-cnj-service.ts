import axios, { AxiosInstance } from "axios";
import { ExternalCNJService } from "@domain/interfaces/services";
import { Logger } from "@shared/logger";
import { CircuitBreaker } from "../patterns/circuit-breaker";

export class HttpExternalCNJService implements ExternalCNJService {
  private readonly client: AxiosInstance;
  private readonly circuitBreaker: CircuitBreaker;

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

    this.circuitBreaker = new CircuitBreaker(3, 60000);
  }

  async fetchCNJData(cnj: string): Promise<any> {
    return this.circuitBreaker.execute(
      async () => {
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
            throw new Error(`Failed to fetch CNJ data: ${error.message}`);
          }
          throw error;
        }
      },
      async () => {
        this.logger.warn("Circuit breaker activated, using fallback data", {
          cnj,
        });
        return {
          cnj,
          status: "FALLBACK",
          message: "Dados de fallback devido a falhas no serviço externo",
          timestamp: new Date().toISOString(),
        };
      }
    );
  }
}
