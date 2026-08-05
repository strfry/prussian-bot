BIN := $(HOME)/bin/prussian-bot
VERSION := $(shell date +%Y%m%d%H%M%S)
APIKEY := $(shell cat .apikey 2>/dev/null || go version -m $(BIN) 2>/dev/null | sed -n 's/.*main\.apiKey=\([^ ]*\).*/\1/p')

build:
	CGO_ENABLED=0 go build -o prussian-bot -ldflags="-s -w -X main.apiKey=$(APIKEY) -X main.appVersion=$(VERSION)" .

run: build
	./prussian-bot

clean:
	rm -f prussian-bot

# Lokaler Deploy: Service stoppen, Binary ersetzen, Service starten.
# (Das alte Target mit ssh strfry@strfry.org ist tot — der Bot läuft lokal
# als systemd-user-Service, öffentlich erreichbar über prussian.uber.space.)
deploy: build
	systemctl --user stop prussian-bot
	cp prussian-bot $(BIN)
	systemctl --user start prussian-bot
