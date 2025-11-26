import pandas as pd
from io import BytesIO
from typing import List, Dict, Any

class ExportService:
    def export_to_csv(self, data: List[Dict[str, Any]]) -> BytesIO:
        """Export data to CSV"""
        if not data:
            return BytesIO(b"")
            
        df = pd.DataFrame(data)
        output = BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return output

    def export_to_excel(self, data: List[Dict[str, Any]]) -> BytesIO:
        """Export data to Excel"""
        if not data:
            return BytesIO(b"")
            
        df = pd.DataFrame(data)
        output = BytesIO()
        # Use openpyxl engine
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        output.seek(0)
        return output

export_service = ExportService()
