"""
Crop exact product-only images from the rendered page images.
"""
from PIL import Image
import os

output_dir = r'e:\Genxiot'

# Page 5 (Components) - img is 1785x2526 px
p5 = Image.open(os.path.join(output_dir, 'prod_full_p5.png'))
w5, h5 = p5.size
print(f"Page 5 size: {w5}x{h5}")

# Crop just the colored boxes with product photos (no text)
crops_p5 = [
    ('prod_call_point',  (90,  530, 500, 1040)),   # green box, call point
    ('prod_pendant',     (1095, 1085, 1665, 1580)), # teal box, pendant
    ('prod_pull_cord',   (90,  1655, 500, 2185)),   # purple box, pull cord
    ('prod_room_light',  (1110, 2220, 1625, 2526)), # pink box, room light
]

for name, box in crops_p5:
    cropped = p5.crop(box)
    path = os.path.join(output_dir, f'{name}.png')
    cropped.save(path, 'PNG')
    print(f'Saved {name}.png -> {cropped.size}')

# Page 6 (Gateway + Software) - same render size
p6 = Image.open(os.path.join(output_dir, 'prod_full_p6.png'))
w6, h6 = p6.size
print(f"\nPage 6 size: {w6}x{h6}")

crops_p6 = [
    ('prod_gateway',    (90,  430,  520, 930)),    # gateway device
    ('prod_ns_monitor', (1050, 900, 1665, 1380)),  # NS monitor display
    ('prod_vision',     (90,  1390, 520, 1890)),   # vision mobile app
    ('prod_manager',    (1050, 1880, 1665, 2380)), # manager tablet
]

for name, box in crops_p6:
    cropped = p6.crop(box)
    path = os.path.join(output_dir, f'{name}.png')
    cropped.save(path, 'PNG')
    print(f'Saved {name}.png -> {cropped.size}')

# Page 7 (Smart hospital + Dripo)
p7 = Image.open(os.path.join(output_dir, 'prod_full_p7.png'))
w7, h7 = p7.size
print(f"\nPage 7 size: {w7}x{h7}")

crops_p7 = [
    ('prod_smart_hosp',  (50,  280, 1735, 1130)),   # smart hospital illustration
    ('prod_dripo',       (90,  1200, 1735, 2300)),   # dripo pink banner
]

for name, box in crops_p7:
    cropped = p7.crop(box)
    path = os.path.join(output_dir, f'{name}.png')
    cropped.save(path, 'PNG')
    print(f'Saved {name}.png -> {cropped.size}')

print("\nDone!")
