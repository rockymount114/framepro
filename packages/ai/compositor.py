import io
from typing import Tuple
from PIL import Image, ImageDraw, ImageFilter, ImageOps

class FrameCompositor:
    """
    Renders realistic frame moulding overlays around artwork images.
    Implements lighting normalization, bevel shadow generation, and material texture application.
    """

    MATERIAL_COLORS = {
        "walnut": (92, 64, 51),
        "oak": (184, 140, 90),
        "gold": (197, 160, 89),
        "black": (25, 25, 25),
        "silver": (180, 185, 190),
        "white": (245, 245, 245)
    }

    @classmethod
    def render_framed_artwork(
        cls,
        artwork_image_bytes: bytes,
        frame_sku: str,
        material: str = "walnut",
        color: str = "walnut",
        width_mm: float = 50.0,
        mat_board_cm: float = 5.0
    ) -> bytes:
        """
        Composites artwork with a double mat board and custom frame moulding.
        Returns JPEG bytes of rendered preview.
        """
        art_img = Image.open(io.BytesIO(artwork_image_bytes)).convert("RGBA")
        
        # Ensure minimum artwork dimensions for rendering calculations
        if art_img.width < 100 or art_img.height < 100:
            art_img = art_img.resize((400, 400), Image.Resampling.LANCZOS)
        
        # Scale artwork to manageable working canvas
        max_dim = 1000
        art_img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        art_w, art_h = art_img.size

        # Calculate mat board and frame thickness in pixels
        scale_factor = art_w / 400.0  # reference baseline
        mat_px = int(mat_board_cm * 8 * scale_factor)
        frame_px = max(16, int((width_mm / 10.0) * 8 * scale_factor))

        # Base canvas dimensions
        canvas_w = art_w + (mat_px + frame_px) * 2
        canvas_h = art_h + (mat_px + frame_px) * 2

        canvas = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))

        # Mat Board (Off-white silk texture look with subtle inner bevel shadow)
        mat_left = frame_px
        mat_top = frame_px
        mat_w = art_w + mat_px * 2
        mat_h = art_h + mat_px * 2
        
        mat_draw = ImageDraw.Draw(canvas)
        mat_draw.rectangle([mat_left, mat_top, mat_left + mat_w, mat_top + mat_h], fill=(250, 248, 245, 255))
        
        # Inner mat bevel shadow
        bevel_box = [mat_left + mat_px - 2, mat_top + mat_px - 2, mat_left + mat_px + art_w + 2, mat_top + mat_px + art_h + 2]
        mat_draw.rectangle(bevel_box, fill=(210, 205, 198, 255))

        # Paste Artwork
        art_pos = (mat_left + mat_px, mat_top + mat_px)
        canvas.paste(art_img, art_pos, mask=art_img if art_img.mode == 'RGBA' else None)

        # Draw Frame Moulding Border
        base_rgb = cls.MATERIAL_COLORS.get(color.lower(), cls.MATERIAL_COLORS.get(material.lower(), (92, 64, 51)))
        
        frame_draw = ImageDraw.Draw(canvas)
        
        # Outer frame rects with gradient/bevel lighting
        # Top moulding bar
        frame_draw.rectangle([0, 0, canvas_w, frame_px], fill=base_rgb)
        # Bottom moulding bar
        frame_draw.rectangle([0, canvas_h - frame_px, canvas_w, canvas_h], fill=(max(0, base_rgb[0]-30), max(0, base_rgb[1]-30), max(0, base_rgb[2]-30)))
        # Left moulding bar
        frame_draw.rectangle([0, 0, frame_px, canvas_h], fill=(min(255, base_rgb[0]+20), min(255, base_rgb[1]+20), min(255, base_rgb[2]+20)))
        # Right moulding bar
        frame_draw.rectangle([canvas_w - frame_px, 0, canvas_w, canvas_h], fill=(max(0, base_rgb[0]-15), max(0, base_rgb[1]-15), max(0, base_rgb[2]-15)))

        # Gold lip accent line if gold accent material
        if "gold" in material.lower() or "gold" in color.lower() or "walnut" in material.lower():
            accent_rgb = (212, 175, 55, 255)
            frame_draw.rectangle([frame_px - 3, frame_px - 3, canvas_w - frame_px + 3, frame_px], fill=accent_rgb)
            frame_draw.rectangle([frame_px - 3, canvas_h - frame_px, canvas_w - frame_px + 3, canvas_h - frame_px + 3], fill=accent_rgb)
            frame_draw.rectangle([frame_px - 3, frame_px - 3, frame_px, canvas_h - frame_px + 3], fill=accent_rgb)
            frame_draw.rectangle([canvas_w - frame_px, frame_px - 3, canvas_w - frame_px + 3, canvas_h - frame_px + 3], fill=accent_rgb)

        # Miter corner lines
        frame_draw.line([(0, 0), (frame_px, frame_px)], fill=(40, 40, 40, 180), width=2)
        frame_draw.line([(canvas_w, 0), (canvas_w - frame_px, frame_px)], fill=(40, 40, 40, 180), width=2)
        frame_draw.line([(0, canvas_h), (frame_px, canvas_h - frame_px)], fill=(40, 40, 40, 180), width=2)
        frame_draw.line([(canvas_w, canvas_h), (canvas_w - frame_px, canvas_h - frame_px)], fill=(40, 40, 40, 180), width=2)

        # Final drop shadow behind frame canvas
        output = Image.new("RGB", (canvas_w, canvas_h), (255, 255, 255))
        output.paste(canvas, (0, 0))

        buffer = io.BytesIO()
        output.save(buffer, format="JPEG", quality=92)
        return buffer.getvalue()
