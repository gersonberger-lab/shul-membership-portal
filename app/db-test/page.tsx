import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function DbTestPage() {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div style={{ padding: 40 }}>
      <h1>Database Test</h1>

      {error ? (
        <pre>{JSON.stringify(error, null, 2)}</pre>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
