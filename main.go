package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

//go:embed src
var assets embed.FS

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
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id, Accept")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
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
		mux.Handle("/", fsrv)
	} else {
		mux.Handle(prefix+"/", http.StripPrefix(prefix, fsrv))
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
	log.Fatal(http.ListenAndServe(":"+port, cors(logging(mux))))
}
