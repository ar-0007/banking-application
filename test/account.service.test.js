const accountService = require('../src/services/account.service');
const accountRepository = require('../src/repositories/account.repository');
jest.mock('../src/repositories/account.repository');
describe('Account Service Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('createAccount() method', () => {
    it('should successfully create an account and return the saved data', async () => {
      const inputData = { 
        full_name: 'John Doe', 
        account_number: 'PK9988776655', 
        balance: '1000.00',
        phone_number: '+923001234567',
        email: 'john@example.com'
      };
      const expectedDbOutput = { 
        id: 'acc_123', 
        ...inputData 
      };
      accountRepository.createAccount.mockResolvedValue(expectedDbOutput);
      const result = await accountService.createAccount(inputData);
      expect(accountRepository.createAccount).toHaveBeenCalledWith(
        expect.objectContaining(inputData)
      );
      expect(result).toStrictEqual(expectedDbOutput);
    });
    it('should throw an error if the database repository fails', async () => {
      const inputData = { 
        full_name: 'Jane Doe', 
        account_number: 'PK1122334455', 
        balance: '500.00',
        phone_number: '+923009876543',
        email: 'jane@example.com'
      };
      const dbError = new Error('Database connection lost');
      accountRepository.createAccount.mockRejectedValue(dbError);
      await expect(accountService.createAccount(inputData)).rejects.toThrow('Database connection lost');
        expect(accountRepository.createAccount).toHaveBeenCalledWith(
        expect.objectContaining(inputData)
      );
    });

  });
});