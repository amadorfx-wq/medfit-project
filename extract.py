import os

# To ensure this runs if PyMuPDF or PyPDF2 is installed
try:
    import fitz  # PyMuPDF
    use_fitz = True
except ImportError:
    use_fitz = False
    try:
        from pypdf import PdfReader
        use_pypdf = True
    except ImportError:
        use_pypdf = False
        import PyPDF2
        use_pypdf2 = True

forms_dir = "../forms"
for filename in os.listdir(forms_dir):
    if filename.endswith(".pdf"):
        filepath = os.path.join(forms_dir, filename)
        print(f"--- {filename} ---")
        text = ""
        try:
            if use_fitz:
                doc = fitz.open(filepath)
                for page in doc:
                    text += page.get_text()
            elif use_pypdf:
                reader = PdfReader(filepath)
                for page in reader.pages:
                    text += page.extract_text()
            else:
                reader = PyPDF2.PdfReader(filepath)
                for page in reader.pages:
                    text += page.extract_text()
            print(text[:1000].replace("\n", " ") + "...\n")
        except Exception as e:
            print(f"Failed to read {filename}: {e}\n")
