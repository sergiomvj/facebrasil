async function check() {
    const res = await fetch("https://faxpcbjoqotpegqznphf.supabase.co/rest/v1/profiles?limit=1", {
        headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZheHBjYmpvcW90cGVncXpucGhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwMjA5OSwiZXhwIjoyMDg1Nzc4MDk5fQ.mvvzsQh8JvHsF8005c_GIeINX5kxbC-883NZtU0tGtg",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZheHBjYmpvcW90cGVncXpucGhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwMjA5OSwiZXhwIjoyMDg1Nzc4MDk5fQ.mvvzsQh8JvHsF8005c_GIeINX5kxbC-883NZtU0tGtg"
        }
    });
    const data = await res.json();
    console.log(Object.keys(data[0] || {}));
}
check();
