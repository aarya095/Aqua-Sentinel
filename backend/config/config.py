import os
from dotenv import load_dotenv

env_file_path = ".env.main"
load_dotenv(dotenv_path = env_file_path)

class Config:
    DATABASE_URL = os.getenv("DATABASE_URL")

config = Config()