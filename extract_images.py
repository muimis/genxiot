import fitz, os

doc = fitz.open(r'e:\Genxiot\SAL-QTN-2024-00478 (1) (1).pdf')

for page_idx in range(len(doc)):
    page = doc[page_idx]
    imgs = page.get_images(full=True)
    for img_idx, img_info in enumerate(imgs):
        xref = img_info[0]
        base = doc.extract_image(xref)
        imgbytes = base['image']
        ext = base['ext']
        w = base['width']
        h = base['height']
        fname = f'e:\\Genxiot\\qtn_embed_p{page_idx+1}_img{img_idx}.{ext}'
        with open(fname, 'wb') as f:
            f.write(imgbytes)
        print(f'Extracted: qtn_embed_p{page_idx+1}_img{img_idx}.{ext} ({w}x{h}) - {len(imgbytes)} bytes')
