import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "middy";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import cors from "@middy/http-cors";
import createHttpError from "http-errors";

import { ReceiveCNJUseCase } from "../../application/use-cases/receive-cnj";
import { SQSQueueService } from "../../infrastructure/aws/sqs-client";
import { createLogger } from "../../shared/logger";
import { createResponse } from "../serializers/response";

interface CNJRequest {
  cnj: string;
}

const logger = createLogger("receiver");
const queueService = new SQSQueueService(
  process.env.AWS_REGION ?? "us-east-1",
  process.env.SQS_QUEUE_URL ?? "",
  logger
);
const receiveCNJUseCase = new ReceiveCNJUseCase(queueService, logger);

const receiverHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info("Received API request", {
      path: event.path,
      method: event.httpMethod,
      requestId: event.requestContext.requestId,
    });

    const body = event.body ?? {};
    const cnj = (body as any).cnj;

    if (!cnj) {
      logger.warn("Missing CNJ in request", {
        requestId: event.requestContext.requestId,
      });
      throw createHttpError(400, "CNJ é obrigatório");
    }

    const result = await receiveCNJUseCase.execute({
      cnj,
      requestId: event.requestContext.requestId,
    });

    return createResponse(202, result);
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return createResponse(error.statusCode, {
        error: error.message,
      });
    }

    logger.error("Unhandled error in receiver", {
      error: error instanceof Error ? error.message : "Unknown error",
      requestId: event.requestContext?.requestId,
    });

    return createResponse(500, {
      error: "Erro interno no servidor",
      reference: event.requestContext?.requestId,
    });
  }
};

export const handler = middy(receiverHandler)
  .use(jsonBodyParser())
  .use(httpErrorHandler())
  .use(cors());
