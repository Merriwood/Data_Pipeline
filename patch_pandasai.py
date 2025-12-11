import os

target_path = r"C:\Users\SDWOR\AppData\Roaming\Python\Python314\site-packages\pandasai\schemas\df_config.py"

content = """from typing import Any, List, Optional, TypedDict

from pandasai.constants import DEFAULT_CHART_DIRECTORY
from pandasai.helpers.dataframe_serializer import DataframeSerializerType
from pandasai.pydantic import BaseModel, Field, validator

from ..llm import LLM, BambooLLM, LangchainLLM


class LogServerConfig(TypedDict):
    server_url: str
    api_key: str


class Config(BaseModel):
    save_logs: bool = True
    verbose: bool = False
    enforce_privacy: bool = False
    enable_cache: bool = True
    use_error_correction_framework: bool = True
    open_charts: bool = True
    save_charts: bool = False
    save_charts_path: str = DEFAULT_CHART_DIRECTORY
    custom_whitelisted_dependencies: List[str] = []
    max_retries: int = 3
    lazy_load_connector: bool = True
    # response_parser: Optional[Any] = None
    # llm: Optional[LLM] = None
    data_viz_library: Optional[str] = ""
    # log_server: Optional[LogServerConfig] = None
    direct_sql: bool = False
    dataframe_serializer: DataframeSerializerType = DataframeSerializerType.CSV

    class Config:
        arbitrary_types_allowed = True
        extra = "allow"

    # @validator("llm", always=True)
    # def validate_llm(cls, llm) -> LLM:
    #     if not isinstance(llm, (LLM, LangchainLLM)):  # also covers llm is None
    #         return BambooLLM()
    #     return llm

Config.response_parser = None
Config.llm = None
Config.log_server = None
"""

with open(target_path, "w") as f:
    f.write(content)

print("Successfully patched df_config.py")
