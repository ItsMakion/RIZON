from typing import Dict, Any
from app.integrations.base import PaymentAdapter

class MobileMoneyAdapter(PaymentAdapter):
    """Mobile money payment adapter - Mock implementation for Airtel Money and TNM Mobile"""
    
    def __init__(self, provider: str = "airtel"):
        """
        Initialize mobile money adapter
        
        Args:
            provider: Mobile money provider (airtel, tnm)
        """
        self.provider = provider.lower()
        self.provider_names = {
            "airtel": "Airtel Money",
            "tnm": "TNM Mobile Money"
        }
    
    async def process_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a mobile money payment (mock implementation)
        
        In production, this would integrate with actual mobile money APIs
        """
        # Mock successful payment
        import random
        transaction_id = f"{self.provider.upper()}-{random.randint(100000, 999999)}"
        
        provider_name = self.provider_names.get(self.provider, "Mobile Money")
        
        return {
            "success": True,
            "transaction_id": transaction_id,
            "message": f"Payment of ${payment_data['amount']} to {payment_data['payee']} processed successfully via {provider_name}",
            "provider": provider_name
        }
    
    async def check_status(self, transaction_id: str) -> Dict[str, Any]:
        """
        Check mobile money payment status (mock implementation)
        """
        # Mock status check
        return {
            "status": "completed",
            "message": f"Transaction {transaction_id} completed successfully",
            "transaction_id": transaction_id,
            "provider": self.provider_names.get(self.provider, "Mobile Money")
        }
    
    async def get_balance(self) -> Dict[str, Any]:
        """
        Get mobile money wallet balance (mock implementation)
        """
        # Mock balance
        return {
            "balance": 500000.00,
            "currency": "MWK",  # Malawian Kwacha
            "provider": self.provider_names.get(self.provider, "Mobile Money")
        }
