import { CNJ, CNJStatus } from "@domain/entities/cnj";
import { QueueService } from "@domain/interfaces/services";
import {
  ReceiveCNJRequestDTO,
  ReceiveCNJResponseDTO,
} from "@application/dtos/cnj-dto";
import { Logger } from "@shared/logger";

export class ReceiveCNJUseCase {
  constructor(
    private readonly queueService: QueueService,
    private readonly logger: Logger
  ) {}

  async execute(request: ReceiveCNJRequestDTO): Promise<ReceiveCNJResponseDTO> {
    const { cnj, requestId } = request;

    this.logger.info("Receiving CNJ", { cnj, requestId });

    if (!CNJ.validateFormat(cnj)) {
      this.logger.warn("Invalid CNJ format", { cnj, requestId });
      throw new Error("Formato de CNJ inválido");
    }

    const cnjEntity = new CNJ({
      number: cnj,
      receivedAt: new Date().toISOString(),
      status: CNJStatus.RECEIVED,
      requestId,
    });

    const message = {
      cnj: cnjEntity.number,
      timestamp: cnjEntity.receivedAt,
      requestId: cnjEntity.requestId,
    };

    const messageId = await this.queueService.sendMessage(message);

    this.logger.info("CNJ sent to processing queue", {
      cnj,
      requestId,
      messageId,
    });

    return {
      message: "CNJ recebido para processamento",
      id: cnj,
      status: "processing",
      trackingId: messageId,
    };
  }
}
