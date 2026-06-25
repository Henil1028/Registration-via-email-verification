import { createClient } from "@supabase/supabase-js";

const cleanEnvVar = (val) => {
  if (!val) return val;
  return val.replace(/^["']|["']$/g, "").trim();
};

const supabaseUrl = "https://frkozebieculaklazetj.supabase.co";
const serviceRoleKey = cleanEnvVar("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZya296ZWJpZWN1bGFrbGF6ZXRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI2NjcwMywiZXhwIjoyMDk3ODQyNzAzfQ.A9p5ANLP9OvJYNZ5TbOeZ-ikxvV1OEYiopJ5bzLKsF8");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function clearAllUsers() {
  console.log("Fetching all registered users from Supabase Auth...");
  
  try {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("[-] Failed to list users:", listError.message);
      return;
    }

    console.log(`[+] Found ${users.length} user(s).`);

    if (users.length === 0) {
      console.log("[+] No users to delete.");
      return;
    }

    for (const user of users) {
      console.log(`Deleting user: ${user.email} (${user.id})...`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.error(`[-] Failed to delete user ${user.email}:`, deleteError.message);
      } else {
        console.log(`[+] Deleted user ${user.email} successfully.`);
      }
    }

    console.log("\n[+] Finished clearing all users!");
  } catch (err) {
    console.error("[-] Unexpected error occurred:", err);
  }
}

clearAllUsers();
