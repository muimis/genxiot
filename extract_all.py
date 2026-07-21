import pdfplumber
import os
import json

pdf_files = [
    "SAL-QTN-2026-00004.pdf",
    "Alamo Components.pdf",
    "SAL-QTN-2026-00476.pdf",
    "SAL-QTN-2024-00478 (1) (1).pdf",
    "page1_merged (3).pdf"
]

for pdf_file in pdf_files:
    print(f"\n{'='*80}")
    print(f"FILE: {pdf_file}")
    print('='*80)
    if not os.path.exists(pdf_file):
        print(f"File not found: {pdf_file}")
        continue
    
    try:
        with pdfplumber.open(pdf_file) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    print(f"\n--- Page {i+1} ---")
                    print(text)
                    
                # Also try to extract tables
                tables = page.extract_tables()
                if tables:
                    print(f"\n--- Tables on Page {i+1} ---")
                    for ti, table in enumerate(tables):
                        print(f"Table {ti+1}:")
                        for row in table:
                            print(row)
    except Exception as e:
        print(f"Error: {e}")
