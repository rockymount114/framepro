import pytest
from apps.api.app.services.quotation_service import QuotationCalculator, MOQViolationError

class MockFrameProfile:
    def __init__(self, sku="FP-2201-WAL", name="Heritage Walnut", moq=100, wholesale_price_cents=1400, retail_price_cents=2800):
        self.sku = sku
        self.name = name
        self.moq = moq
        self.wholesale_price_cents = wholesale_price_cents
        self.retail_price_cents = retail_price_cents

def test_quotation_moq_violation():
    frame = MockFrameProfile(moq=100)
    items = [{"frame_profile": frame, "quantity": 50}]
    
    with pytest.raises(MOQViolationError) as exc_info:
        QuotationCalculator.calculate_quotation(items_data=items, incoterm="FOB")
    
    assert exc_info.value.sku == "FP-2201-WAL"
    assert exc_info.value.requested == 50
    assert exc_info.value.moq == 100

def test_quotation_incoterms_calculation():
    frame = MockFrameProfile(moq=100, wholesale_price_cents=1000)
    items = [{"frame_profile": frame, "quantity": 100}]  # subtotal = 100,000 cents ($1,000)

    # FOB baseline
    fob_result = QuotationCalculator.calculate_quotation(items_data=items, incoterm="FOB", wholesale_tier="bronze", tax_rate=0.0)
    assert fob_result["subtotal_cents"] == 100000
    assert fob_result["total_cents"] == 100000

    # EXW (5% discount)
    exw_result = QuotationCalculator.calculate_quotation(items_data=items, incoterm="EXW", wholesale_tier="bronze", tax_rate=0.0)
    assert exw_result["total_cents"] == 95000

    # DDP (12% surcharge + 5% freight)
    ddp_result = QuotationCalculator.calculate_quotation(items_data=items, incoterm="DDP", wholesale_tier="bronze", tax_rate=0.0)
    assert ddp_result["total_cents"] == 117000

def test_quotation_tier_discount():
    frame = MockFrameProfile(moq=100, wholesale_price_cents=1000)
    items = [{"frame_profile": frame, "quantity": 100}]  # 100,000 cents

    # Gold tier (10% discount)
    gold_result = QuotationCalculator.calculate_quotation(items_data=items, incoterm="FOB", wholesale_tier="gold", tax_rate=0.0)
    assert gold_result["discount_cents"] == 10000
    assert gold_result["total_cents"] == 90000

def test_quotation_pdf_generation():
    frame = MockFrameProfile(sku="FP-2201-WAL", moq=100, wholesale_price_cents=1400)
    quote_data = {
        "incoterm": "FOB",
        "subtotal_cents": 140000,
        "discount_cents": 7000,
        "tax_cents": 10640,
        "total_cents": 143640,
        "items": [{"frame_profile": frame, "quantity": 100, "unit_price_cents": 1400, "line_total_cents": 140000}]
    }
    pdf_bytes = QuotationCalculator.generate_pdf_quotation(quote_data, quote_id="test-quote-123", company_name="Acme Framing")
    assert pdf_bytes.startswith(b"%PDF")
