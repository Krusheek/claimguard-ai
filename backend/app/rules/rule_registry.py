from typing import Callable, Dict, Any, List

_RULE_REGISTRY: Dict[str, Dict[str, Any]] = {}

def register_rule(name: str, description: str, tier: int, regulatory_citation: str):
    def decorator(func: Callable):
        _RULE_REGISTRY[name] = {
            "name": name,
            "description": description,
            "tier": tier,
            "regulatory_citation": regulatory_citation,
            "function": func
        }
        return func
    return decorator

def get_all_rules() -> List[Dict[str, Any]]:
    return sorted(_RULE_REGISTRY.values(), key=lambda x: x["tier"])

def get_rule(name: str) -> Callable:
    return _RULE_REGISTRY.get(name, {}).get("function")
