
import fitz
from pathlib import Path

pdf_path = Path("private_files/Rodolfo_Conejos_Resume.pdf")
output_folder = Path("private_files/resume_images")

output_folder.mkdir(parents=True, exist_ok=True)

pdf = fitz.open(pdf_path)

for page_number, page in enumerate(pdf, start=1):
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)

    image_path = output_folder / f"resume_page_{page_number}.jpg"
    pix.save(image_path)

    print(f"Saved: {image_path}")

pdf.close()
print("Resume conversion completed!")
