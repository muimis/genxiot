import sys

with open('e:/Genxiot/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Extract Header
header_start = html.find('        <!-- Header -->')
header_end = html.find('        <div class="qtn-parties">')
header_html = html[header_start:header_end]

# 2. Extract Footer
footer_start = html.find('        <div class="doc-footer">')
footer_end = html.find('        </div>\n      </div>\n\n    </div><!-- /printDoc -->')
if footer_end != -1:
    footer_end += len('        </div>\n')
else:
    footer_end = html.find('        </div>\n      </div>\n    </div><!-- /printDoc -->')
    footer_end += len('        </div>\n')
footer_html = html[footer_start:footer_end]

# 3. Remove Header from pageQuote
html = html[:header_start] + '        <!-- Header moved to global thead -->\n' + html[header_end:]

# 4. Remove Header from pageTerms
terms_header_start = html.find('        <div class="qtn-header" style="margin-bottom:0">')
terms_header_end = html.find('        <h3 class="doc-h3">Payment Terms')
if terms_header_start != -1 and terms_header_end != -1:
    html = html[:terms_header_start] + '        <!-- Header removed -->\n' + html[terms_header_end:]

# 5. Remove Footer from pageTerms
html = html.replace(footer_html, '        <!-- Footer moved to global tfoot -->\n')

# 6. Wrap printDoc contents
print_doc_start = html.find('    <div id="printDoc">\n')
if print_doc_start != -1:
    print_doc_start += len('    <div id="printDoc">\n')

table_start = f'''      <table style="width: 100%; border: none; border-spacing: 0;">
        <thead>
          <tr>
            <td style="padding: 0 12mm;">
              <div style="height: 12mm;"></div>
{header_html}            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 0 12mm;">
'''

table_end = f'''            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 0 12mm;">
{footer_html}              <div style="height: 12mm;"></div>
            </td>
          </tr>
        </tfoot>
      </table>
'''

print_doc_end = html.find('    </div><!-- /printDoc -->')
if print_doc_start != -1 and print_doc_end != -1:
    html = html[:print_doc_start] + table_start + html[print_doc_start:print_doc_end] + table_end + html[print_doc_end:]

with open('e:/Genxiot/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Done!')
