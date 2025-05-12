import { CNJ, CNJAttributes, CNJStatus } from "@domain/entities/cnj";
import { CNJRepository } from "@domain/interfaces/repositories";
import { DynamoDBClient } from "@infrastructure/aws/dynamodb-client";
import { Logger } from "@shared/logger";

export class DynamoDBCNJRepository implements CNJRepository {
  constructor(
    private readonly dynamoDBClient: DynamoDBClient,
    private readonly logger: Logger
  ) {}

  async save(cnj: CNJ): Promise<void> {
    try {
      const item = {
        cnj: cnj.number,
        receivedAt: cnj.receivedAt,
        processedAt: cnj.processedAt,
        status: cnj.status,
        externalData: cnj.externalData,
        error: cnj.error,
        requestId: cnj.requestId,
        ttl: cnj.ttl,
      };

      await this.dynamoDBClient.put(item);

      this.logger.debug("CNJ saved to DynamoDB", {
        cnj: cnj.number,
        status: cnj.status,
      });
    } catch (error) {
      this.logger.error("Failed to save CNJ to DynamoDB", {
        cnj: cnj.number,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  async findByNumber(number: string): Promise<CNJ | null> {
    try {
      const item = await this.dynamoDBClient.get({ cnj: number });

      if (!item) {
        return null;
      }

      const cnjAttributes: CNJAttributes = {
        number: item.cnj,
        receivedAt: item.receivedAt,
        processedAt: item.processedAt,
        status: item.status as CNJStatus,
        externalData: item.externalData,
        error: item.error,
        requestId: item.requestId,
        ttl: item.ttl,
      };

      return new CNJ(cnjAttributes);
    } catch (error) {
      this.logger.error("Failed to find CNJ in DynamoDB", {
        cnj: number,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  async updateStatus(
    number: string,
    status: string,
    data?: any
  ): Promise<void> {
    try {
      const updateExpression =
        "SET #status = :status, processedAt = :processedAt" +
        (data ? ", externalData = :data" : "");

      const expressionAttributeValues: Record<string, any> = {
        ":status": status,
        ":processedAt": new Date().toISOString(),
      };

      if (data) {
        expressionAttributeValues[":data"] = data;
      }

      await this.dynamoDBClient.update(
        { cnj: number },
        updateExpression,
        expressionAttributeValues
      );

      this.logger.debug("CNJ status updated in DynamoDB", {
        cnj: number,
        status,
      });
    } catch (error) {
      this.logger.error("Failed to update CNJ status in DynamoDB", {
        cnj: number,
        status,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}
