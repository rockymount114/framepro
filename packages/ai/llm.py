import httpx
from typing import Dict, Any, List, Optional
from packages.config.settings import settings

class LLMAssistant:
    """
    Provider-agnostic interface for AI Sales Assistant chatbot powered by DeepSeek API with graceful fallback.
    Follows AI_PIPELINE.md & CLAUDE.md guidelines.
    """

    SYSTEM_PROMPT = (
        "You are FramePro's AI Sales Assistant and Product Consultant. "
        "You assist consumers, interior designers, and wholesale distributors in selecting "
        "premium picture frame mouldings, calculating MOQ wholesale quotes, and organizing container logistics. "
        "Be helpful, concise, professional, and knowledgeable about framing materials (PS, wood grain, foil finish)."
    )

    @classmethod
    def chat(cls, user_message: str, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        api_key = settings.DEEPSEEK_API_KEY
        
        # 1. Attempt DeepSeek API Call if key is set
        if api_key and api_key.startswith("sk-"):
            try:
                base_url = settings.DEEPSEEK_BASE_URL.rstrip("/")
                endpoint = f"{base_url}/chat/completions"
                
                messages = [{"role": "system", "content": cls.SYSTEM_PROMPT}]
                if history:
                    for h in history:
                        role = "user" if h.get("sender") == "user" else "assistant"
                        messages.append({"role": role, "content": h.get("content", "")})
                messages.append({"role": "user", "content": user_message})

                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "deepseek-chat",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 600
                }

                with httpx.Client(timeout=12.0) as client:
                    resp = client.post(endpoint, json=payload, headers=headers)
                    if resp.status_code == 200:
                        res_data = resp.json()
                        reply = res_data["choices"][0]["message"]["content"].strip()
                        suggested_skus = cls._extract_skus(reply, user_message)
                        escalate = "quote" in user_message.lower() or "bulk" in user_message.lower() or "distributor" in user_message.lower()
                        return {
                            "reply": reply,
                            "suggested_skus": suggested_skus,
                            "escalate_to_crm": escalate
                        }
            except Exception as err:
                print(f"[LLMAssistant] DeepSeek API call fallback due to: {err}")

        # 2. Rule-based Fallback
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
    def _extract_skus(cls, reply: str, query: str) -> List[str]:
        skus = []
        for sku in ["FP-2201-WAL", "FP-1042-BLK", "FP-3088-GLD"]:
            if sku in reply or sku in query.upper():
                skus.append(sku)
        return skus if skus else ["FP-2201-WAL", "FP-1042-BLK"]

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
