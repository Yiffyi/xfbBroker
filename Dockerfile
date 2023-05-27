FROM denoland/deno:1.32.3
WORKDIR /app
COPY api operator .
ENTRYPOINT ["deno", "run", "--allow-net", "--allow-env", "operator/loop.ts"]
