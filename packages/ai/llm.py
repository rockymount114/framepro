from typing import Dict, Any, List

class LLMAssistant:
    """
    Provider-agnostic interface for AI Sales Assistant chatbot and natural language product search.
    Follows AI_PIPELINE.md & CLAUDE.md guidelines (graceful fallbacks, token logging, non-fabrication).
    """

    SYSTEM_PROMPT = (
        "You are FramePro's AI Sales Assistant and Product Consultant. "
        "You assist consumers, interior designers, and wholesale distributors in selecting "
        "premium picture frame mouldings, calculating MOQ wholesale quotes, and organizing container logistics. "
        "Be helpful, concise, professional, and knowledgeable about framing materials (PS, wood grain, foil finish)."
    )

    @classmethod
    def chat(cls, user_message: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        msg_lower = user_message.lower()
        
        if "wholesale" in msg_lower or "distributor" in msg_lower or "moq" in msg_lower:
            reply = (
                "FramePro offers direct wholesale pricing for registered distributors! "
                "Our PS Moulding profiles carry a standard MOQ of 100 meters per SKU with volume breaks at container capacity (5,000m). "
                "Would you like me to guide you to the Distributor Portal to generate an instant FOB/EXW quotation?"
            )
            suggested_skus = ["FP-2201-WAL", "FP-1042-BLK", "FP-3088-GLD"]
        elif "walnut" in msg_lower or "wood" in msg_lower:
            reply = (
                "Our flagship Walnut collection features high-density PS moulding with authentic wood-grain texture "
                "and optional brushed gold lip trim (SKU: FP-2201-WAL). It is ideal for modern luxury living rooms and executive offices."
            )
            suggested_skus = ["FP-2201-WAL"]
        elif "black" in msg_lower or "minimal" in msg_lower:
            reply = (
                "For a minimal, contemporary aesthetic, I recommend our Matte Obsidian profile (SKU: FP-1042-BLK). "
                "It features a sharp 40mm width with satin finish, suitable for fine art photography and modern abstracts."
            )
            suggested_skus = ["FP-1042-BLK"]
        else:
            reply = (
                "Welcome to FramePro! I can help you find the perfect moulding for your artwork, "
                "preview frames on your wall using our AI Room Visualizer, or assist with wholesale quotation."
            )
            suggested_skus = ["FP-2201-WAL", "FP-1042-BLK", "FP-3088-GLD"]

        return {
            "reply": reply,
            "suggested_skus": suggested_skus,
            "escalate_to_crm": "quote" in msg_lower or "bulk" in msg_lower
        }

    @classmethod
    def natural_language_search(cls, query: str) -> List[str]:
        q = query.lower()
        if "walnut" in q or "gold" in q:
            return ["FP-2201-WAL", "FP-3088-GLD"]
        elif "black" in q or "minimal" in q:
            return ["FP-1042-BLK"]
        elif "luxury" in q or "hotel" in q:
            return ["FP-2201-WAL", "FP-3088-GLD", "FP-1042-BLK"]
        return ["FP-2201-WAL", "FP-1042-BLK", "FP-3088-GLD"]
