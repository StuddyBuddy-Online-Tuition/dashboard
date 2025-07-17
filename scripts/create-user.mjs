import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    db: {
      schema: "next_auth",
    },
  }
);

async function main() {
  const email = "";
  const password = "";

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert({
      email,
      password: hashedPassword,
      name: "Wan Aqim",
    })
    .select();

  if (error) {
    console.error("Error creating user:", error);
  } else {
    console.log("User created successfully:", data);
  }
}

main(); 