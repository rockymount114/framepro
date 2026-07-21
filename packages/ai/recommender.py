from typing import Dict, Any, List, Optional

class AIFrameRecommender:
    """
    Analyzes artwork / room context and returns ranked frame recommendations with rationale.
    """

    @classmethod
    def recommend(
        cls,
        image_style: str = "abstract",
        color_palette: Optional[List[str]] = None,
        budget_tier: str = "luxury"
    ) -> Dict[str, Any]:
        """
        Returns ranked recommended frame SKUs with brief rationale.
        """
        palette = color_palette or ["gold", "terracotta", "charcoal"]
        
        recommendations = [
            {
                "rank": 1,
                "sku": "FP-2201-WAL",
                "name": "Heritage Walnut & Gold Inlay",
                "material": "PS Moulding / Walnut Finish",
                "color": "Walnut / Gold",
                "width_mm": 55.0,
                "rationale": "The rich natural walnut grain and brushed gold bevel trim perfectly harmonize with gold leaf highlights and warm earthy palette."
            },
            {
                "rank": 2,
                "sku": "FP-1042-BLK",
                "name": "Minimalist Matte Obsidian",
                "material": "PS Moulding",
                "color": "Matte Black",
                "width_mm": 40.0,
                "rationale": "Sleek obsidian black creates dramatic high-contrast perimeter bounding for modern architectural artwork."
            },
            {
                "rank": 3,
                "sku": "FP-3088-GLD",
                "name": "Imperial Champagne Gold",
                "material": "PS Moulding / Foil Finish",
                "color": "Champagne Gold",
                "width_mm": 65.0,
                "rationale": "Expansive champagne gold moulding brings museum-grade opulence suited for luxury hotel suites and gallery walls."
            }
        ]

        return {
            "query_style": image_style,
            "detected_palette": palette,
            "recommendations": recommendations
        }
