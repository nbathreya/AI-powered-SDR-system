"""
Performance benchmarks for AI-SDR System
Run: python benchmark.py --output benchmarks/results.json
"""
import time
import asyncio
import statistics
from typing import List, Dict, Any
from pathlib import Path
import json
import argparse
from datetime import datetime
import sys
import os

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from app.database import SessionLocal, init_db
from app.models import Lead
from app.schemas import LeadCreate
from sqlalchemy import text

class PerformanceBenchmark:
    def __init__(self):
        self.results = {}
        init_db()
        
    def timed(self, func, iterations=10):
        """Time a function over multiple iterations"""
        times = []
        for _ in range(iterations):
            start = time.perf_counter()
            func()
            times.append(time.perf_counter() - start)
        return {
            "mean": statistics.mean(times),
            "median": statistics.median(times),
            "min": min(times),
            "max": max(times),
            "std": statistics.stdev(times) if len(times) > 1 else 0,
            "iterations": iterations
        }
    
    def benchmark_database_inserts(self, n=1000):
        """Benchmark lead insertion"""
        print(f"Benchmarking {n} database inserts...")
        
        db = SessionLocal()
        try:
            def insert_batch():
                leads = [
                    Lead(
                        first_name=f"Test{i}",
                        last_name="User",
                        email=f"test{i}@example.com",
                        company="Acme Corp",
                        job_title="VP Sales"
                    )
                    for i in range(n)
                ]
                db.bulk_save_objects(leads)
                db.commit()
                # Cleanup
                db.execute(text("DELETE FROM leads WHERE email LIKE 'test%@example.com'"))
                db.commit()
            
            result = self.timed(insert_batch, iterations=5)
            self.results["database_inserts"] = {
                **result,
                "batch_size": n,
                "inserts_per_second": n / result["mean"]
            }
        finally:
            db.close()
    
    def benchmark_database_queries(self):
        """Benchmark common query patterns"""
        print("Benchmarking database queries...")
        
        db = SessionLocal()
        try:
            # Create test data
            test_leads = [
                Lead(
                    first_name=f"Query{i}",
                    last_name="Test",
                    email=f"query{i}@test.com",
                    company=f"Company{i % 10}",
                    score=float(i % 100)
                )
                for i in range(1000)
            ]
            db.bulk_save_objects(test_leads)
            db.commit()
            
            queries = {
                "full_scan": lambda: db.query(Lead).filter(Lead.email.like("%query%")).all(),
                "indexed_lookup": lambda: db.query(Lead).filter_by(email="query500@test.com").first(),
                "filtered_query": lambda: db.query(Lead).filter(Lead.score > 80).all(),
                "aggregation": lambda: db.query(Lead).filter(Lead.company.like("Company%")).count()
            }
            
            query_results = {}
            for name, query_func in queries.items():
                query_results[name] = self.timed(query_func, iterations=20)
            
            self.results["database_queries"] = query_results
            
            # Cleanup
            db.execute(text("DELETE FROM leads WHERE email LIKE 'query%@test.com'"))
            db.commit()
        finally:
            db.close()
    
    def benchmark_json_serialization(self):
        """Benchmark lead serialization"""
        print("Benchmarking JSON serialization...")
        
        db = SessionLocal()
        try:
            leads = db.query(Lead).limit(100).all()
            
            def serialize():
                return [
                    {
                        "id": lead.id,
                        "first_name": lead.first_name,
                        "last_name": lead.last_name,
                        "email": lead.email,
                        "company": lead.company,
                        "score": lead.score,
                        "pipeline_stage": lead.pipeline_stage
                    }
                    for lead in leads
                ]
            
            result = self.timed(serialize, iterations=100)
            self.results["json_serialization"] = {
                **result,
                "leads_serialized": len(leads),
                "leads_per_second": len(leads) / result["mean"]
            }
        finally:
            db.close()
    
    def benchmark_memory_usage(self):
        """Estimate memory footprint"""
        print("Benchmarking memory usage...")
        import sys
        
        db = SessionLocal()
        try:
            # Single lead object
            lead = Lead(
                first_name="Test",
                last_name="User",
                email="test@example.com",
                company="Acme Corp",
                job_title="VP Sales",
                score=85.0
            )
            single_lead_size = sys.getsizeof(lead.__dict__)
            
            # 1000 leads
            leads = [lead for _ in range(1000)]
            bulk_size = sys.getsizeof(leads)
            
            self.results["memory_usage"] = {
                "single_lead_bytes": single_lead_size,
                "1000_leads_bytes": bulk_size,
                "estimated_10k_leads_mb": (bulk_size * 10) / (1024 * 1024)
            }
        finally:
            db.close()
    
    def run_all(self):
        """Run all benchmarks"""
        print("=== AI-SDR Performance Benchmarks ===\n")
        
        self.benchmark_database_inserts(1000)
        self.benchmark_database_queries()
        self.benchmark_json_serialization()
        self.benchmark_memory_usage()
        
        # Add metadata
        self.results["metadata"] = {
            "timestamp": datetime.now().isoformat(),
            "python_version": sys.version,
        }
        
        return self.results
    
    def save_results(self, output_path: str):
        """Save results to JSON"""
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"\nResults saved to {output_path}")
    
    def print_summary(self):
        """Print human-readable summary"""
        print("\n=== Performance Summary ===")
        print(f"Database Inserts: {self.results['database_inserts']['inserts_per_second']:.0f} inserts/sec")
        print(f"Indexed Query: {self.results['database_queries']['indexed_lookup']['mean']*1000:.2f}ms")
        print(f"Full Scan: {self.results['database_queries']['full_scan']['mean']*1000:.2f}ms")
        print(f"JSON Serialization: {self.results['json_serialization']['leads_per_second']:.0f} leads/sec")
        print(f"Memory (10K leads): {self.results['memory_usage']['estimated_10k_leads_mb']:.2f}MB")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run AI-SDR performance benchmarks")
    parser.add_argument("--output", default="benchmarks/results.json", help="Output file path")
    args = parser.parse_args()
    
    benchmark = PerformanceBenchmark()
    benchmark.run_all()
    benchmark.print_summary()
    benchmark.save_results(args.output)
