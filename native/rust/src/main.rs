# This file is part of Jen.js.
# Copyright (C) 2026 oopsio
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

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