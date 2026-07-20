import PyPDF2
import pandas as pd
import json

def read_pdf():
    try:
        reader = PyPDF2.PdfReader('page1_merged (3).pdf')
        text = ''
        for p in reader.pages:
            text += p.extract_text() + '\n'
        print('--- PDF CONTENT ---')
        print(text)
    except Exception as e:
        print('PDF Error:', e)

def read_xl(file):
    try:
        df = pd.read_excel(file)
        print(f'--- {file} ---')
        print(df.head(20))
    except Exception as e:
        print('XL Error:', e)

read_pdf()
read_xl('Genxiot_Alamo_Quote_Calculator.xlsx')
read_xl('Genxiot_Alamo_Quote_Calculator_2026.xlsx')
