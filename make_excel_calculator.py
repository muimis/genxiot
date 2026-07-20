import xlsxwriter

def build_excel_calculator():
    wb = xlsxwriter.Workbook(r'e:\Genxiot\Genxiot_Alamo_Quote_Calculator.xlsx')

    # Formats
    fmt_title = wb.add_format({'bold': True, 'font_size': 18, 'font_color': '#0F172A', 'font_name': 'Segoe UI'})
    fmt_subtitle = wb.add_format({'bold': True, 'font_size': 11, 'font_color': '#0284C7', 'font_name': 'Segoe UI'})
    fmt_tagline = wb.add_format({'italic': True, 'font_size': 9, 'font_color': '#64748B', 'font_name': 'Segoe UI'})

    fmt_section = wb.add_format({'bold': True, 'font_size': 11, 'font_color': '#FFFFFF', 'bg_color': '#0F172A', 'font_name': 'Segoe UI', 'align': 'left', 'valign': 'vcenter'})
    fmt_th = wb.add_format({'bold': True, 'font_size': 10, 'font_color': '#1E293B', 'bg_color': '#F1F5F9', 'border': 1, 'font_name': 'Segoe UI', 'align': 'center'})
    fmt_td = wb.add_format({'font_size': 9.5, 'border': 1, 'font_name': 'Segoe UI', 'valign': 'vcenter'})
    fmt_td_num = wb.add_format({'font_size': 9.5, 'border': 1, 'font_name': 'Segoe UI', 'align': 'center', 'valign': 'vcenter'})
    fmt_currency = wb.add_format({'font_size': 9.5, 'border': 1, 'font_name': 'Segoe UI', 'num_format': '₹ #,##0.00', 'align': 'right', 'valign': 'vcenter'})
    fmt_currency_bold = wb.add_format({'bold': True, 'font_size': 10, 'border': 1, 'font_name': 'Segoe UI', 'num_format': '₹ #,##0.00', 'align': 'right', 'valign': 'vcenter'})

    fmt_grand_total_label = wb.add_format({'bold': True, 'font_size': 11, 'bg_color': '#F0F9FF', 'border': 1, 'font_color': '#0369A1', 'font_name': 'Segoe UI', 'align': 'right'})
    fmt_grand_total_val = wb.add_format({'bold': True, 'font_size': 12, 'bg_color': '#F0F9FF', 'border': 1, 'font_color': '#0369A1', 'font_name': 'Segoe UI', 'num_format': '₹ #,##0.00', 'align': 'right'})

    fmt_input = wb.add_format({'font_size': 10, 'bg_color': '#FEF08A', 'border': 1, 'font_name': 'Segoe UI', 'align': 'left'})
    fmt_input_num = wb.add_format({'font_size': 10, 'bg_color': '#FEF08A', 'border': 1, 'font_name': 'Segoe UI', 'align': 'center'})

    ws = wb.add_worksheet('Quote Calculator')
    ws.set_column('A:A', 6)
    ws.set_column('B:B', 44)
    ws.set_column('C:C', 18)
    ws.set_column('D:D', 12)
    ws.set_column('E:E', 22)
    ws.set_column('F:F', 24)

    # Insert logo image into Excel if possible
    try:
        ws.insert_image('B2', r'e:\Genxiot\logo.png', {'x_scale': 0.35, 'y_scale': 0.35})
    except Exception as e:
        print('Logo insert note:', e)

    # Header
    ws.write('B4', 'GENXIOT LLP', fmt_title)
    ws.write('B5', 'Intelligent Healthcare & Smart IoT Solutions', fmt_subtitle)
    ws.write('B6', '6th Floor STPI Building, Technopark, Thiruvananthapuram | Ph: +91 9496557777 | info@genxiot.com', fmt_tagline)

    ws.merge_range('B8:F8', '1. HOSPITAL & DEAL INFORMATION', fmt_section)

    ws.write('B9', 'Hospital / Client Name:', fmt_td)
    ws.write('C9', 'Nims hospital tvm', fmt_input)
    ws.write('E9', 'Quotation Ref #:', fmt_td)
    ws.write('F9', 'SAL-QTN-2024-00478', fmt_input)

    ws.write('B10', 'City / Location:', fmt_td)
    ws.write('C10', 'Trivandrum, Kerala', fmt_input)
    ws.write('E10', 'Quotation Date:', fmt_td)
    ws.write('F10', '2026-07-20', fmt_input)

    ws.write('B11', 'Contact Person & Title:', fmt_td)
    ws.write('C11', 'Medical Director / BioMed Team', fmt_input)
    ws.write('E11', 'Genxiot BDM Exec:', fmt_td)
    ws.write('F11', 'Genxiot Sales Team', fmt_input)

    # Estimator Inputs
    ws.merge_range('B13:F13', '2. CAPACITY ESTIMATOR (Yellow Cells = Edit Inputs)', fmt_section)
    ws.write('B14', 'Total Patient Beds:', fmt_td)
    ws.write('C14', 134, fmt_input_num)
    ws.write('E14', 'Washroom / Toilet Units:', fmt_td)
    ws.write('F14', 99, fmt_input_num)

    ws.write('B15', 'Wards / Nursing Stations:', fmt_td)
    ws.write('C15', 8, fmt_input_num)
    ws.write('E15', 'Door Lights Total:', fmt_td)
    ws.write('F15', 39, fmt_input_num)

    # BOQ Table
    ws.merge_range('B17:F17', '3. ITEMISED BILL OF QUANTITIES (BOQ - Sample Quote Baseline)', fmt_section)

    headers = ['#', 'Item Name & Description', 'Item Code', 'Qty', 'Unit Rate (₹)', 'Total Amount (₹)']
    ws.write('A18', headers[0], fmt_th)
    ws.write('B18', headers[1], fmt_th)
    ws.write('C18', headers[2], fmt_th)
    ws.write('D18', headers[3], fmt_th)
    ws.write('E18', headers[4], fmt_th)
    ws.write('F18', headers[5], fmt_th)

    items_data = [
        (1, 'Alamo | Service and Nurse Call | Call Point', 'EVECPRJ03A0001A', 134, 2000),
        (2, 'Alamo | Pendant Button', 'EVECPRJ03A0008A', 134, 400),
        (3, 'Alamo | Pendant Stand', 'EVECPRJ03M0035A', 134, 100),
        (4, 'Alamo | Service and Nurse Call | Call Point (Wards)', 'EVECPRJ03A0001A', 99, 2000),
        (5, 'Alamo | Pullcord', 'EVECPRJ03A0003A', 99, 400),
        (6, 'Alamo|Call light V2', 'EVECPRJ03A0004B', 39, 2300),
        (7, 'Evegate Lora Gateway', 'EVECPRJ04A0001A', 8, 8500),
        (8, 'Iffalcon 32 inch / Nursing Station Display', 'EVESE0207', 8, 12500),
        (9, '|REPEATER V2|', 'EVECPRJ03A0011B', 12, 2500),
        (10, 'Shipping Charge', 'EVESHIP01', 1, 3500)
    ]

    for idx, (num, name, code, qty, rate) in enumerate(items_data):
        r = 19 + idx
        ws.write(r-1, 0, num, fmt_td_num)
        ws.write(r-1, 1, name, fmt_td)
        ws.write(r-1, 2, code, fmt_td_num)
        ws.write(r-1, 3, qty, fmt_input_num)
        ws.write(r-1, 4, rate, fmt_input_num)
        ws.write_formula(r-1, 5, f'=D{r}*E{r}', fmt_currency)

    # Totals Section
    start_boq = 19
    end_boq = 19 + len(items_data) - 1

    r_sub = end_boq + 2
    ws.write(r_sub-1, 4, 'Subtotal:', fmt_currency_bold)
    ws.write_formula(r_sub-1, 5, f'=SUM(F{start_boq}:F{end_boq})', fmt_currency_bold)

    r_disc = r_sub + 1
    ws.write(r_disc-1, 3, 'Additional Discount:', fmt_td)
    ws.write(r_disc-1, 4, 0, fmt_input_num)
    ws.write_formula(r_disc-1, 5, f'=E{r_disc}', fmt_currency)

    r_taxable = r_disc + 1
    ws.write(r_taxable-1, 4, 'Taxable Amount:', fmt_td)
    ws.write_formula(r_taxable-1, 5, f'=F{r_sub}-F{r_disc}', fmt_currency)

    r_cgst = r_taxable + 1
    ws.write(r_cgst-1, 4, 'CGST (9%):', fmt_td)
    ws.write_formula(r_cgst-1, 5, f'=F{r_taxable}*0.09', fmt_currency)

    r_sgst = r_cgst + 1
    ws.write(r_sgst-1, 4, 'SGST (9%):', fmt_td)
    ws.write_formula(r_sgst-1, 5, f'=F{r_taxable}*0.09', fmt_currency)

    r_grand = r_sgst + 1
    ws.write(r_grand-1, 4, 'Grant total (Inclusive of GST):', fmt_grand_total_label)
    ws.write_formula(r_grand-1, 5, f'=F{r_taxable}+F{r_cgst}+F{r_sgst}', fmt_grand_total_val)

    # Terms
    r_terms = r_grand + 2
    ws.merge_range(r_terms-1, 1, r_terms-1, 5, '4. COMMERCIAL TERMS & BANK DETAILS', fmt_section)

    ws.write(r_terms, 1, 'Payment Schedule:', fmt_td)
    ws.write(r_terms, 2, '50% Advance with PO, 50% Balance post-installation', fmt_td)

    ws.write(r_terms+1, 1, 'Delivery Period:', fmt_td)
    ws.write(r_terms+1, 2, '25 Days from order confirmation & advance receipt', fmt_td)

    ws.write(r_terms+2, 1, 'Warranty:', fmt_td)
    ws.write(r_terms+2, 2, '12 Months comprehensive on-site warranty by Genxiot LLP', fmt_td)

    ws.write(r_terms+3, 1, 'Bank Remittance:', fmt_td)
    ws.write(r_terms+3, 2, 'M/S GENXIOT HEALTHCARE SOLUTIONS | ICICI Bank Peroorkada | A/C: 323005000011 | IFSC: ICIC0003230', fmt_td)

    wb.close()
    print('Genxiot_Alamo_Quote_Calculator_2026.xlsx updated successfully!')

if __name__ == '__main__':
    build_excel_calculator()
