const withdraw = require('../src/services/transaction.service'); 
const db = require('../src/config/db');

jest.mock('../src/config/db');

describe('withdraw api test', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('transaction has been sucessfull if the amount is in the account ', async () => {
        db.getBalance.mockResolvedValue(1000);
        db.updateBalance.mockResolvedValue(true);
        
        const result = await withdraw('user123', 300);
        
        expect(result.status).toBe("Sucess");
        expect(result.newbalance).toBe(700);
        
        expect(db.getBalance).toHaveBeenCalledWith('user123'); 
        expect(db.updateBalance).toHaveBeenCalledWith('user123', 700); 
    });

    test('send error if the amount is not in the account ' , async () =>{
        db.getBalance.mockResolvedValue(100);
        
        await expect(withdraw('user123', 500)).rejects.toThrow('insuficent funds');
        expect(db.updateBalance).not.toHaveBeenCalled();
    });

    test('Error should come if the amount is negitive or zero', async () => {
        await expect(withdraw('user123', -50)).rejects.toThrow("Amount can not be in the negitive and zero )");
    });
});