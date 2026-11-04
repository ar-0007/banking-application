
jest.mock("../src/repositories/cancellation.repository");
jest.mock("../src/repositories/transaction.repository");

const repository = require("../src/repositories/cancellation.repository");
const transactionRepository = require("../src/repositories/transaction.repository");
const cancellationService = require("../src/services/cancellation.service");
describe("Cancellation Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("create", () => {
        test("should create a cancellation request successfully", async () => {
            const transactionId = "33333333-3333-4333-8333-333333333333";
            transactionRepository.findById.mockResolvedValue({
                id: transactionId,
                transaction_status: "pending"
            });
            repository.create.mockResolvedValue({
                id: "55555555-5555-4555-8555-555555555555",
                transaction_id: transactionId,
                reason: "Customer request",
                cancellation_status: "pending"
            });
            const result = await cancellationService.create(transactionId, {
                reason: "  Customer request  "
            });
            expect(result).toBeDefined();
            expect(transactionRepository.findById).toHaveBeenCalledWith(transactionId);
            expect(repository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId,
                    reason: "Customer request"
                })
            );
        });
        test("should reject an invalid transaction UUID", async () => {
            await expect(
                cancellationService.create("invalid-id", {
                    reason: "Customer request"
                })
            ).rejects.toThrow("Invalid transaction UUID");

            expect(transactionRepository.findById).not.toHaveBeenCalled();
            expect(repository.create).not.toHaveBeenCalled();
        });
        test("should reject a missing reason", async () => {
            const transactionId = "33333333-3333-4333-8333-333333333333";

            await expect(
                cancellationService.create(transactionId, {})
            ).rejects.toThrow("reason is required");

            expect(repository.create).not.toHaveBeenCalled();
        });
        test("should reject an empty reason", async () => {
            const transactionId = "33333333-3333-4333-8333-333333333333";

            await expect(
                cancellationService.create(transactionId, {
                    reason: "   "
                })
            ).rejects.toThrow("reason is required");

            expect(repository.create).not.toHaveBeenCalled();
        });
        test("should reject a non-string reason", async () => {
            const transactionId = "33333333-3333-4333-8333-333333333333";

            await expect(
                cancellationService.create(transactionId, {
                    reason: 123
                })
            ).rejects.toThrow("reason is required");

            expect(repository.create).not.toHaveBeenCalled();
        });
        test("should reject when transaction does not exist", async () => {
            const transactionId = "33333333-3333-4333-8333-333333333333";

            transactionRepository.findById.mockResolvedValue(null);

            await expect(
                cancellationService.create(transactionId, {
                    reason: "Customer request"
                })
            ).rejects.toThrow("Transaction not found");

            expect(repository.create).not.toHaveBeenCalled();
        });
    });
    describe("list", () => {
        test("should return cancellation requests for a transaction", async () => {
            const transactionId = "33333333-3333-4333-8333-333333333333";

            const cancellations = [
                {
                    id: "55555555-5555-4555-8555-555555555555",
                    transaction_id: transactionId,
                    reason: "Customer request",
                    cancellation_status: "pending"
                }
            ];
            transactionRepository.findById.mockResolvedValue({
                id: transactionId,
                transaction_status: "pending"
            });
            repository.listForTransaction.mockResolvedValue(cancellations);
            const result = await cancellationService.list(transactionId);
            expect(result).toEqual(cancellations);
            expect(repository.listForTransaction).toHaveBeenCalledWith(transactionId);
        });
        test("should reject an invalid transaction UUID", async () => {
            await expect(
                cancellationService.list("invalid-id")
            ).rejects.toThrow("Invalid transaction UUID");

            expect(transactionRepository.findById).not.toHaveBeenCalled();
            expect(repository.listForTransaction).not.toHaveBeenCalled();
        });
        test("should reject when transaction does not exist", async () => {
            const transactionId = "33333333-3333-4333-8333-333333333333";
            transactionRepository.findById.mockResolvedValue(null);
            await expect(
                cancellationService.list(transactionId)
            ).rejects.toThrow("Transaction not found");
            expect(repository.listForTransaction).not.toHaveBeenCalled();
        });
        test("should return an empty array when no cancellations exist", async () => {
            const transactionId = "33333333-3333-4333-8333-333333333333";
            transactionRepository.findById.mockResolvedValue({
                id: transactionId,
                transaction_status: "pending"
            });
            repository.listForTransaction.mockResolvedValue([]);
            const result = await cancellationService.list(transactionId);
            expect(result).toEqual([]);
        });
    });
});
