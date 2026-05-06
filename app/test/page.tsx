export default function TestPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Env Test</h1>
      <p>{process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
    </div>
  );
}
