import { CNJ, CNJStatus } from "@domain/entities/cnj";

describe("CNJ Entity", () => {
  const validCNJ = "1234567-12.1234.1.12.1234";

  test("should create a valid CNJ entity", () => {
    const cnj = new CNJ({
      number: validCNJ,
      receivedAt: "2023-06-10T12:00:00Z",
      status: CNJStatus.RECEIVED,
      requestId: "req-123",
    });

    expect(cnj.number).toBe(validCNJ);
    expect(cnj.status).toBe(CNJStatus.RECEIVED);
    expect(cnj.receivedAt).toBe("2023-06-10T12:00:00Z");
  });

  test("should validate CNJ format correctly", () => {
    expect(CNJ.validateFormat(validCNJ)).toBe(true);
    expect(CNJ.validateFormat("invalid")).toBe(false);
    expect(CNJ.validateFormat("123456-12.1234.1.12.1234")).toBe(false);
  });

  test("should mark CNJ as processed", () => {
    const cnj = new CNJ({
      number: validCNJ,
      receivedAt: "2023-06-10T12:00:00Z",
      status: CNJStatus.RECEIVED,
      requestId: "req-123",
    });

    const externalData = { status: "active", court: "TJ-SP" };
    cnj.markAsProcessed(externalData);

    expect(cnj.status).toBe(CNJStatus.PROCESSED);
    expect(cnj.externalData).toEqual(externalData);
    expect(cnj.processedAt).toBeDefined();
  });

  test("should mark CNJ as failed", () => {
    const cnj = new CNJ({
      number: validCNJ,
      receivedAt: "2023-06-10T12:00:00Z",
      status: CNJStatus.RECEIVED,
      requestId: "req-123",
    });

    cnj.markAsFailed("API timeout");

    expect(cnj.status).toBe(CNJStatus.FAILED);
    expect(cnj.error).toBe("API timeout");
    expect(cnj.processedAt).toBeDefined();
  });

  test("should set TTL correctly", () => {
    const cnj = new CNJ({
      number: validCNJ,
      receivedAt: "2023-06-10T12:00:00Z",
      status: CNJStatus.RECEIVED,
      requestId: "req-123",
    });

    const now = Date.now();
    const days = 90;

    cnj.setTTL(days);

    const expectedTTL = Math.floor(now / 1000) + days * 24 * 60 * 60;

    expect(cnj.ttl).toBeGreaterThanOrEqual(expectedTTL - 1);
    expect(cnj.ttl).toBeLessThanOrEqual(expectedTTL + 1);
  });
});
