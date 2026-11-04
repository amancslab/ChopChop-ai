# 🛠️ ChopChop-ai Setup Notes: Google OAuth & Gemini BYOK

This guide outlines how to configure **Google Sign-In Authentication** and verify the **Bring-Your-Own-Key (BYOK) Gemini API key** locally or on cloud deployments.

---

## 1. Google OAuth 2.0 Client Setup

To enable Google Sign-In with real Gmail user accounts:

### Step 1: Create OAuth Credentials in Google Cloud Console
1. Navigate to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Click **Create Credentials** ➔ **OAuth client ID**.
3. Select Application type: **Web application**.
4. Set Name: `ChopChop-ai Web Auth`.
5. Under **Authorized redirect URIs**, add:
   - For Local Dev: `http://localhost:8501/`
   - For Streamlit Cloud / Hugging Face: `https://<your-app-url>/`
6. Click **Create** and copy your **Client ID** and **Client Secret**.

### Step 2: Store in Streamlit Secrets
Create `.streamlit/secrets.toml` in your project root:
```toml
[google_oauth]
client_id = "YOUR_CLIENT_ID.apps.googleusercontent.com"
client_secret = "YOUR_CLIENT_SECRET"
redirect_uri = "http://localhost:8501/"
```
*Note: In development mode, ChopChop-ai provides an instant 1-click Google Sign-In bypass so you can test immediately without creating Cloud Console credentials.*

---

## 2. Google Gemini API Key (BYOK) Verification

ChopChop-ai uses **Bring-Your-Own-Key (BYOK)** to ensure $0.00 server API costs for the host:

1. **Obtain Key**: Users generate a 100% free API key from Google AI Studio at:
   👉 [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. **Session Storage**: The key is entered into the secure settings input field (`type="password"`) and held strictly in `st.session_state["gemini_api_key"]`.
3. **Local Dev Pre-Seed (Optional)**:
   You can pre-populate the key in your terminal or `.env` file so you do not have to enter it repeatedly during testing:
   ```bash
   export GEMINI_API_KEY="AIzaSyYourSecretKeyHere..."
   # Or on Windows PowerShell:
   $env:GEMINI_API_KEY="AIzaSyYourSecretKeyHere..."
   ```

---

## 3. Verifying the Pipeline Locally

```bash
# 1. Install updated dependencies
pip install -r requirements.txt

# 2. Launch Streamlit app
streamlit run app.py
```

### Verification Checklist:
- [x] Sign in via the Google Sign-In gate.
- [x] Verify profile picture and email display in the top right header.
- [x] Verify Gemini API Key input in the sidebar settings.
- [x] Paste YouTube link and click **"🔍 Analyze & Detect Viral Moments"**.
- [x] Inspect generated viral cards with Virality Score, Title, Hook in TikTok Gold, and duration.
- [x] Click **"⚡ Chop This Clip"** to trigger the automated 9:16 crop and subtitle pipeline.
