"""
Dataset Loading and Integration Service

This module provides utilities to:
1. Load datasets from HuggingFace Hub and Kaggle
2. Parse and chunk complex documents (PDFs, SEC forms, legal texts)
3. Embed and upsert data to Qdrant
4. Prepare labeled data for ML model training

Datasets integrated:
- SEC Forms (10-K, 8-K) - Benchmark/Knowledge Base
- Legal Text Classification - Risk Scorer training data
- GDPR, DPDP Act, LexGLUE - Regulatory reference
"""

import logging
from typing import List, Dict, Any, Optional, Tuple
import json
from services.qdrant_service import embed_and_upsert

logger = logging.getLogger(__name__)


class DatasetLoader:
    """Load and process datasets from various sources"""
    
    @staticmethod
    def load_from_huggingface(
        dataset_name: str,
        split: str = "train",
        max_samples: int | None = None,
    ) -> List[Dict[str, Any]]:
        """
        Load a dataset from HuggingFace Hub.
        
        Args:
            dataset_name: HuggingFace dataset identifier (e.g., "PleIAs/SEC")
            split: Dataset split ("train", "test", "validation")
            max_samples: Maximum number of samples to load
        
        Returns:
            List of dataset samples
        """
        try:
            from datasets import load_dataset
        except ImportError:
            logger.error("❌ datasets library not installed. Run: pip install datasets")
            return []
        
        try:
            logger.info(f"Loading {dataset_name} from HuggingFace...")
            if max_samples:
                dataset = load_dataset(dataset_name, split=f"{split}[:{max_samples}]", trust_remote_code=True)
            else:
                dataset = load_dataset(dataset_name, split=split, trust_remote_code=True)
            
            # Convert to list of dicts
            samples = [dict(item) for item in dataset]
            logger.info(f"✅ Loaded {len(samples)} samples from {dataset_name}")
            return samples
        except Exception as e:
            logger.error(f"❌ Error loading from HuggingFace: {e}")
            return []
    
    @staticmethod
    def parse_sec_form(form_data: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        """
        Parse a SEC Form 10-K into text and metadata.
        
        Expected fields in form_data:
        - content/text: Full form text
        - cik: Company CIK
        - company_name: Company name
        - filed_date: Filing date
        """
        text = form_data.get("content") or form_data.get("text", "")
        
        metadata = {
            "source": "SEC",
            "company": form_data.get("company_name", "Unknown"),
            "cik": form_data.get("cik", ""),
            "filing_date": form_data.get("filed_date", ""),
            "form_type": form_data.get("form_type", "10-K"),
            "category": "company_compliance",
            "jurisdiction": "US",
        }
        
        return text, metadata
    
    @staticmethod
    def parse_legal_case(case_data: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        """
        Parse a legal case from Federal Court of Australia dataset.
        
        Expected fields:
        - text/content: Case text
        - outcome: Case outcome/judgment
        - fine_amount: (optional) Penalty amount
        - violation_type: (optional) Type of violation
        """
        text = case_data.get("text") or case_data.get("content", "")
        outcome = case_data.get("outcome", "")
        
        metadata = {
            "source": "FCA",
            "outcome": outcome,
            "fine_amount": case_data.get("fine_amount"),
            "violation_type": case_data.get("violation_type", ""),
            "category": "legal_precedent",
            "jurisdiction": "Australia",
            "labeled": True,  # This is labeled data for ML
        }
        
        return text, metadata
    
    @staticmethod
    def parse_regulation(reg_data: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        """
        Parse a regulation document.
        
        Expected fields:
        - text/content: Regulation text
        - name/title: Regulation name
        - region/jurisdiction: Geographic scope
        - category: Type of regulation
        """
        text = reg_data.get("text") or reg_data.get("content") or reg_data.get("article", "")
        
        metadata = {
            "source": reg_data.get("source", "regulatory"),
            "title": reg_data.get("name") or reg_data.get("title", ""),
            "category": reg_data.get("category", "general"),
            "jurisdiction": reg_data.get("region") or reg_data.get("jurisdiction", "Global"),
            "article_number": reg_data.get("article_number", ""),
        }
        
        return text, metadata


class SECDatasetSeeder:
    """Seed Qdrant with SEC Form 10-K data as company compliance benchmark"""
    
    @staticmethod
    def seed_sec_data(
        max_companies: int = 100,
        max_documents_per_company: int = 3,
    ) -> int:
        """
        Load and seed SEC 10-K forms to Qdrant.
        
        These serve as real-world examples of how companies interpret
        and implement compliance policies.
        
        Args:
            max_companies: Max companies to include
            max_documents_per_company: Max 10-K docs per company
        
        Returns:
            Number of chunks loaded
        """
        logger.info("🔄 Seeding SEC Dataset...")
        
        try:
            # Load SEC dataset
            samples = DatasetLoader.load_from_huggingface(
                "PleIAs/SEC",
                split="train",
                max_samples=max_companies,
            )
            
            if not samples:
                logger.warning("⚠️  No SEC samples loaded")
                return 0
            
            total_chunks = 0
            for i, sample in enumerate(samples[:max_companies]):
                try:
                    text, metadata = DatasetLoader.parse_sec_form(sample)
                    
                    if not text or len(text) < 100:
                        continue
                    
                    # Upsert to Qdrant
                    chunk_ids = embed_and_upsert(
                        text=text,
                        metadata=metadata,
                        source_type="sec_form",
                    )
                    total_chunks += len(chunk_ids)
                    
                    if (i + 1) % 10 == 0:
                        logger.info(f"  Processed {i + 1} SEC forms (~{total_chunks} chunks)")
                
                except Exception as e:
                    logger.warning(f"  ⚠️  Error processing SEC form: {e}")
                    continue
            
            logger.info(f"✅ SEC Dataset: {total_chunks} chunks seeded")
            return total_chunks
        
        except Exception as e:
            logger.error(f"❌ Error seeding SEC data: {e}")
            return 0


class LegalCaseDatasetPreparer:
    """Prepare legal case dataset for Risk Scorer ML model training"""
    
    @staticmethod
    def prepare_legal_case_data(
        output_file: str = "backend/ml/legal_training_data.jsonl",
        max_samples: int = 5000,
    ) -> int:
        """
        Load legal cases and prepare for ML model training.
        
        Output format (JSONL):
        {
            "text": "Full case text...",
            "risk_level": "HIGH|MEDIUM|LOW",
            "fine_amount": 1000000,
            "violation_type": "data_privacy",
            "outcome": "Guilty - Fine imposed"
        }
        
        Args:
            output_file: Where to save training data (JSONL format)
            max_samples: Max samples to prepare
        
        Returns:
            Number of samples prepared
        """
        logger.info("🔄 Preparing Legal Case Dataset for ML...")
        
        try:
            # Load legal case dataset
            samples = DatasetLoader.load_from_huggingface(
                "amohankumar/legal-fca",  # Note: This is conceptual; actual name may differ
                split="train",
                max_samples=max_samples,
            )
            
            if not samples:
                logger.warning("⚠️  No legal case samples loaded")
                return 0
            
            # Prepare training data
            training_data = []
            for sample in samples:
                try:
                    text, metadata = DatasetLoader.parse_legal_case(sample)
                    
                    if not text or len(text) < 50:
                        continue
                    
                    # Infer risk level from outcome
                    outcome = metadata.get("outcome", "").lower()
                    if "guilty" in outcome or "liable" in outcome:
                        if metadata.get("fine_amount", 0) > 1000000:
                            risk_level = "HIGH"
                        else:
                            risk_level = "MEDIUM"
                    else:
                        risk_level = "LOW"
                    
                    training_record = {
                        "text": text[:2000],  # Truncate for ML training
                        "risk_level": risk_level,
                        "fine_amount": metadata.get("fine_amount", 0),
                        "violation_type": metadata.get("violation_type", "general"),
                        "outcome": metadata.get("outcome", ""),
                    }
                    training_data.append(training_record)
                
                except Exception as e:
                    logger.warning(f"  ⚠️  Error processing legal case: {e}")
                    continue
            
            # Save to JSONL file
            import os
            os.makedirs(os.path.dirname(output_file), exist_ok=True)
            
            with open(output_file, "w") as f:
                for record in training_data:
                    f.write(json.dumps(record) + "\n")
            
            logger.info(f"✅ Legal Dataset: {len(training_data)} samples prepared -> {output_file}")
            return len(training_data)
        
        except Exception as e:
            logger.error(f"❌ Error preparing legal case data: {e}")
            return 0


class RegulatoryDatasetSeeder:
    """Seed Qdrant with global regulatory data (GDPR, DPDP, etc.)"""
    
    # Predefined regulatory content for quick seeding
    REGULATORY_DATA = {
        "gdpr": [
            {
                "article": "Article 5",
                "title": "Principles relating to processing of personal data",
                "text": """
                Personal data shall be:
                (a) processed lawfully, fairly and in a transparent manner
                (b) collected for specified, explicit and legitimate purposes
                (c) adequate, relevant and limited to what is necessary
                (d) accurate and kept up to date
                (e) kept in a form which permits identification for no longer than necessary
                (f) processed in a manner that ensures appropriate security
                """,
                "category": "data_privacy",
                "jurisdiction": "EU",
                "source": "GDPR",
            },
            {
                "article": "Article 32",
                "title": "Security of processing",
                "text": """
                Taking into account the state of the art, the costs of implementation and the nature, 
                scope, context and purposes of processing as well as the risk of varying likelihood and 
                severity, the controller and processor shall implement appropriate technical and organisational 
                measures to ensure a level of security appropriate to the risk.
                """,
                "category": "data_privacy",
                "jurisdiction": "EU",
                "source": "GDPR",
            },
        ],
        "dpdp_act": [
            {
                "title": "Data Protection Processing Rules",
                "text": """
                India's Digital Personal Data Protection Act, 2023 (DPDP Act):
                - Applies to processing of digital personal data
                - Establishes rights of data principals
                - Defines obligations of data fiduciaries
                - Establishes penalties for violations
                """,
                "category": "data_privacy",
                "jurisdiction": "India",
                "source": "DPDP Act",
            },
        ],
    }
    
    @staticmethod
    def seed_regulatory_data() -> int:
        """
        Seed predefined regulatory data into Qdrant.
        
        Returns:
            Number of chunks seeded
        """
        logger.info("🔄 Seeding Regulatory Data...")
        
        total_chunks = 0
        
        for regulation_type, regulations in RegulatoryDatasetSeeder.REGULATORY_DATA.items():
            for reg in regulations:
                try:
                    text = reg.get("text", "")
                    metadata = {
                        "title": reg.get("title", ""),
                        "category": reg.get("category", ""),
                        "jurisdiction": reg.get("jurisdiction", ""),
                        "source": reg.get("source", ""),
                        "article": reg.get("article", ""),
                    }
                    
                    # Upsert to Qdrant
                    chunk_ids = embed_and_upsert(
                        text=text,
                        metadata=metadata,
                        source_type="regulation",
                    )
                    total_chunks += len(chunk_ids)
                
                except Exception as e:
                    logger.warning(f"⚠️  Error seeding {regulation_type}: {e}")
                    continue
        
        logger.info(f"✅ Regulatory Data: {total_chunks} chunks seeded")
        return total_chunks
    
    @staticmethod
    def seed_from_lexglue() -> int:
        """
        Load and seed LexGLUE benchmark dataset.
        
        LexGLUE is a benchmark for legal NLP with documents from
        various legal sectors (contracts, statutes, cases, etc.)
        
        Returns:
            Number of chunks seeded
        """
        logger.info("🔄 Seeding LexGLUE Benchmark Dataset...")
        
        try:
            samples = DatasetLoader.load_from_huggingface(
                "lex_glue",
                split="train",
                max_samples=500,
            )
            
            if not samples:
                logger.warning("⚠️  No LexGLUE samples loaded")
                return 0
            
            total_chunks = 0
            for sample in samples:
                try:
                    text = sample.get("text") or sample.get("content", "")
                    
                    metadata = {
                        "source": "LexGLUE",
                        "category": sample.get("category", "legal_document"),
                        "task": sample.get("task", ""),
                        "label": sample.get("label", ""),
                    }
                    
                    chunk_ids = embed_and_upsert(
                        text=text,
                        metadata=metadata,
                        source_type="legal_benchmark",
                    )
                    total_chunks += len(chunk_ids)
                
                except Exception as e:
                    logger.warning(f"⚠️  Error seeding LexGLUE sample: {e}")
                    continue
            
            logger.info(f"✅ LexGLUE: {total_chunks} chunks seeded")
            return total_chunks
        
        except Exception as e:
            logger.error(f"❌ Error seeding LexGLUE: {e}")
            return 0
