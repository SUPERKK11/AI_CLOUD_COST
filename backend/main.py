from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from aws_scanner import scan_aws_resources
import os

# --- SECURE API KEY LOADING ---
# This loads the variables from your .env file into the environment

load_dotenv()

# Fetch the key securely
gemini_key = os.getenv("GEMINI_API_KEY")

if not gemini_key:
    raise ValueError("GEMINI_API_KEY is missing. Please check your .env file.")

genai.configure(api_key=gemini_key)


app = FastAPI(title="AWS AI Cloud Cost Detective")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    region: str = "us-east-1"

# --- AI ANALYSIS FUNCTION ---
def get_ai_cost_analysis(resources):
    # If the list is empty, don't waste an API call
    if not resources:
        return "No resources found. Your AWS account is running clean!"

    # Prepare the prompt for Gemini
    prompt = f"""
    You are an expert AWS Cloud Architect. Review the following AWS resources 
    and provide a short, bulleted report identifying potential cost savings. 
    Focus strictly on unattached volumes, stopped instances, or expensive types.
    
    Resources: {resources}
    """

    try:
        # We use gemini-1.5-flash as it is blazing fast and perfect for text analysis
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI Analysis failed: {str(e)}"
    
@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/scan")
def trigger_scan(payload: ScanRequest):
    result = scan_aws_resources(payload.region)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result