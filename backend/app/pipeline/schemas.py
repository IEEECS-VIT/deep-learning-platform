from pydantic import BaseModel, Field
from typing import List

class Node(BaseModel):
    id: str
    type: str
    config: dict = Field(default_factory=dict)
    
class Edge(BaseModel):
    source: str
    target: str
    
class Pipeline(BaseModel):
    nodes: List[Node]
    edges: List[Edge]