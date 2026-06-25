async function testRawSignUp() {
  console.log("Sending raw signUp request...");
  
  const url = "https://frkozebieculaklazetj.supabase.co/auth/v1/signup";
  const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZya296ZWJpZWN1bGFrbGF6ZXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjY3MDMsImV4cCI6MjA5Nzg0MjcwM30.fywyZGuaJVV0w-allEpn0Ru6D4pdrZ8zPzUHNHqUrrU";
  
  const payload = {
    email: "testuser_" + Math.random().toString(36).substring(7) + "@example.com",
    password: "SuperSecretPassword123!",
    options: {
      data: {
        full_name: "Test User"
      }
    }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey,
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    console.log("[+] Response status:", res.status);
    console.log("[+] Response status text:", res.statusText);
    
    // Print all headers
    console.log("[+] Response headers:");
    res.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });

    const body = await res.text();
    console.log("[+] Response body:", body);
  } catch (err) {
    console.error("[-] Request failed:", err);
  }
}

testRawSignUp();
