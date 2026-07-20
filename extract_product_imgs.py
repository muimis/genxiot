"""
Extract individual product images from the components pages of the Evelabs reference PDF.
Pages 5 and 6 contain: Call Point, Pendant, Pull Cord, Room Light, Gateway, NS Software, Vision, Manager
"""
import fitz
from PIL import Image
import io, os

doc = fitz.open(r'e:\Genxiot\SAL-QTN-2024-00478 (1) (1).pdf')

# Render each page at high DPI to get clean images
mat = fitz.Matrix(3, 3)  # 216 DPI

output_dir = r'e:\Genxiot'

# Pages to crop individual product images from
pages_to_render = {
    # page_idx: [(name, (x1, y1, x2, y2)), ...]
    # These are approximate crop coords in point-space (72dpi) – scaled by 3x
    4: [  # Page 5: Components
        ('prod_call_point',   (185, 190, 430, 330)),
        ('prod_pendant',      (420, 340, 590, 500)),
        ('prod_pull_cord',    (185, 490, 360, 650)),
        ('prod_room_light',   (415, 630, 580, 790)),
    ],
    5: [  # Page 6: Gateway + Software
        ('prod_gateway',      (185, 120, 410, 270)),
        ('prod_ns_monitor',   (385, 290, 600, 430)),
        ('prod_vision',       (185, 450, 390, 600)),
        ('prod_manager',      (395, 610, 600, 760)),
    ],
    6: [  # Page 7: Smart Hospital + Dripo
        ('prod_smart_hosp',   (50,  100, 760, 400)),
        ('prod_dripo',        (80,  430, 380, 760)),
    ],
}

for page_idx, crops in pages_to_render.items():
    page = doc[page_idx]
    pix = page.get_pixmap(matrix=mat, alpha=False)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    
    # Also save the full page
    full_path = os.path.join(output_dir, f'prod_full_p{page_idx+1}.png')
    img.save(full_path, 'PNG')
    print(f'Saved full page: prod_full_p{page_idx+1}.png ({img.width}x{img.height})')
    
    scale = 3  # we rendered at 3x
    for name, (x1, y1, x2, y2) in crops:
        sx1, sy1, sx2, sy2 = x1*scale, y1*scale, x2*scale, y2*scale
        cropped = img.crop((sx1, sy1, sx2, sy2))
        path = os.path.join(output_dir, f'{name}.png')
        cropped.save(path, 'PNG')
        print(f'  Saved: {name}.png ({cropped.width}x{cropped.height})')
