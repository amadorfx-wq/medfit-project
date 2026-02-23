try:
    import PyPDF2
except ImportError:
    import os
    os.system("pip install PyPDF2")
    import PyPDF2

import os

pdf_dir = r"C:\Users\Life\.gemini\antigravity\MedFit App\forms"
output_file = r"C:\Users\Life\.gemini\antigravity\MedFit App\medfit-portal\pdf_texts.txt"

with open(output_file, "w", encoding="utf-8") as out:
    for filename in os.listdir(pdf_dir):
        if filename.endswith(".pdf"):
            out.write(f"--- {filename} ---\n")
            filepath = os.path.join(pdf_dir, filename)
            try:
                reader = PyPDF2.PdfReader(filepath)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                out.write(text)
                out.write("\n\n")
            except Exception as e:
                out.write(f"Error reading {filename}: {e}\n\n")

print("Extraction complete.")
