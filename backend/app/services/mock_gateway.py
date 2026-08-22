import uuid

class MockRefundGateway:
    @staticmethod
    def process_refund(transaction_id: str, amount: float, reason: str) -> dict:
        """
        Simulates call to a real payment gateway (Stripe/Razorpay).
        Succeeds deterministically unless:
        - The reason contains "fail" or "error" (case-insensitive).
        - The amount is exactly 999.0.
        
        Returns a dict representing gateway response.
        """
        reason_lower = reason.lower() if reason else ""
        if "fail" in reason_lower or "error" in reason_lower or amount == 999.0:
            return {
                "success": False,
                "error_code": "GATEWAY_REFUND_DECLINED",
                "error_message": "Gateway declined the refund transaction.",
                "gateway_refund_id": None,
                "raw_response": {
                    "status": "failed",
                    "error": {
                        "code": "charge_not_refundable",
                        "message": "Gateway declined refund."
                    }
                }
            }

        gateway_refund_id = f"gref_{uuid.uuid4().hex[:16]}"
        return {
            "success": True,
            "error_code": None,
            "error_message": None,
            "gateway_refund_id": gateway_refund_id,
            "raw_response": {
                "status": "succeeded",
                "id": gateway_refund_id,
                "object": "refund",
                "amount": int(amount * 100),
                "currency": "inr",
                "charge": transaction_id
            }
        }
