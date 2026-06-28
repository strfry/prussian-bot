APIKEY := $(shell cat .apikey)
VERSION := $(shell date +%Y%m%d%H%M%S)

build:
	CGO_ENABLED=0 go build -o prussian-bot -ldflags="-s -w -X main.apiKey=$(APIKEY) -X main.appVersion=$(VERSION)" .

run: build
	./prussian-bot

clean:
	rm -f prussian-bot

deploy: build
	ssh strfry@strfry.org supervisorctl stop prussian-bot
	scp prussian-bot strfry@strfry.org:bin/
	ssh strfry@strfry.org supervisorctl start prussian-bot
