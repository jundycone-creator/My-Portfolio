
import os
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send"
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

credentials_path = os.path.join(
    BASE_DIR,
    "gmail_credentials.json"
)

token_path = os.path.join(
    BASE_DIR,
    "gmail_token.json"
)

flow = InstalledAppFlow.from_client_secrets_file(
    credentials_path,
    SCOPES
)

credentials = flow.run_local_server(port=0)

with open(token_path, "w") as token_file:
    token_file.write(credentials.to_json())

print("Gmail authorization successful!")
print("Token saved to gmail_token.json")
