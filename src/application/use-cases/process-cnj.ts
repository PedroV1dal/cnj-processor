import { CNJ, CNJStatus } from "@domain/entities/cnj";
import { CNJRepository } from "@domain/interfaces/repositories";
import { ExternalCNJService } from "@domain/interfaces/services";
import {
  ProcessCNJRequestDTO,
  ProcessCNJResponseDTO,
} from "@application/dtos/cnj-dto";
import { Logger } from "@shared/logger";

export class ProcessCNJUseCase {
  constructor(
    private readonly cnjRepository: CNJRepository,
    private readonly externalCNJService: ExternalCNJService,
    private readonly logger: Logger
  ) {}

  async execute(request: ProcessCNJRequestDTO): Promise<ProcessCNJResponseDTO> {
    const { cnj, requestId, timestamp, messageId } = request;

    this.logger.info("Processing CNJ", { cnj, requestId, messageId });

    try {
      const cnjEntity = new CNJ({
        number: cnj,
        receivedAt: timestamp,
        status: CNJStatus.PROCESSING,
        requestId,
      });

      cnjEntity.setTTL(90);

      await this.cnjRepository.save(cnjEntity);

      this.logger.info("Calling external API for CNJ data", { cnj, requestId });
      const externalData = await this.externalCNJService.fetchCNJData(cnj);

      cnjEntity.markAsProcessed(externalData);

      await this.cnjRepository.save(cnjEntity);

      this.logger.info("CNJ processed successfully", {
        cnj,
        requestId,
        status: cnjEntity.status,
      });

      return {
        success: true,
        cnj,
        status: cnjEntity.status,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      this.logger.error("Failed to process CNJ", {
        cnj,
        requestId,
        error: errorMessage,
      });

      const cnjEntity = new CNJ({
        number: cnj,
        receivedAt: timestamp,
        status: CNJStatus.FAILED,
        error: errorMessage,
        requestId,
      });

      cnjEntity.setTTL(90);

      await this.cnjRepository.save(cnjEntity);

      return {
        success: false,
        cnj,
        status: CNJStatus.FAILED,
        error: errorMessage,
      };
    }
  }
}
