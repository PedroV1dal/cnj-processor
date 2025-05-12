import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { QueueService } from "@domain/interfaces/services";
import { Logger } from "@shared/logger";

export class SQSQueueService implements QueueService {
  private readonly client: SQSClient;
  private readonly queueUrl: string;

  constructor(
    region: string,
    queueUrl: string,
    private readonly logger: Logger
  ) {
    this.client = new SQSClient({ region });
    this.queueUrl = queueUrl;
  }

  async sendMessage(message: any): Promise<string> {
    try {
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
        MessageAttributes: {
          RequestSource: {
            DataType: "String",
            StringValue: "API",
          },
        },
      });

      const result = await this.client.send(command);
      return result.MessageId ?? "unknown";
    } catch (error) {
      this.logger.error("Failed to send message to SQS", {
        error: error instanceof Error ? error.message : "Unknown error",
        queueUrl: this.queueUrl,
      });
      throw error;
    }
  }
}
