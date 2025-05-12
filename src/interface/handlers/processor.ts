import { SQSEvent, SQSRecord, Context } from "aws-lambda";

import { ProcessCNJUseCase } from "../../application/use-cases/process-cnj";
import { DynamoDBClient } from "../../infrastructure/aws/dynamodb-client";
import { DynamoDBCNJRepository } from "../../infrastructure/repositories/dynamodb-cnj-repository";
import { HttpExternalCNJService } from "../../infrastructure/services/external-cnj-service";
import { createLogger } from "../../shared/logger";

const logger = createLogger("processor");
const dynamoDBClient = new DynamoDBClient(
  process.env.AWS_REGION ?? "us-east-1",
  process.env.DYNAMODB_TABLE ?? "",
  logger
);
const cnjRepository = new DynamoDBCNJRepository(dynamoDBClient, logger);
const externalCNJService = new HttpExternalCNJService(
  process.env.EXTERNAL_API_URL ?? "",
  process.env.EXTERNAL_API_KEY ?? "",
  logger
);
const processCNJUseCase = new ProcessCNJUseCase(
  cnjRepository,
  externalCNJService,
  logger
);

async function processRecord(record: SQSRecord) {
  try {
    const message = JSON.parse(record.body);
    const { cnj, requestId, timestamp } = message;

    logger.info("Processing SQS message", {
      cnj,
      requestId,
      messageId: record.messageId,
    });

    const result = await processCNJUseCase.execute({
      cnj,
      requestId,
      timestamp,
      messageId: record.messageId,
    });

    logger.info("SQS message processed", {
      cnj,
      requestId,
      messageId: record.messageId,
      success: result.success,
    });

    return result;
  } catch (error) {
    logger.error("Failed to process SQS message", {
      messageId: record.messageId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}

export const handler = async (event: SQSEvent, context: Context) => {
  logger.info("Received SQS event", {
    recordCount: event.Records.length,
    requestId: context.awsRequestId,
  });

  const results = {
    processed: 0,
    failed: 0,
    details: [] as any[],
  };

  for (const record of event.Records) {
    try {
      const result = await processRecord(record);

      results.processed++;
      results.details.push({
        messageId: record.messageId,
        ...result,
      });
    } catch (error) {
      results.failed++;
      results.details.push({
        messageId: record.messageId,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  logger.info("SQS batch processing completed", {
    processed: results.processed,
    failed: results.failed,
    requestId: context.awsRequestId,
  });

  return results;
};
