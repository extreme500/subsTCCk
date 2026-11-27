"""Ajusta o .docx gerado para importar sem perdas no Word e no Google Docs.

Remove o elemento w:highlightCs (fora do esquema; o realce w:highlight continua) e as entradas
de pasta do zip. Uso: python limpar-docx.py relatorio.docx
"""
import os
import re
import sys
import zipfile

origem = sys.argv[1]
temporario = origem + '.tmp'
with zipfile.ZipFile(origem) as zi, zipfile.ZipFile(temporario, 'w', zipfile.ZIP_DEFLATED) as zo:
    for item in zi.infolist():
        if item.filename.endswith('/'):
            continue
        dados = zi.read(item.filename)
        if item.filename == 'word/document.xml':
            texto = dados.decode('utf-8')
            texto, n = re.subn(r'<w:highlightCs [^>]*/>', '', texto)
            print('highlightCs removidos:', n)
            dados = texto.encode('utf-8')
        zo.writestr(item, dados)
os.replace(temporario, origem)
