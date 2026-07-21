import io
from datetime import datetime, timedelta, timezone
from typing import List, Tuple, Dict, Any, Optional
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

class MOQViolationError(Exception):
    def __init__(self, sku: str, requested: int, moq: int):
        self.sku = sku
        self.requested = requested
        self.moq = moq
        super().__init__(f"MOQ Violation for SKU {sku}: requested {requested}, minimum order quantity is {moq}")

class QuotationCalculator:
    """
    Core business logic for pricing, Incoterm calculations, MOQ validation, and wholesale discounts.
    """

    INCOTERM_MULTIPLIERS = {
        "EXW": 0.95,  # 5% discount (ex-works)
        "FOB": 1.00,  # standard base
        "DDP": 1.12   # 12% freight & duties included
    }

    TIER_DISCOUNTS = {
        "bronze": 0.0,
        "silver": 0.05,
        "gold": 0.10
    }

    @classmethod
    def calculate_quotation(
        cls,
        items_data: List[Dict[str, Any]],  # [{frame_profile, quantity}]
        incoterm: str = "FOB",
        wholesale_tier: str = "bronze",
        tax_rate: float = 0.08
    ) -> Dict[str, Any]:
        """
        Calculates itemized subtotal, Incoterm adjustments, tier discounts, tax, and total in minor cents.
        Enforces MOQ validation.
        """
        if incoterm not in cls.INCOTERM_MULTIPLIERS:
            raise ValueError(f"Invalid Incoterm: {incoterm}")

        subtotal_cents = 0
        processed_items = []

        for item in items_data:
            frame = item["frame_profile"]
            quantity = item["quantity"]

            # MOQ Validation
            if quantity < frame.moq:
                raise MOQViolationError(frame.sku, quantity, frame.moq)

            # Determine unit price (prefer wholesale if present)
            unit_price = frame.wholesale_price_cents if frame.wholesale_price_cents else frame.retail_price_cents
            line_cents = unit_price * quantity
            subtotal_cents += line_cents

            processed_items.append({
                "frame_profile": frame,
                "quantity": quantity,
                "unit_price_cents": unit_price,
                "line_total_cents": line_cents
            })

        # Apply Incoterm adjustment
        incoterm_multiplier = cls.INCOTERM_MULTIPLIERS[incoterm]
        adjusted_subtotal = int(subtotal_cents * incoterm_multiplier)

        # Apply Tier Discount
        discount_rate = cls.TIER_DISCOUNTS.get(wholesale_tier.lower(), 0.0)
        discount_cents = int(adjusted_subtotal * discount_rate)
        
        net_subtotal = adjusted_subtotal - discount_cents

        # Tax calculation
        tax_cents = int(net_subtotal * tax_rate)

        # Shipping charge for DDP
        shipping_cents = int(subtotal_cents * 0.05) if incoterm == "DDP" else 0

        total_cents = net_subtotal + tax_cents + shipping_cents

        return {
            "subtotal_cents": subtotal_cents,
            "incoterm": incoterm,
            "discount_cents": discount_cents,
            "tax_cents": tax_cents,
            "shipping_cents": shipping_cents,
            "total_cents": total_cents,
            "items": processed_items
        }

    @classmethod
    def generate_pdf_quotation(cls, quote_data: Dict[str, Any], quote_id: str, company_name: str = "Valued Distributor") -> bytes:
        """
        Generates a branded PDF quotation document adhering to FramePro luxury aesthetic.
        """
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        pdf.setTitle(f"FramePro Quotation #{quote_id[:8]}")

        width, height = letter

        # Header bar
        pdf.setFillColor(colors.HexColor("#1A1A1A"))
        pdf.rect(0, height - 80, width, 80, fill=1, stroke=0)

        # Header Title
        pdf.setFillColor(colors.HexColor("#D4AF37"))  # Gold accent
        pdf.setFont("Helvetica-Bold", 24)
        pdf.drawString(40, height - 45, "FRAMEPRO")
        
        pdf.setFillColor(colors.white)
        pdf.setFont("Helvetica", 12)
        pdf.drawRightString(width - 40, height - 45, "OFFICIAL B2B QUOTATION")

        # Quote Metadata
        pdf.setFillColor(colors.HexColor("#222222"))
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(40, height - 120, f"Quotation Ref: #{quote_id}")
        pdf.setFont("Helvetica", 10)
        pdf.drawString(40, height - 135, f"Prepared For: {company_name}")
        pdf.drawString(40, height - 150, f"Date: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}")
        pdf.drawString(40, height - 165, f"Incoterm: {quote_data['incoterm']}")

        # Table Headers
        y = height - 210
        pdf.setFillColor(colors.HexColor("#F0ECE1"))
        pdf.rect(40, y, width - 80, 24, fill=1, stroke=0)
        
        pdf.setFillColor(colors.HexColor("#1A1A1A"))
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(50, y + 7, "SKU / Description")
        pdf.drawString(250, y + 7, "Qty (m)")
        pdf.drawString(340, y + 7, "Unit Price")
        pdf.drawString(450, y + 7, "Line Total")

        y -= 25
        pdf.setFont("Helvetica", 10)
        for item in quote_data["items"]:
            frame = item["frame_profile"]
            pdf.drawString(50, y, f"{frame.sku} - {frame.name}")
            pdf.drawString(250, y, str(item["quantity"]))
            pdf.drawString(340, y, f"${item['unit_price_cents']/100:.2f}")
            pdf.drawString(450, y, f"${item['line_total_cents']/100:.2f}")
            y -= 20

        # Totals Summary
        y -= 20
        pdf.line(40, y, width - 40, y)
        y -= 20

        pdf.setFont("Helvetica", 10)
        pdf.drawString(340, y, "Subtotal:")
        pdf.drawRightString(width - 50, y, f"${quote_data['subtotal_cents']/100:.2f}")
        y -= 15

        pdf.drawString(340, y, f"Tier Discount:")
        pdf.drawRightString(width - 50, y, f"-${quote_data['discount_cents']/100:.2f}")
        y -= 15

        pdf.drawString(340, y, "Estimated Tax:")
        pdf.drawRightString(width - 50, y, f"${quote_data['tax_cents']/100:.2f}")
        y -= 20

        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(340, y, "Total (USD):")
        pdf.drawRightString(width - 50, y, f"${quote_data['total_cents']/100:.2f}")

        # Footer Terms
        pdf.setFont("Helvetica-Oblique", 9)
        pdf.setFillColor(colors.HexColor("#666666"))
        pdf.drawString(40, 40, "Terms: Valid for 30 days. Subject to FramePro B2B Terms of Supply.")

        pdf.showPage()
        pdf.save()
        return buffer.getvalue()
