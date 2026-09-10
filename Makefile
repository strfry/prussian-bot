BIN := $(HOME)/bin/prussian-bot
VERSION := $(shell date +%Y%m%d%H%M%S)
APIKEY := $(shell cat .apikey 2>/dev/null || go version -m $(BIN) 2>/dev/null | sed -n 's/.*main\.apiKey=\([^ ]*\).*/\1/p')

REMOTE := prussian@prussian.uber.space
REMOTE_BIN := bin/prussian-bot

# @ unterdrückt das Echo, damit der API-Key nicht im Terminal/Log landet.
build:
	@CGO_ENABLED=0 go build -o prussian-bot -ldflags="-s -w -X main.apiKey=$(APIKEY) -X main.appVersion=$(VERSION)" .

# Cross-compile für die Remote (Uberspace = linux/amd64).
build-remote:
	@CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o prussian-bot -ldflags="-s -w -X main.apiKey=$(APIKEY) -X main.appVersion=$(VERSION)" .

run: build
	./prussian-bot

clean:
	rm -f prussian-bot

# Lokaler Deploy: Service stoppen, Binary ersetzen, Service starten.
deploy-local: build
	systemctl --user stop prussian-bot
	cp prussian-bot $(BIN)
	systemctl --user start prussian-bot

# Remote-Deploy nach $(REMOTE): Binary hochladen (atomar via .new + mv,
# damit ein laufender Prozess die Datei nicht blockiert) und den
# systemd-user-Service neu starten.
deploy: build-remote
	scp prussian-bot $(REMOTE):$(REMOTE_BIN).new
	ssh $(REMOTE) 'mv -f $(REMOTE_BIN).new $(REMOTE_BIN) && systemctl --user restart prussian-bot'
