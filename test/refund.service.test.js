
jest.mock("../src/repositories/refund.repository");

const repository = require("../src/repositories/refund.repository");
const refundService = require("../src/services/refund.service");
describe("Refund Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test("should create a refund request successfully", async () => {
        const transactionId = "33333333-3333-4333-8333-333333333333";
        const data = {
            amount: "100.00",
            reason: "Duplicate payment"
        };
        repository.create.mockResolvedValue({
            id: "44444444-4444-4444-8444-444444444444",
            transaction_id: transactionId,
            amount: "100.00",
            reason: "Duplicate payment",
            refund_status: "pending"
        });
        const result = await refundService.create(transactionId, data);
        expect(result).toBeDefined();
        expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId,
                amount: "100.00",
                reason: "Duplicate payment"
            })
        );
    });
    test("should reject an invalid transaction UUID", async () => {
        await expect(
            refundService.create("invalid-id", {
                amount: "100.00"
            })
        ).rejects.toThrow("Invalid transaction UUID");
        expect(repository.create).not.toHaveBeenCalled();
    });
    test("should reject an invalid refund amount", async () => {
        const transactionId = "33333333-3333-4333-8333-333333333333";
        await expect(
            refundService.create(transactionId, {
                amount: "-100.00"
            })
        ).rejects.toThrow();
        expect(repository.create).not.toHaveBeenCalled();
    });
    test("should reject a missing amount", async () => {
        const transactionId = "33333333-3333-4333-8333-333333333333";
        await expect(
            refundService.create(transactionId, {})
        ).rejects.toThrow();

        expect(repository.create).not.toHaveBeenCalled();
    });
    test("should reject a non-string reason", async () => {
        const transactionId = "33333333-3333-4333-8333-333333333333";
        await expect(
            refundService.create(transactionId, {
                amount: "100.00",
                reason: 123
            })
        ).rejects.toThrow("reason must be a string");
        expect(repository.create).not.toHaveBeenCalled();
    });
    test("should get a refund by ID", async () => {
        const refundId = "44444444-4444-4444-8444-444444444444";
        repository.findById.mockResolvedValue({
            id: refundId,
            amount: "100.00",
            refund_status: "pending"
        });
        const result = await refundService.getById(refundId);
        expect(result.id).toBe(refundId);
        expect(repository.findById).toHaveBeenCalledWith(refundId);
    });
    test("should reject an invalid refund UUID", async () => {
        await expect(
            refundService.getById("invalid-id")
        ).rejects.toThrow("Invalid refund UUID");
        expect(repository.findById).not.toHaveBeenCalled();
    });
    test("should throw an error when refund does not exist", async () => {
        const refundId = "44444444-4444-4444-8444-444444444444";
        repository.findById.mockResolvedValue(null);
        await expect(
            refundService.getById(refundId)
        ).rejects.toThrow("Refund not found");
    });
});
