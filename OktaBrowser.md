## 🔒 Browser Enforcement via Okta Identity Engine (OIE)

To secure unmanaged devices, we use a multi-layered approach: **User-Agent Filtering** to restrict access to HERE Enterprise Browser, and **MFA Step-up** to verify the user identity within that trusted session.

### 1. The Global Authentication Policy

We bypass the generic "Any two factors" policy to create a specific enforcement logic based on the browser's `User-Agent`.

* **Navigate to:** `Security` > `Authentication Policies`.
* **Policy Name:** `Enforce-Secure-Browser`
* **Rule 1: Allow Authorized Browser**
* **IF Custom Expression is true:** `request.userAgent.toLowerCase().contains("OpenFin")`
*(Note: Use the specific string your browser binary injects into the header).*
* **THEN Access is:** `Allowed`.
* **Authentication requirement:** `Password + Another factor` (Enforces MFA).


* **Rule 2: Catch-all (Deny Others)**
* **IF User-Agent:** `Any`.
* **THEN Access is:** `Denied`.



---

### 2. Authorization Server Configuration (OIDC)

For OIDC-based applications, the **Authorization Server** must be configured to permit the initial handshake before the Authentication Policy can be evaluated.

* **Navigate to:** `Security` > `API` > `Authorization Servers` > `default`.
* **Access Policies:** Create a policy assigned specifically to your OIDC App.
* **Rule Logic:** * **Grant Type:** `Authorization Code` (standard for web/desktop apps).
* **User:** `Any user assigned to the app`.
* **Note:** Keep this layer broad to ensure the user reaches the Sign-In Widget where your custom "Access Denied" branding can be displayed.

---

### 3. Testing & Validation (System Log)

When testing with unauthorized browsers (Brave/Chrome), use the **System Log** to verify the "Handshake Termination."

* **Filter:** `eventType eq "user.authentication.auth_via_IDP" and outcome.result eq "FAILURE"`
* **Audit Path:** Expand `client` > `rawUserAgent` to ensure the header sent by the unauthorized browser is correctly failing the custom expression logic.

---
