# Deploying NovaFacebrasil

## Option 1: Vercel (Recommended)
The easiest way to deploy Next.js apps.

1.  **Push to GitHub**: Ensure your code is in a repository.
2.  **Import to Vercel**: Connect your GitHub account.
3.  **Environment Variables**: Add the following in Vercel Project Settings:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY` (if used server-side)
4.  **Deploy**: Click Deploy.

## Option 2: Docker / Easypanel
For self-hosting or VPS (DigitalOcean, AWS, etc.).

1.  **Build**:
    ```bash
    docker build -t novafacebrasil .
    ```
2.  **Run**:
    ```bash
    docker run -p 3000:3000 \
      -e NEXT_PUBLIC_SUPABASE_URL=your_url \
      -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
      novafacebrasil
    ```

### Easypanel Configuration
1.  Create a standardized **App**.
2.  Source: **GitHub**.
3.  Build Type: **Dockerfile**.
4.  **Environment**: Add your Supabase keys.
5.  **Expose Port**: 3000.
