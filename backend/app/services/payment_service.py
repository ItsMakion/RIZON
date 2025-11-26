from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.base import PaymentAdapter
from app.integrations.bank_adapter import BankAdapter
from app.integrations.mobile_money_adapter import MobileMoneyAdapter
from app.models.payment import Payment
from app.models.audit_log import AuditLog

class PaymentService:
    """Payment processing service that routes payments to appropriate adapters"""
    
    def __init__(self):
        self.adapters: Dict[str, PaymentAdapter] = {
            "bank_transfer": BankAdapter(),
            "airtel_money": MobileMoneyAdapter(provider="airtel"),
            "tnm_mobile": MobileMoneyAdapter(provider="tnm"),
            "check": BankAdapter(bank_name="Check Processing")  # Use bank adapter for checks
        }
    
    def get_adapter(self, payment_method: str) -> PaymentAdapter:
        """Get the appropriate payment adapter for the given method"""
        adapter = self.adapters.get(payment_method)
        if not adapter:
            raise ValueError(f"Unsupported payment method: {payment_method}")
        return adapter
    
    async def process_payment(
        self,
        payment: Payment,
        db: AsyncSession,
        user_id: int
    ) -> Dict[str, Any]:
        """
        Process a payment using the appropriate adapter
        
        Args:
            payment: Payment model instance
            db: Database session
            user_id: ID of user processing the payment
        
        Returns:
            Dictionary with payment result
        """
        # Get the appropriate adapter
        adapter = self.get_adapter(payment.method)
        
        # Prepare payment data
        payment_data = {
            "amount": float(payment.amount),
            "payee": payment.payee,
            "reference": payment.reference,
            "payment_id": payment.payment_id
        }
        
        # Process payment
        result = await adapter.process_payment(payment_data)
        
        # Update payment status based on result
        if result["success"]:
            payment.status = "completed"
            from datetime import datetime
            payment.payment_date = datetime.now()
            payment.processed_by = user_id
        else:
            payment.status = "failed"
        
        # Create audit log
        audit_log = AuditLog(
            action="process_payment",
            entity_type="payment",
            entity_id=payment.id,
            user_id=user_id,
            changes={
                "transaction_id": result.get("transaction_id"),
                "status": payment.status,
                "message": result.get("message")
            }
        )
        db.add(audit_log)
        
        await db.commit()
        await db.refresh(payment)
        
        return result
    
    async def check_payment_status(
        self,
        payment: Payment,
        transaction_id: str
    ) -> Dict[str, Any]:
        """
        Check the status of a payment
        
        Args:
            payment: Payment model instance
            transaction_id: Transaction ID to check
        
        Returns:
            Dictionary with status information
        """
        adapter = self.get_adapter(payment.method)
        return await adapter.check_status(transaction_id)

# Singleton instance
payment_service = PaymentService()
