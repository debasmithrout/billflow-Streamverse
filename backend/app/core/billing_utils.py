def calculate_gst_breakdown(base_amount: float, pricing_model: str = "GST_EXCLUSIVE") -> dict:
    """
    [DEPRECATED] Computes GST and Base amount breakdown depending on pricing model.
    Use TaxService.calculate_tax instead.
    """
    if pricing_model == "LEGACY":
        # GST-inclusive math (for display of old invoices)
        calculated_base = round(base_amount / 1.18, 2)
        calculated_gst = round(base_amount - calculated_base, 2)
        return {
            "base_amount": calculated_base,
            "gst_amount": calculated_gst,
            "total_amount": round(base_amount, 2),
            "gst_percentage": 18
        }
    else:
        # GST-exclusive math (for new invoices)
        calculated_gst = round(base_amount * 0.18, 2)
        calculated_total = round(base_amount + calculated_gst, 2)
        return {
            "base_amount": round(base_amount, 2),
            "gst_amount": calculated_gst,
            "total_amount": calculated_total,
            "gst_percentage": 18
        }
