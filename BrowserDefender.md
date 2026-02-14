# Browser Enforcement via Microsoft Defender for Cloud Apps

This guide outlines the technical implementation for restricting access to Entra resources (e.g., Outlook, SharePoint) to authorized browsers only.

The solution uses **Microsoft Entra ID Conditional Access** to route traffic to **Microsoft Defender for Cloud Apps (Proxy)**, which then inspects the browser's `User-Agent` string to allow or block the session.

---

## 🏗️ Architecture Overview

1. **Identity Phase:** User authenticates at `login.microsoftonline.com`.
2. **Handoff Phase:** Entra ID identifies the session must be proxied.
3. **Session Phase:** Traffic is rewritten to `*.mcas.ms`.
4. **Enforcement Phase:** Defender for Cloud Apps checks if the browser's `User-Agent` contains the required secret string (e.g., `OpenFin`). If missing, access is blocked.

---

## 🛠️ Step 1: Entra ID Configuration

**To ensure your organization stays protected during this switch, follow these steps:**

1. **Deploy Templates First:** - Go to **Protection** > **Conditional Access** > **Policies**.
   - Click **+ New policy from template**.
   - Under the **Secure foundation** category, select:
     - `Require MFA for all users`
     - `Block legacy authentication`
   - Set these to **Report-only** for now.
2. **Disable Security Defaults:**
   - Go to **Entra ID** > **Overview** > **Properties** > **Manage security defaults**.
   - Set to **Disabled**.
3. **Activate Your New MFA:**
   - Immediately return to your Conditional Access policies and switch the templates you just created from **Report-only** to **On**.
   - *Tip: This replaces the "Defaults" with custom versions that you can now manage and audit.*


### 2. Create Conditional Access Policy
1. Go to **Protection** > **Conditional Access** > **Policies**.
2. **Name:** `Forward-to-Defender-Proxy`.
3. **Users:** Select target users (Ensure one Global Admin is **Excluded** for safety).
4. **Target Resources:** Select resources to be targeted, such as **Office 365**.
5. **Session:** - Check **Use Conditional Access App Control**.
   - Select **Use custom policy...** from the dropdown.
6. **Enable Policy:** Set to **On**.

---

## 🛡️ Step 2: Defender for Cloud Apps Configuration

### 1. Verify App Onboarding
1. Sign in to Outlook using any browser.
2. In the [Microsoft Defender Portal](https://security.microsoft.com), go to **Settings** > **Cloud Apps** > **Connected apps** > **Conditional Access App Control apps**.
3. Verify `Microsoft Exchange Online` appears in the list.

### 2. Create the Access Policy (The Bouncer)
1. Go to **Cloud Apps** > **Policies** > **Policy management**.
2. Select the **Conditional Access** tab.
3. Click **Create policy** > **Access policy**.
4. **Name:** `Block-Unauthorized-Browsers`.
5. **Filters:**
   - **User agent string:** **Does not contain** > `OpenFin` (your secret string).
6. **Actions:** - Select **Block**.
   - **Custom message:** `Access denied. Please use the authorized OpenFin browser.`
7. **Severity:** Set to **Medium**.
8. Click **Create**.

---

## 🧪 Step 3: Validation

### ❌ Test Unauthorized Browser (e.g., Brave/Chrome)
1. Open a **Private Window**.
2. Log in to `https://outlook.office.com`.
3. Click **Yes** on the "Stay signed in?" prompt.
4. **Expected Result:** The URL redirects to `*.mcas.ms` and displays the **Access Blocked** page.

### ✅ Test Authorized Browser (Here Enterprise Browser)
1. Log in to `https://outlook.office.com`.
2. **Expected Result:** The inbox loads normally. 
3. **Verification:** Click the address bar; the URL should contain `.mcas.ms` suffix, confirming the session is protected.

---

## 📝 Troubleshooting

| Issue | Root Cause | Fix |
| :--- | :--- | :--- |
| URL does not change | Policy in "Report-only" mode | Set Entra CA policy to **On**. |
| Brave is not blocked | User-Agent match failed | Check Defender **Activity Log** for the exact string. |
| Redirect Loop | HSTS Cache | Clear via `brave://net-internals/#hsts`. |

