import sqlite3
import os
import json
from pathlib import Path
from datetime import datetime

class AWS_Mock_Engine:
    def __init__(self, root_path="Z:/AWS_LOCAL"):
        self.root_path = Path(root_path)
        self.region = "REGION_SA_EAST_1"
        self.db_path = self.root_path / "backend_cloud.db"
        
        # Ensure base structure exists
        self.base_dir = self.root_path / self.region / "SERVICES"
        self.base_dir.mkdir(parents=True, exist_ok=True)
        
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service TEXT NOT NULL,
                name TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                metadata TEXT
            )
        ''')
        conn.commit()
        conn.close()

    def create_resource(self, service, name, extra_meta=None):
        service = service.upper()
        status = "RUNNING"
        created_at = datetime.now().isoformat()
        
        # Physical path creation
        service_path = self.base_dir / service / name
        service_path.mkdir(parents=True, exist_ok=True)
        
        # Create console.md for the resource
        console_path = service_path / "console.md"
        with open(console_path, "w", encoding="utf-8") as f:
            f.write(f"# {service} Console: {name}\n\n")
            f.write(f"**Status:** {status}\n")
            f.write(f"**Created At:** {created_at}\n\n")
            f.write(f"## Resource Details\n")
            f.write(f"- Service Type: {service}\n")
            f.write(f"- Resource Name: {name}\n")
            if extra_meta:
                f.write(f"- Metadata: `{json.dumps(extra_meta)}`\n")
        
        # SQL Registration
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO resources (service, name, status, created_at, metadata) VALUES (?, ?, ?, ?, ?)",
            (service, name, status, created_at, json.dumps(extra_meta))
        )
        resource_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"DEBUG: Created {service} resource '{name}' (ID: {resource_id}) at {service_path}")
        self.update_dashboard()
        return resource_id

    def stop_resource(self, resource_id):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("UPDATE resources SET status = 'STOPPED' WHERE id = ?", (resource_id,))
        conn.commit()
        conn.close()
        self.update_dashboard()

    def get_status(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resources")
        rows = cursor.fetchall()
        conn.close()
        return rows

    def update_dashboard(self):
        resources = self.get_status()
        dashboard_path = self.root_path / "DASHBOARD_AWS.md"
        
        with open(dashboard_path, "w", encoding="utf-8") as f:
            f.write("# ☁️ AWS Offline Console Dashboard\n\n")
            f.write("## 🛠️ Main Menu\n")
            f.write("- [EC2 (Computação)](#)\n")
            f.write("- [S3 (Storage)](#)\n")
            f.write("- [Lambda (Serverless)](#)\n")
            f.write("- [IAM (Segurança)](#)\n\n")
            
            f.write("## 🚀 Active Resources\n")
            f.write("| ID | Service | Name | Status | Created At | Link |\n")
            f.write("|----|---------|------|--------|------------|------|\n")
            for r in resources:
                link = f"./{self.region}/SERVICES/{r[1]}/{r[2]}/console.md"
                f.write(f"| {r[0]} | {r[1]} | {r[2]} | {r[3]} | {r[4]} | [Manage]({link}) |\n")

if __name__ == "__main__":
    # Test execution
    engine = AWS_Mock_Engine(root_path="./AWS_LOCAL_ROOT") # Using local folder for demo
    engine.create_resource("S3", "my-private-bucket")
    engine.create_resource("EC2", "web-server-01")
    print("Dashboard updated successfully.")
