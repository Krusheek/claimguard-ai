import json
import base64
import os
from typing import Union, Any
from ..schemas.hospital_bill import HospitalBill
from ..schemas.insurance_policy import InsurancePolicy
from ..schemas.rejection_letter import RejectionLetter
from .prompts import BILL_EXTRACTION_PROMPT, POLICY_EXTRACTION_PROMPT, REJECTION_EXTRACTION_PROMPT

class VLMExtractor:
    def __init__(self, provider: str, api_key: str):
        self.provider = provider.lower()
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o")
        self.anthropic_model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20240620")
        
        if self.provider == 'anthropic':
            import anthropic
            self.client = anthropic.Anthropic(api_key=api_key)
        elif self.provider == 'openai':
            import openai
            self.client = openai.OpenAI(api_key=api_key)
        else:
            raise ValueError("Provider must be 'anthropic' or 'openai'")

    def _fix_mime_type(self, mime_type: str) -> str:
        if mime_type == 'application/pdf':
            return 'image/png' # Assuming upstream converted it to PNG bytes already
        return mime_type

    def _extract_anthropic(self, image_bytes: bytes, mime_type: str, system_prompt: str, schema_class: Any, tool_name: str) -> Any:
        mime_type = self._fix_mime_type(mime_type)
        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        
        schema = schema_class.model_json_schema()
        
        tool = {
            "name": tool_name,
            "description": f"Extract structured data for {tool_name}",
            "input_schema": schema
        }
        
        response = self.client.messages.create(
            model=self.anthropic_model,
            max_tokens=4096,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": mime_type,
                                "data": b64_image
                            }
                        },
                        {
                            "type": "text",
                            "text": "Extract the requested information from this document."
                        }
                    ]
                }
            ],
            tools=[tool],
            tool_choice={"type": "tool", "name": tool_name}
        )
        
        for content in response.content:
            if content.type == "tool_use" and content.name == tool_name:
                return schema_class.model_validate(content.input)
                
        raise ValueError("Tool call not found in response")

    def _extract_openai(self, image_bytes: bytes, mime_type: str, system_prompt: str, schema_class: Any) -> Any:
        mime_type = self._fix_mime_type(mime_type)
        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        
        response = self.client.beta.chat.completions.parse(
            model=self.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{b64_image}"
                            }
                        },
                        {
                            "type": "text",
                            "text": "Extract the requested information from this document."
                        }
                    ]
                }
            ],
            response_format=schema_class
        )
        
        return response.choices[0].message.parsed

    def extract_hospital_bill(self, image_bytes: bytes, mime_type: str) -> HospitalBill:
        return self._extract_anthropic(image_bytes, mime_type, BILL_EXTRACTION_PROMPT, HospitalBill, "extract_hospital_bill") if self.provider == 'anthropic' else self._extract_openai(image_bytes, mime_type, BILL_EXTRACTION_PROMPT, HospitalBill)

    def extract_insurance_policy(self, image_bytes: bytes, mime_type: str) -> InsurancePolicy:
        return self._extract_anthropic(image_bytes, mime_type, POLICY_EXTRACTION_PROMPT, InsurancePolicy, "extract_insurance_policy") if self.provider == 'anthropic' else self._extract_openai(image_bytes, mime_type, POLICY_EXTRACTION_PROMPT, InsurancePolicy)

    def extract_rejection_letter(self, image_bytes: bytes, mime_type: str) -> RejectionLetter:
        return self._extract_anthropic(image_bytes, mime_type, REJECTION_EXTRACTION_PROMPT, RejectionLetter, "extract_rejection_letter") if self.provider == 'anthropic' else self._extract_openai(image_bytes, mime_type, REJECTION_EXTRACTION_PROMPT, RejectionLetter)

    def classify_document(self, image_bytes: bytes, mime_type: str) -> str:
        mime_type = self._fix_mime_type(mime_type)
        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        
        prompt = "Classify this document as exactly one of: 'bill', 'policy', or 'rejection'. Respond with only that word."
        
        if self.provider == 'anthropic':
            response = self.client.messages.create(
                model=self.anthropic_model,
                max_tokens=100,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "image", "source": {"type": "base64", "media_type": mime_type, "data": b64_image}},
                            {"type": "text", "text": prompt}
                        ]
                    }
                ]
            )
            return response.content[0].text.strip().lower()
        else:
            response = self.client.chat.completions.create(
                model=self.openai_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64_image}"}}
                        ]
                    }
                ]
            )
            return response.choices[0].message.content.strip().lower()
