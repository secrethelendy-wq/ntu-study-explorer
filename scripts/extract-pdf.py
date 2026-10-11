"""Extract a source PDF without altering the curated application dataset.
Usage: python scripts/extract-pdf.py [source.pdf] [output-directory]
Requires: pip install pdfplumber pypdf Pillow
"""
import sys, json, hashlib
from pathlib import Path
import pdfplumber
from pypdf import PdfReader

project=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]) if len(sys.argv)>1 else project/'docs/source/source.pdf'
out=Path(sys.argv[2]) if len(sys.argv)>2 else project/'work/extracted'
(out/'images').mkdir(parents=True,exist_ok=True)
reader=PdfReader(source)
texts=[];tables=[];images=[];links=[]
with pdfplumber.open(source) as pdf:
    for i,page in enumerate(pdf.pages):
        texts.append(f'=== PAGE {i+1} ===\n'+(page.extract_text() or ''))
        tables.append({'page':i+1,'tables':page.extract_tables()})
        for j,image in enumerate(reader.pages[i].images):
            filename=f'p{i+1:02d}-{j+1:02d}-{image.name}'
            (out/'images'/filename).write_bytes(image.data)
            images.append({'page':i+1,'image':j+1,'filename':filename,'sha256':hashlib.sha256(image.data).hexdigest()})
        for ref in reader.pages[i].get('/Annots',[]):
            ann=ref.get_object(); action=ann.get('/A',{})
            if action.get('/URI'): links.append({'page':i+1,'uri':str(action['/URI']),'rect':[float(x) for x in ann.get('/Rect',[])]})
(out/'pdf-text.txt').write_text('\n\n'.join(texts),encoding='utf-8')
for filename,value in [('tables.json',tables),('images.json',images),('links.json',links)]:
    (out/filename).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'pages':len(reader.pages),'images':len(images),'links':len(links)}))
