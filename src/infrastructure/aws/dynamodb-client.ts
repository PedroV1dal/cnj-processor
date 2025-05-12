import { DynamoDBClient as AWSDynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Logger } from "@shared/logger";

export class DynamoDBClient {
  private readonly client: DynamoDBDocumentClient;

  constructor(
    region: string,
    private readonly tableName: string,
    private readonly logger: Logger
  ) {
    const dynamoClient = new AWSDynamoDBClient({ region });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
  }

  async put(item: Record<string, any>): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: this.tableName,
        Item: item,
      });

      await this.client.send(command);
    } catch (error) {
      this.logger.error("Failed to put item in DynamoDB", {
        error: error instanceof Error ? error.message : "Unknown error",
        tableName: this.tableName,
      });
      throw error;
    }
  }

  async get(key: Record<string, any>): Promise<Record<string, any> | null> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: key,
      });

      const result = await this.client.send(command);
      return result.Item || null;
    } catch (error) {
      this.logger.error("Failed to get item from DynamoDB", {
        error: error instanceof Error ? error.message : "Unknown error",
        tableName: this.tableName,
        key,
      });
      throw error;
    }
  }

  async update(
    key: Record<string, any>,
    updateExpression: string,
    expressionAttributeValues: Record<string, any>
  ): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
      });

      await this.client.send(command);
    } catch (error) {
      this.logger.error("Failed to update item in DynamoDB", {
        error: error instanceof Error ? error.message : "Unknown error",
        tableName: this.tableName,
        key,
      });
      throw error;
    }
  }
}
