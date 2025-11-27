from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.payment import Payment
from app.models.fraud_alert import FraudAlert
from datetime import datetime, timedelta

class FraudDetectionService:
    async def check_payment(self, payment: Payment, db: AsyncSession):
        """Check a payment for fraud indicators"""
        alerts = []
        
        # Rule 1: High Amount
        if payment.amount > 10000:
            alerts.append({
                "severity": "high",
                "description": f"High value transaction detected: ${payment.amount}"
            })
            
        # Rule 2: Round Numbers (often suspicious)
        if payment.amount > 1000 and payment.amount % 100 == 0:
            alerts.append({
                "severity": "low",
                "description": "Round number transaction detected"
            })
            
        # Rule 3: Rapid Transactions (Velocity check)
        # Check if same vendor had transactions in last hour
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        result = await db.execute(
            select(Payment).where(
                Payment.vendor == payment.vendor,
                Payment.payment_date >= one_hour_ago,
                Payment.id != payment.id
            )
        )
        recent_payments = result.scalars().all()
        if len(recent_payments) >= 3:
            alerts.append({
                "severity": "medium",
                "description": f"High velocity: {len(recent_payments)} transactions for vendor in last hour"
            })

        # Save alerts
        for alert in alerts:
            fraud_alert = FraudAlert(
                payment_id=payment.id,
                severity=alert["severity"],
                description=alert["description"]
            )
            db.add(fraud_alert)
        
        if alerts:
            await db.commit()
            
        return alerts

fraud_service = FraudDetectionService()
