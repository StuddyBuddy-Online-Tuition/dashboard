import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: "public" } }
);

async function main() {
  const email = process.env.NEXTAUTH_DEV_EMAIL; // e.g. "admin@example.com"
  const password = process.env.NEXTAUTH_DEV_PASSWORD; // min 8 chars
  const name = "Admin";
  const role = "admin"; // or "staff"

  if (!email || !password || password.length < 8) {
    console.error("Set email and password (min 8 chars) in the script");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert({ name, email, role, password: hashedPassword })
    .select();

  if (error) {
    console.error("Error creating user:", error);
    process.exit(1);
  }
  console.log("User created successfully:", data);
}
main(); 