from abc import ABC, abstractmethod
from typing import Dict, Any

class PaymentAdapter(ABC):
    """Base payment adapter interface"""
    
    @abstractmethod
    async def process_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a payment
        
        Args:
            payment_data: Dictionary containing payment details
                - amount: Payment amount
                - payee: Payee name
                - reference: Payment reference
                - additional fields specific to payment method
        
        Returns:
            Dictionary with payment result:
                - success: Boolean indicating success
                - transaction_id: Transaction ID from payment provider
                - message: Status message
        """
        pass
    
    @abstractmethod
    async def check_status(self, transaction_id: str) -> Dict[str, Any]:
        """
        Check payment status
        
        Args:
            transaction_id: Transaction ID to check
        
        Returns:
            Dictionary with status information:
                - status: Payment status (pending, completed, failed)
                - message: Status message
        """
        pass
    
    @abstractmethod
    async def get_balance(self) -> Dict[str, Any]:
        """
        Get account balance
        
        Returns:
            Dictionary with balance information:
                - balance: Current balance
                - currency: Currency code
        """
        pass
