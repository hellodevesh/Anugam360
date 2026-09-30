# Generates dummy certificate images with different layouts (requires Pillow). Run: python3 tests/make-fixtures.py
from PIL import Image, ImageDraw, ImageFont
import glob, textwrap, os
fp = (glob.glob('/usr/share/fonts/**/DejaVuSans.ttf', recursive=True) or [None])[0]
def make(name, lines, wrap=None):
    im = Image.new('RGB', (1400, 900), '#fbfaf3'); d = ImageDraw.Draw(im); f = ImageFont.truetype(fp, 32); y = 50
    for t in lines:
        for part in (textwrap.wrap(t, wrap) if wrap else [t]):
            d.text((60, y), part, fill='#1a1a1a', font=f); y += 52
        y += 8 if wrap else 0
    im.save(os.path.join(os.path.dirname(__file__), 'fixtures', name))
make('table.png', ['GOVERNMENT OF MADHYA PRADESH', 'SCHEDULED TRIBE CERTIFICATE', '', 'Name of Candidate    Ravi Kumar Singh', 'Date of Birth    12/03/1998', 'Certificate No    ST/MP/2019/44821', 'Date of Issue    15-03-2019', 'Issuing Authority    Tehsildar, Dindori'])
make('nextline.png', ['INCOME CERTIFICATE', '', 'Name of the Candidate', 'Meena Uikey', 'Date of Birth', '05 July 2001', 'Annual Family Income', 'Rs. 4,50,000/-'])
make('sentence.png', ['SCHEDULED TRIBE CERTIFICATE', 'This is to certify that Shri Ravi Kumar Singh, son of Shri Ram Singh, resident of Village Bajag, Tehsil Dindori, belongs to the Gond tribe which is recognised as a Scheduled Tribe. Certificate No. ST/MP/2019/44821 dated 15/03/2019.', 'Tehsildar, Dindori'], wrap=60)
make('income.png', ['INCOME CERTIFICATE', 'This is to certify that Kumari Asha Maravi daughter of Shri Bhola Maravi has an annual income of Rs. 3,20,000/- from all sources.', 'Certificate No: INC/2026/00871', 'Date: 04-01-2020', 'Valid up to: 31-03-2020'], wrap=60)
make('marksheet.png', ['UNIVERSITY OF DELHI', 'STATEMENT OF MARKS', 'Name: DEV SARATHE', 'Course: M.Sc. Biotechnology', 'Percentage: 76.0%', 'CGPA: 8.1'])
make('bank.png', ['STATE BANK OF INDIA', 'PASSBOOK', 'Account Holder Name: Lata Baiga', 'Account No: 123456789012', 'IFSC: SBIN0001234'])
