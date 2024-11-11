use actix_cors::Cors;
use actix_files as fs;
use actix_web::{post, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct ChatRequest {
    message: String,
}

#[derive(Serialize)]
struct ChatResponse {
    response: String,
}

#[post("/chat")]
async fn handle_chat(req: web::Json<ChatRequest>) -> impl Responder {
    println!("Received message: {:?}", req.message);

    if req.message.trim().is_empty() {
        eprintln!("Error: Received empty message");
        return HttpResponse::BadRequest().json("Message cannot be empty.");
    }

    // Simulated response as a placeholder for the LLM model response
    let fake_response = "This is a simulated response from the LLM model.";

    // Return JSON response or handle error
    HttpResponse::Ok().json(ChatResponse {
        response: fake_response.to_string(),
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting server on http://127.0.0.1:8080");

    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec!["Content-Type"])
            .max_age(3600);

        App::new()
            .wrap(cors)
            .service(handle_chat)
            .service(fs::Files::new("/", "./src/interface").index_file("index.html"))
        // Serve index.html from src/interface
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
