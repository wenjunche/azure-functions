## 🛑 File Download Blocking via Microsoft Entra & Defender

This configuration uses **Conditional Access App Control** to intercept browser sessions and apply a "Block" action when a download is initiated.

### Step 1: Create the Entra ID Conditional Access Policy

This policy identifies the session and "hands it off" to the Defender proxy.

* **Navigate to:** [Microsoft Entra Admin Center](https://entra.microsoft.com/) > **Protection** > **Conditional Access**.
* **Assignments:**
* **Users:** Include your test users/groups.
* **Target Resources:** Select the Cloud App (e.g., *Office 365* or *Salesforce*).
* **Conditions > Client Apps:** Select **Browser**.
* **Conditions > Device State:** (Optional) Filter for "Unmanaged" devices if you only want to block downloads on personal machines.


* **Access Controls > Session:**
* Check **Use Conditional Access App Control**.
* Select **Block downloads (Preview)** for a quick setup, or **Use custom policy** if you want to configure granular rules in the Defender Portal.


* **Enable Policy:** Set to **On**.

---

### Step 2: Configure the Session Policy in Microsoft Defender

If you chose "Use custom policy" in Step 1, you must define the block rule in the security portal.

* **Navigate to:** [Microsoft Defender Portal](https://security.microsoft.com/) > **Cloud Apps** > **Policies** > **Policy management**.
* **Create Policy:** Select **Session policy**.
* **Session Control Type:** Select **Control file download (with inspection)**.
* **Activity Source (Filters):**
* **App:** Equals your target application.
* **Device Tag:** Does not equal *Intune compliant* or *Hybrid Azure AD joined* (to target unmanaged devices).


* **Actions:**
* Select **Block**.
* **Customize:** Enter your custom block message (e.g., *"Downloads are restricted on unmanaged devices. Please use the Secure Corporate Browser."*).


* **Save:** Click **Create**.

---

### Step 3: Validation (The End-User Experience)

When a user visits the app under this policy:

1. **URL Redirection:** The URL will change to include a suffix (e.g., `*.mcas.ms`). This confirms the session is being proxied.
2. **Monitoring Banner:** A small banner may appear notifying the user that the session is monitored.
3. **The Block:** When the user clicks "Download," the proxy intercepts the request, cancels the transfer, and replaces the file with a small `.txt` file containing your custom error message.

---

### 🔍 Troubleshooting Tips

* **Suffix Check:** If the URL does **not** contain `.mcas.ms`, the session is not hitting the proxy. Re-check your Conditional Access "Client App" and "Session" settings.
* **Policy Conflict:** Ensure no other "Allow" policy is overriding this session control. Defender policies follow a "most restrictive" logic, but Entra policies are additive.
* **App Onboarding:** For non-Microsoft apps, you may need to manually "onboard" the app in Defender under **Settings > Cloud Apps > Connected Apps**.
