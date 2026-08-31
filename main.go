package main

import (
	"bytes"
	"embed"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

//go:embed src
var assets embed.FS

var apiKey string
var appVersion string

const openCodeBaseURL = "https://opencode.ai/zen/go/v1"

type logWriter struct {
	http.ResponseWriter
	status int
}

func (w *logWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		start := time.Now()
		lw := &logWriter{ResponseWriter: rw, status: http.StatusOK}
		next.ServeHTTP(lw, r)
		log.Printf("%s %s %d %v", r.Method, r.URL.Path, lw.status, time.Since(start))
	})
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id, Accept, X-MCP-URL")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func cacheControl(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, ".html") {
			// Das Dokument (inkl. Inline-Script) darf NIE aus dem Cache kommen:
			// nur so erreichen normale Reloads immer die aktuelle Version.
			w.Header().Set("Cache-Control", "no-store")
		} else {
			w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		}
		next.ServeHTTP(w, r)
	})
}

func serveIndex(w http.ResponseWriter, r *http.Request) {
	data, err := assets.ReadFile("src/index.html")
	if err != nil {
		http.Error(w, "index not found", http.StatusInternalServerError)
		return
	}
	v := appVersion
	if v == "" {
		v = "dev"
	}
	content := strings.ReplaceAll(string(data), "__VERSION__", v)
	etag := `"` + v + `"`
	w.Header().Set("ETag", etag)
	if r.Header.Get("If-None-Match") == etag {
		w.WriteHeader(http.StatusNotModified)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Write([]byte(content))
}

func handleChat(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if apiKey == "" {
		http.Error(w, "API-Key nicht konfiguriert", http.StatusInternalServerError)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	r.Body.Close()

	target := openCodeBaseURL + "/chat/completions"
	req, err := http.NewRequestWithContext(r.Context(), "POST", target, bytes.NewReader(body))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := http.DefaultTransport.RoundTrip(req)
	if err != nil {
		http.Error(w, "upstream: "+err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		code := resp.StatusCode
		if code == 401 && strings.Contains(string(bodyBytes), "Insufficient balance") {
			code = 402
		}
		for k, v := range resp.Header {
			w.Header()[k] = v
		}
		w.WriteHeader(code)
		w.Write(bodyBytes)
		return
	}

	for k, v := range resp.Header {
		w.Header()[k] = v
	}
	w.WriteHeader(resp.StatusCode)

	buf := make([]byte, 32*1024)
	flusher, canFlush := w.(http.Flusher)
	for {
		n, err := resp.Body.Read(buf)
		if n > 0 {
			w.Write(buf[:n])
			if canFlush {
				flusher.Flush()
			}
		}
		if err != nil {
			break
		}
	}
}

func main() {
	if apiKey == "" {
		log.Fatal("API-Key nicht gesetzt – via .apikey beim Build setzen")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	prefix := "/" + strings.Trim(os.Getenv("PREFIX"), "/")

	sub, err := fs.Sub(assets, "src")
	if err != nil {
		log.Fatal(err)
	}
	fsrv := http.FileServer(http.FS(sub))

	mux := http.NewServeMux()

	if prefix == "/" {
		mux.HandleFunc("/api/chat", handleChat)
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/" {
				serveIndex(w, r)
				return
			}
			fsrv.ServeHTTP(w, r)
		})
	} else {
		mux.HandleFunc(prefix+"/api/chat", handleChat)
		mux.HandleFunc(prefix+"/", func(w http.ResponseWriter, r *http.Request) {
			if strings.TrimPrefix(r.URL.Path, prefix) == "/" || strings.TrimPrefix(r.URL.Path, prefix) == "" {
				serveIndex(w, r)
				return
			}
			http.StripPrefix(prefix, fsrv).ServeHTTP(w, r)
		})
		mux.HandleFunc(prefix, func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, prefix+"/", http.StatusFound)
		})
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/" {
				http.Redirect(w, r, prefix+"/", http.StatusFound)
				return
			}
			fsrv.ServeHTTP(w, r)
		})
	}

	log.Printf("listening on :%s  prefix=%s", port, prefix)
	log.Fatal(http.ListenAndServe(":"+port, cors(logging(cacheControl(mux)))))
}
