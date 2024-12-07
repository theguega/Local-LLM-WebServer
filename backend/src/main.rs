use actix_cors::Cors;
use actix_files as fs;
use actix_web::{post, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Deserialize)]
struct ChatRequest {
    message: String,
}

#[derive(Serialize)]
struct ChatResponse {
    response: String,
}

#[derive(Deserialize)]
struct OllamaResponse {
    response: String,
}

#[post("/chat")]
async fn handle_chat(req: web::Json<ChatRequest>) -> impl Responder {
    println!("Received message: {:?}", req.message);

    if req.message.trim().is_empty() {
        eprintln!("Error: Received empty message");
        return HttpResponse::BadRequest().json("Message cannot be empty.");
    }

    let client = reqwest::Client::new();
    let formatted_prompt = format!(
        "Please format your response using markdown when appropriate. \
        Use code blocks with language specification for code. \
        Here's the user's message: {}",
        req.message
    );

    let ollama_request = json!({
        "model": "llama3.2",
        "prompt": formatted_prompt,
        "stream": false
    });

    match client
        .post("http://localhost:11434/api/generate")
        .json(&ollama_request)
        .send()
        .await
    {
        Ok(response) => match response.json::<OllamaResponse>().await {
            Ok(ollama_response) => HttpResponse::Ok().json(ChatResponse {
                response: ollama_response.response,
            }),
            Err(e) => {
                eprintln!("Error parsing Ollama response: {:?}", e);
                HttpResponse::InternalServerError().json("Error processing response from LLM")
            }
        },
        Err(e) => {
            eprintln!("Error calling Ollama: {:?}", e);
            HttpResponse::InternalServerError().json("Error communicating with LLM")
        }
    }
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
