from fastapi import FastAPI

app = FastAPI(
    title="Focusly",
    description="Smart Daily Planner for Students",
    version="0.1.0",
)


@app.get("/health")
def health():
    return {"status": "ok"}
