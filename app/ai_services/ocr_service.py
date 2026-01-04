import logging
from pathlib import Path
from typing import Union, List, Optional

from docling.document_converter import (
    DocumentConverter,
    PdfFormatOption,
    ImageFormatOption,
    WordFormatOption,
    PowerpointFormatOption,
    ExcelFormatOption
)
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions, RapidOcrOptions

# Setup Logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DoclingParser:
    def __init__(self, use_rapid_ocr: bool = True):
        """
        Initialize the Docling converter with multi-format support.
        """
        logger.info("Initializing DoclingParser with Multi-format support...")
        
        try:
            # 1. Setup OCR Pipeline (Used for PDF and Images)
            pipeline_options = PdfPipelineOptions()
            pipeline_options.do_ocr = True
            pipeline_options.do_table_structure = True
            
            if use_rapid_ocr:
                logger.info("OCR Backend: RapidOCR (Applied to PDF & Images)")
                pipeline_options.ocr_options = RapidOcrOptions()
            else:
                logger.info("OCR Backend: Default")

            # 2. Configure file conversion for each type
            # - PDF & Image: Use Pipeline with OCR
            # - Office Files: Use Default Parser (Read text directly, more accurate than OCR)
            format_options = {
                InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options),
                InputFormat.IMAGE: ImageFormatOption(pipeline_options=pipeline_options),
                InputFormat.DOCX: WordFormatOption(),
                InputFormat.PPTX: PowerpointFormatOption(),
                InputFormat.XLSX: ExcelFormatOption(),
            }

            # 3. Define allowed formats
            allowed_formats = [
                InputFormat.PDF,
                InputFormat.IMAGE,
                InputFormat.DOCX,
                InputFormat.PPTX,
                InputFormat.XLSX,
                InputFormat.HTML
            ]

            self.converter = DocumentConverter(
                allowed_formats=allowed_formats,
                format_options=format_options
            )
            logger.info("DoclingParser initialized. Ready to process multiple formats.")
            
        except Exception as e:
            logger.critical(f"Failed to initialize DoclingParser: {e}")
            raise e

    def process_document(self, source: Union[str, Path, List[Union[str, Path]]]) :
        """
        Process a document (PDF, DOCX, PPTX, Image, etc.) and return Markdown.
        """
        try:
            logger.info(f"Processing source: {source}")
            
            # Convert
            result = self.converter.convert(source)
            
            # Export to Markdown
            markdown_output = result.document.export_to_markdown()
            
            logger.info(f"Successfully processed document.")
            return markdown_output

        except Exception as e:
            logger.error(f"Error processing document: {e}", exc_info=True)
            return None

# --- Test Run ---
if __name__ == "__main__":
    parser = DoclingParser(use_rapid_ocr=True)
    print("Service initialized check passed.")