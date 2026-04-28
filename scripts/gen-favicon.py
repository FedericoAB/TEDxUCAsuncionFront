"""
Genera favicon.ico, favicon-32.png, favicon-192.png y og-image.png
a partir del nanduti.svg del proyecto TEDxUC Asunción.
Crea los archivos directamente en public/.
"""

import cairosvg
from PIL import Image, ImageDraw
import io, os, pathlib

HERE  = pathlib.Path(__file__).parent
ROOT  = HERE.parent
SVG   = ROOT / "public" / "nanduti.svg"
OUT   = ROOT / "public"

# ── Color de fondo (--bg del proyecto) ───────────────────────────────────────
BG = (11, 10, 8, 255)


def render_on_dark(size: int, radius_factor: float = 0.5) -> Image.Image:
    """
    Renderiza nanduti.svg sobre un fondo circular oscuro,
    cuadrado de `size x size` px.
    """
    # 1. SVG → PNG transparente
    png_bytes = cairosvg.svg2png(
        url=str(SVG),
        output_width=size,
        output_height=size,
    )
    nanduti = Image.open(io.BytesIO(png_bytes)).convert("RGBA")

    # 2. Lienzo cuadrado con transparencia
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    # 3. Fondo circular (radio = la mitad del canvas)
    mask = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    md   = ImageDraw.Draw(mask)
    md.ellipse([0, 0, size - 1, size - 1], fill=BG)
    canvas.paste(mask, (0, 0), mask)

    # 4. Ñandutí centrado encima (ya viene centrado porque cairosvg respeta aspect ratio)
    canvas.paste(nanduti, (0, 0), nanduti)

    return canvas


def make_og_image(w=1200, h=630) -> Image.Image:
    """
    Imagen 1200×630 para og:image / Twitter card.
    Fondo oscuro, ñandutí centrado a la derecha, texto a la izquierda.
    """
    # Renderizar ñandutí a ~500px
    nanduti_size = 500
    png_bytes = cairosvg.svg2png(
        url=str(SVG),
        output_width=nanduti_size,
        output_height=nanduti_size,
    )
    nanduti = Image.open(io.BytesIO(png_bytes)).convert("RGBA")

    img = Image.new("RGBA", (w, h), BG)
    # Centrar verticalmente, posicionar a la derecha
    x = w - nanduti_size - 60
    y = (h - nanduti_size) // 2
    img.paste(nanduti, (x, y), nanduti)
    return img


# ── Generar archivos ─────────────────────────────────────────────────────────

print("Generando favicons para TEDxUC Asunción …")

# favicon.ico — contiene 16, 32 y 48 px
sizes_ico = [16, 32, 48]
frames = []
for s in sizes_ico:
    frames.append(render_on_dark(s))

ico_path = OUT / "favicon.ico"
frames[0].save(
    ico_path,
    format="ICO",
    sizes=[(s, s) for s in sizes_ico],
    append_images=frames[1:],
)
print(f"  ✓ favicon.ico  ({', '.join(str(s) for s in sizes_ico)} px)")

# favicon-32.png — para los link tags específicos de PNG
img32 = render_on_dark(32)
img32.convert("RGBA").save(OUT / "favicon-32.png", format="PNG")
print("  ✓ favicon-32.png")

# favicon-180.png — apple-touch-icon
img180 = render_on_dark(180)
img180.save(OUT / "apple-touch-icon.png", format="PNG")
print("  ✓ apple-touch-icon.png")

# favicon-192.png y 512.png — para PWA / web manifest
img192 = render_on_dark(192)
img192.save(OUT / "favicon-192.png", format="PNG")
img512 = render_on_dark(512)
img512.save(OUT / "favicon-512.png", format="PNG")
print("  ✓ favicon-192.png  ✓ favicon-512.png")

# og-image.png — para Open Graph / redes
og = make_og_image()
og.convert("RGB").save(OUT / "og-image.png", format="PNG")
print("  ✓ og-image.png  (1200×630)")

print("\nTodo listo. Archivos en public/")
