import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function EnterpriseBrowserValidator(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Auth Extension triggered for URL: "${request.url}"`);

    try {
        const body: any = await request.json();
        context.log("Full Entra Request Body: " + JSON.stringify(body, null, 2));

        // Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.7444.235 OpenFin/43.142.101.2 Safari/537.36
        
        // Entra ID sends the User-Agent deep inside the 'data' context
        let userAgent = body?.data?.context?.clientContext?.userAgent || "";
        // 2. Fallback: Check the actual HTTP headers of the request hitting the function
        if (!userAgent) {
            userAgent = request.headers.get('user-agent') || "";
        }
        // 3. Last Resort: Check if Entra passed it in a custom header (sometimes x-ms-client-user-agent)
        if (!userAgent) {
            userAgent = request.headers.get('x-ms-client-user-agent') || "";
        }
        context.log(`User-Agent received: "${userAgent}"`);

        if (userAgent.includes('OpenFin')) {
            // SUCCESS: Allow the login to continue
            return {
                status: 200,
                jsonBody: {
                    data: {
                        "@odata.type": "microsoft.graph.onTokenIssuanceStartResponseData",
                        "actions": [
                            {
                                "@odata.type": "microsoft.graph.tokenIssuanceStart.continueWithDefaultBehavior"
                            }
                        ]
                    }
                }
            };
        } else {
            // FAILURE: Block the user and show a message
            return {
                status: 200,
                jsonBody: {
                    data: {
                        "@odata.type": "microsoft.graph.onTokenIssuanceStartResponseData",
                        "actions": [
                            {
                                "@odata.type": "microsoft.graph.tokenIssuanceStart.showBlockPage",
                                "message": "Access Denied. Please use the official company browser to access this application."
                            }
                        ]
                    }
                }
            };
        }
    } catch (error) {
        context.error("Invalid request body or JSON parsing error");
        return { status: 400, body: "Invalid request" };
    }
};

app.http('EnterpriseBrowserValidator', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: EnterpriseBrowserValidator
});
