const transactionService = require('../src/services/transaction.service');
const transactionRepository = require('../src/repositories/transaction.repository');

jest.mock('../src/repositories/transaction.repository');

describe('Transaction Service Unit Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks(); 
  });
  describe('transfer logic', () => {
    it('should successfully pass data to repository and return result', async () => {
      const transferData = {
        sender_account_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        receiver_account_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: '500.00'
      };
      const idempotencyKey = 'test-key-12345';
      const expectedTxResult = { id: 'tx_uuid_123', ...transferData, status: 'completed' };
      transactionRepository.transfer.mockResolvedValue(expectedTxResult);
      const result = await transactionService.transfer(transferData, idempotencyKey);
      expect(transactionRepository.transfer).toHaveBeenCalled();
      expect(result).toStrictEqual(expectedTxResult);
    });
    it('should throw an error if the repository rejects (e.g., Insufficient balance)', async () => {
      const transferData = { 
        sender_account_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
        receiver_account_id: '550e8400-e29b-41d4-a716-446655440000', 
        amount: '500.00'
      };
      const idempotencyKey = 'test-key-12345';
      const dbError = new Error('Insufficient balance');
      transactionRepository.transfer.mockRejectedValue(dbError);
      await expect(transactionService.transfer(transferData, idempotencyKey)).rejects.toThrow('Insufficient balance');
      expect(transactionRepository.transfer).toHaveBeenCalled();
    });

  });
});