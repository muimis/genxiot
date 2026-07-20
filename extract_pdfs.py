import pypdf
import glob
import sys
import codecs

sys.stdout = codecs.getwriter('utf8')(sys.stdout.detach())

pdfs = glob.glob('*QTN*.pdf') + glob.glob('*qtn*.pdf') + glob.glob('*Components*.pdf')
pdfs = list(set(pdfs))

for f in pdfs:
    try:
        r = pypdf.PdfReader(f)
        text = '\n'.join(p.extract_text() for p in r.pages)
        print('\n=== ' + f + ' ===')
        print(text)
    except Exception as e:
        print(f'Error {f}: {e}')
