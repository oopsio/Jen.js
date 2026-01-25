use std::convert::Infallible;
use std::net::SocketAddr;

use http_body_util::Full;
use hyper::{Request, Response};
use hyper::body::Bytes;
use hyper_util::rt::TokioIo;
use hyper::server::conn::http1;
use tokio::net::TcpListener;

async fn handle(_req: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
    let body = Full::new(Bytes::from("Rust devserver stub running\n"));
    Ok(Response::new(body))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr: SocketAddr = "0.0.0.0:5173".parse()?;
    let listener = TcpListener::bind(addr).await?;
    println!("Rust devserver listening on http://{}", addr);

    loop {
        let (stream, _) = listener.accept().await?;
        let io = TokioIo::new(stream);

        tokio::spawn(async move {
            let service = hyper::service::service_fn(handle);
            if let Err(err) = http1::Builder::new().serve_connection(io, service).await {
                eprintln!("server error: {:?}", err);
            }
        });
    }
}
