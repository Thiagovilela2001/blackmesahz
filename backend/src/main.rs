use axum::{
    http::HeaderValue,
    routing::get,
    Router,
    Json,
};
use serde::Serialize;
use std::env;
use tower_http::cors::{CorsLayer, Any};

#[derive(Serialize)]
struct NowPlaying {
    artist: String,
    track: String,
    artwork_url: String,
}

async fn now_playing() -> Json<NowPlaying> {
    // For now, return mock data. This can be wired to actual Icecast metadata later.
    Json(NowPlaying {
        artist: "BLACKMESA residents".to_string(),
        track: "LIVE TRANSMISSION".to_string(),
        artwork_url: "".to_string(),
    })
}

#[tokio::main]
async fn main() {
    let allowed_origin = env::var("ALLOWED_ORIGIN")
        .unwrap_or_else(|_| "http://localhost:5173".to_string());
    let cors = CorsLayer::new()
        .allow_origin(allowed_origin.parse::<HeaderValue>().expect("Invalid ALLOWED_ORIGIN"))
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/now-playing", get(now_playing))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    println!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
