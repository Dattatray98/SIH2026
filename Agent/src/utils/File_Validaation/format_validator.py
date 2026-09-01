from pathlib import Path
import magic
import mimetypes


class FormatValidator:

    SUPPORTED_FORMATS = {
        ".tif": {
            "format": "TIFF",
            "mime": "image/tiff",
        },
        ".tiff": {
            "format": "TIFF",
            "mime": "image/tiff",
        },
        ".jpg": {
            "format": "JPEG",
            "mime": "image/jpeg",
        },
        ".jpeg": {
            "format": "JPEG",
            "mime": "image/jpeg",
        },
        ".png": {
            "format": "PNG",
            "mime": "image/png",
        },
    }

    MIME_TO_FORMAT = {
        "image/tiff": "TIFF",
        "image/jpeg": "JPEG",
        "image/png": "PNG",
    }

    def __init__(self, file):
        self.file = file

    def get_extension(self):
        return Path(self.file).suffix.lower()

    def get_declared_mime(self):
        mime_type, _ = mimetypes.guess_type(self.file)
        return mime_type

    def detect_actual_mime(self):
        mime_detector = magic.Magic(mime=True)
        return mime_detector.from_file(self.file)

    def map_mime_to_format(self, mime_type: str):
        return self.MIME_TO_FORMAT.get(mime_type, "unknown")

    def check(self):
        errors = []
        warnings = []

        # 1. Check whether the file exists
        file_path = Path(self.file)

        if not file_path.exists():
            return {
                "valid": False,
                "error": "File does not exist.",
            }

        # 2. Check whether the file is empty
        if file_path.stat().st_size == 0:
            return {
                "valid": False,
                "error": "File is empty.",
            }

        # 3. Get extension
        extension = self.get_extension()

        # 4. Check supported extension
        if extension not in self.SUPPORTED_FORMATS:
            errors.append(f"Unsupported file extension: {extension or 'none'}")

        # 5. Get MIME information
        declared_mime = self.get_declared_mime()
        actual_mime = self.detect_actual_mime()

        # 6. Convert actual MIME to internal format
        detected_format = self.map_mime_to_format(actual_mime)

        # 7. Check whether actual MIME is supported
        if actual_mime not in self.MIME_TO_FORMAT:
            errors.append(f"Unsupported file format detected: {actual_mime}")

        # 8. Check extension and actual MIME consistency
        if extension in self.SUPPORTED_FORMATS:
            expected_mime = self.SUPPORTED_FORMATS[extension]["mime"]

            if actual_mime != expected_mime:
                errors.append(
                    f"File extension does not match actual file format. "
                    f"Expected {expected_mime}, detected {actual_mime}."
                )

        # 9. Check declared MIME against actual MIME
        if declared_mime is not None and declared_mime != actual_mime:
            warnings.append(
                f"Declared MIME type ({declared_mime}) "
                f"differs from detected MIME type ({actual_mime})."
            )

        # 10. Final result
        return {
            "valid": len(errors) == 0,
            "filename": file_path.name,
            "extension": extension,
            "declared_mime": declared_mime,
            "actual_mime": actual_mime,
            "format": detected_format,
            "size_bytes": file_path.stat().st_size,
            "errors": errors,
            "warnings": warnings,
        }
